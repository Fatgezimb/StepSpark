import { useEffect, useMemo, useState } from "react";
import {
  clearRecallFilters,
  createCardDraft,
  deleteCard,
  duplicateCard,
  filterCards,
  getAdjacentCardId,
  getAllTags,
  getCardValidationMessage,
  getFilterSummary,
  parseCardImport,
  serializeCards,
  upsertCard,
} from "./engine";
import {
  buildSubmittedReview,
  getReviewMetrics,
  toggleBookmarkReview,
  type FluencyRating,
} from "./review";
import { seedInstantRecallCards } from "./seed";
import {
  MAX_IMPORT_FILE_BYTES,
  defaultRecallFilters,
  type InstantRecallCard,
  type RecallFilters,
} from "./schema";
import {
  clearInstantRecallStorage,
  loadPersistedCards,
  loadPersistedReviews,
  persistCards,
  persistReviews,
} from "./storage";

export type EditorTab = "editor" | "import" | "shortcuts";

const unsavedMessage = "Save or cancel the current edits before changing cards.";

export function useInstantRecallCards(initialCards: InstantRecallCard[] = seedInstantRecallCards) {
  const [storedCards] = useState(() => loadPersistedCards(initialCards));
  const [storedReviews] = useState(() => loadPersistedReviews());
  const [cards, setCards] = useState(storedCards.cards);
  const [reviews, setReviews] = useState(storedReviews.reviews);
  const [filters, setFilters] = useState<RecallFilters>(defaultRecallFilters);
  const [selectedCardId, setSelectedCardId] = useState(storedCards.cards[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const [editingCard, setEditingCard] = useState<InstantRecallCard | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("editor");
  const [editorNotice, setEditorNotice] = useState("");
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [storageWarning, setStorageWarning] = useState(
    [storedCards.warning, storedReviews.warning].filter(Boolean).join(" "),
  );
  const [reviewMessage, setReviewMessage] = useState("");

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const selectedCard = useMemo(
    () => filteredCards.find((card) => card.id === selectedCardId) ?? filteredCards[0] ?? null,
    [filteredCards, selectedCardId],
  );
  const tags = useMemo(() => getAllTags(cards), [cards]);
  const summary = useMemo(() => getFilterSummary(cards, filters), [cards, filters]);
  const reviewMetrics = useMemo(() => getReviewMetrics(cards, reviews), [cards, reviews]);
  const validationMessage = editingCard ? getCardValidationMessage(editingCard) : "";
  const canSave = Boolean(editingCard) && !validationMessage;

  useEffect(() => {
    persistCards(cards);
  }, [cards]);

  useEffect(() => {
    persistReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    if (filteredCards.length > 0 && !filteredCards.some((card) => card.id === selectedCardId)) {
      setSelectedCardId(filteredCards[0].id);
      setRevealed(false);
    }
  }, [filteredCards, selectedCardId]);

  function updateFilters(nextFilters: Partial<RecallFilters>) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }

  function selectCard(cardId: string) {
    if (hasBlockingUnsavedEdits(cardId)) {
      return;
    }

    setSelectedCardId(cardId);
    setRevealed(false);
    setEditorNotice("");
    setReviewMessage("");
  }

  function startNewCard() {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    setEditingCard(createCardDraft(cards));
    setIsDirty(false);
    setEditorNotice("");
    setEditorTab("editor");
  }

  function startEditingCard(card: InstantRecallCard) {
    if (hasBlockingUnsavedEdits(card.id)) {
      return;
    }

    setEditingCard(card);
    setIsDirty(false);
    setEditorNotice("");
    setEditorTab("editor");
  }

  function updateEditingCard(card: InstantRecallCard) {
    setEditingCard(card);
    setIsDirty(true);
    setEditorNotice("");
  }

  function saveEditingCard() {
    if (!editingCard) {
      return;
    }

    try {
      const nextCards = upsertCard(cards, editingCard);
      setCards(nextCards);
      setSelectedCardId(editingCard.id);
      setEditingCard(null);
      setIsDirty(false);
      setEditorNotice("");
      setRevealed(false);
      setReviewMessage("");
    } catch (error) {
      setEditorNotice(error instanceof Error ? error.message : "Card could not be saved.");
    }
  }

  function cancelEditingCard() {
    setEditingCard(null);
    setIsDirty(false);
    setEditorNotice("");
  }

  function closeEditorDraft() {
    if (editingCard && isDirty) {
      setEditorNotice(unsavedMessage);
      setEditorTab("editor");
      return;
    }

    cancelEditingCard();
  }

  function removeSelectedCard() {
    if (!selectedCard) {
      return;
    }

    const nextCards = deleteCard(cards, selectedCard.id);
    setCards(nextCards);
    setSelectedCardId(nextCards[0]?.id ?? "");
    setReviews((current) => {
      const { [selectedCard.id]: _removed, ...remainingReviews } = current;
      return remainingReviews;
    });
    setEditingCard(null);
    setIsDirty(false);
    setEditorNotice("");
    setRevealed(false);
    setReviewMessage("");
  }

  function duplicateSelectedCard() {
    if (!selectedCard || hasBlockingUnsavedEdits()) {
      return;
    }

    const duplicated = duplicateCard(cards, selectedCard);
    setCards([duplicated, ...cards]);
    setSelectedCardId(duplicated.id);
    setEditingCard(duplicated);
    setIsDirty(false);
    setEditorNotice("");
    setEditorTab("editor");
    setRevealed(false);
    setReviewMessage("");
  }

  function selectAdjacent(direction: "next" | "previous") {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    const nextId = getAdjacentCardId(filteredCards, selectedCard?.id ?? selectedCardId, direction);

    if (nextId) {
      setSelectedCardId(nextId);
      setRevealed(false);
      setReviewMessage("");
    }
  }

  function exportCards() {
    const blob = new Blob([serializeCards(cards)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stepspark-instant-recall-cards.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function mergeImportedCards() {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    try {
      const importedCards = parseCardImport(importText);
      const importedById = new Map(importedCards.map((card) => [card.id, card]));
      const remainingCards = cards.filter((card) => !importedById.has(card.id));
      const nextCards = [...importedCards, ...remainingCards];
      setCards(nextCards);
      setSelectedCardId(importedCards[0]?.id ?? nextCards[0]?.id ?? "");
      setImportMessage(`Imported ${importedCards.length} card${importedCards.length === 1 ? "" : "s"}.`);
      setImportText("");
      setRevealed(false);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  function replaceWithImportedCards() {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    try {
      const importedCards = parseCardImport(importText);
      setCards(importedCards);
      setSelectedCardId(importedCards[0]?.id ?? "");
      setEditingCard(null);
      setIsDirty(false);
      setImportMessage(`Replaced deck with ${importedCards.length} card${importedCards.length === 1 ? "" : "s"}.`);
      setImportText("");
      setRevealed(false);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  function resetToSeed() {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    clearInstantRecallStorage();
    setCards(initialCards);
    setReviews({});
    setFilters(clearRecallFilters());
    setSelectedCardId(initialCards[0]?.id ?? "");
    setEditingCard(null);
    setIsDirty(false);
    setRevealed(false);
    setStorageWarning("");
    setImportMessage("Local deck and review progress were reset to the draft seed deck.");
    setReviewMessage("");
  }

  function submitReview(cardId: string, confidence: number, fluency: FluencyRating) {
    const card = cards.find((item) => item.id === cardId);

    if (!card) {
      return;
    }

    setReviews((current) => ({
      ...current,
      [cardId]: buildSubmittedReview(card, current[cardId], confidence, fluency),
    }));
    setRevealed(true);
    setReviewMessage("Review saved locally for this browser.");
  }

  function toggleBookmark(cardId: string) {
    setReviews((current) => ({
      ...current,
      [cardId]: toggleBookmarkReview(current[cardId]),
    }));
  }

  async function readImportFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setImportMessage(`File is too large. Maximum supported size is ${MAX_IMPORT_FILE_BYTES.toLocaleString()} bytes.`);
      return;
    }

    setImportText(await file.text());
    setImportMessage(`Loaded ${file.name}. Review JSON before importing.`);
  }

  function hasBlockingUnsavedEdits(nextCardId?: string) {
    if (!editingCard || !isDirty || nextCardId === editingCard.id) {
      return false;
    }

    setEditorNotice(unsavedMessage);
    setEditorTab("editor");
    return true;
  }

  return {
    cards,
    filters,
    filteredCards,
    selectedCard,
    selectedCardId,
    reviews,
    reviewMetrics,
    tags,
    summary,
    revealed,
    editingCard,
    editorTab,
    editorNotice,
    importText,
    importMessage,
    storageWarning,
    reviewMessage,
    canSave,
    isDirty,
    validationMessage,
    updateFilters,
    setFilters,
    setEditorTab,
    setImportText,
    setRevealed,
    setStorageWarning,
    selectCard,
    selectAdjacent,
    startNewCard,
    startEditingCard,
    updateEditingCard,
    saveEditingCard,
    cancelEditingCard,
    closeEditorDraft,
    removeSelectedCard,
    duplicateSelectedCard,
    exportCards,
    mergeImportedCards,
    replaceWithImportedCards,
    readImportFile,
    resetToSeed,
    submitReview,
    toggleBookmark,
    clearFilters: () => setFilters(clearRecallFilters()),
  };
}
