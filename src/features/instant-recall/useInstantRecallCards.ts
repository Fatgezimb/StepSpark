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
import { seedInstantRecallCards } from "./seed";
import {
  MAX_IMPORT_FILE_BYTES,
  defaultRecallFilters,
  type InstantRecallCard,
  type RecallFilters,
} from "./schema";

export type EditorTab = "editor" | "import" | "shortcuts";

const unsavedMessage = "Save or cancel the current edits before changing cards.";

export function useInstantRecallCards(initialCards: InstantRecallCard[] = seedInstantRecallCards) {
  const [cards, setCards] = useState(initialCards);
  const [filters, setFilters] = useState<RecallFilters>(defaultRecallFilters);
  const [selectedCardId, setSelectedCardId] = useState(initialCards[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const [editingCard, setEditingCard] = useState<InstantRecallCard | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("editor");
  const [editorNotice, setEditorNotice] = useState("");
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? filteredCards[0] ?? cards[0],
    [cards, filteredCards, selectedCardId],
  );
  const tags = useMemo(() => getAllTags(cards), [cards]);
  const summary = useMemo(() => getFilterSummary(cards, filters), [cards, filters]);
  const validationMessage = editingCard ? getCardValidationMessage(editingCard) : "";
  const canSave = Boolean(editingCard) && !validationMessage;

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
    setEditingCard(null);
    setIsDirty(false);
    setEditorNotice("");
    setRevealed(false);
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
  }

  function selectAdjacent(direction: "next" | "previous") {
    if (hasBlockingUnsavedEdits()) {
      return;
    }

    const nextId = getAdjacentCardId(filteredCards, selectedCard?.id ?? selectedCardId, direction);

    if (nextId) {
      setSelectedCardId(nextId);
      setRevealed(false);
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
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    }
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
    tags,
    summary,
    revealed,
    editingCard,
    editorTab,
    editorNotice,
    importText,
    importMessage,
    canSave,
    isDirty,
    validationMessage,
    updateFilters,
    setFilters,
    setEditorTab,
    setImportText,
    setRevealed,
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
    clearFilters: () => setFilters(clearRecallFilters()),
  };
}
