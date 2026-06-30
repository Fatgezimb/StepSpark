import { z } from "zod";
import {
  CARD_SCHEMA_VERSION,
  DECK_SCHEMA_VERSION,
  MAX_CARDS_PER_IMPORT,
  MAX_IMPORT_FILE_BYTES,
  defaultRecallFilters,
  emptyCardDraft,
  instantRecallCardSchema,
  instantRecallDeckExportSchema,
  recallDifficulties,
  recallMediaKinds,
  recallMediaProvenanceTypes,
  recallProvenanceTypes,
  recallStatuses,
  recallSystems,
  type InstantRecallCard,
  type RecallCitation,
  type RecallFilters,
  type RecallVisualMedia,
} from "./schema";

export function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function parseTags(value: string) {
  return Array.from(new Set(value.split(",").map(normalizeTag).filter(Boolean)));
}

export function formatTags(tags: string[]) {
  return tags.join(", ");
}

export function parseCitations(value: string): RecallCitation[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", url = "", note = ""] = line.split("|").map((part) => part.trim());

      return {
        label,
        ...(url ? { url } : {}),
        ...(note ? { note } : {}),
      };
    });
}

export function formatCitations(citations: RecallCitation[]) {
  return citations
    .map((citation) => [citation.label, citation.url, citation.note].filter(Boolean).join(" | "))
    .join("\n");
}

export function createCardDraft(cards: InstantRecallCard[]): InstantRecallCard {
  const now = new Date().toISOString();

  return validateCard({
    ...emptyCardDraft,
    id: `irc-local-${cards.length + 1}-${Date.now()}`,
    title: "Untitled Instant Recall Card",
    createdAt: now,
    updatedAt: now,
  });
}

export function validateCard(card: InstantRecallCard) {
  return instantRecallCardSchema.parse(card);
}

export function getCardValidationMessage(card: InstantRecallCard) {
  const result = instantRecallCardSchema.safeParse(prepareCardForValidation(card));

  if (result.success) {
    return "";
  }

  return getZodIssueMessage(result.error);
}

export function upsertCard(cards: InstantRecallCard[], card: InstantRecallCard) {
  const exists = cards.some((item) => item.id === card.id);
  const updatedCard = validateCard(prepareCardForValidation({
    ...card,
    contentVersion: exists ? card.contentVersion + 1 : card.contentVersion,
    updatedAt: new Date().toISOString(),
  }));

  if (!exists) {
    return [updatedCard, ...cards];
  }

  return cards.map((item) => (item.id === card.id ? updatedCard : item));
}

export function duplicateCard(cards: InstantRecallCard[], card: InstantRecallCard) {
  const now = new Date().toISOString();

  return validateCard({
    ...card,
    id: `irc-local-${cards.length + 1}-${Date.now()}`,
    title: `${card.title} Copy`,
    status: "draft",
    reviewer: "",
    reviewedAt: undefined,
    contentVersion: 1,
    provenance: "author-entered",
    createdAt: now,
    updatedAt: now,
  });
}

export function deleteCard(cards: InstantRecallCard[], cardId: string) {
  return cards.filter((card) => card.id !== cardId);
}

export function getAllTags(cards: InstantRecallCard[]) {
  return Array.from(new Set(cards.flatMap((card) => card.tags))).sort((a, b) => a.localeCompare(b));
}

export function getFilterSummary(cards: InstantRecallCard[], filters: RecallFilters) {
  return {
    total: cards.length,
    filtered: filterCards(cards, filters).length,
    draft: cards.filter((card) => card.status === "draft").length,
    reviewed: cards.filter((card) => card.status === "reviewed").length,
  };
}

export function filterCards(cards: InstantRecallCard[], filters: RecallFilters) {
  const query = filters.query.trim().toLowerCase();

  return cards.filter((card) => {
    const searchable = [
      card.title,
      card.frontPrompt,
      card.visualCue,
      card.answer,
      card.explanation,
      card.trap,
      card.system,
      card.discipline,
      card.learningObjective,
      card.highYieldRationale,
      card.author,
      card.reviewer,
      card.provenance,
      card.citations.map((citation) => [citation.label, citation.url, citation.note].join(" ")).join(" "),
      card.visualMedia.map((media) => [media.title, media.description, media.kind, media.sourceName, media.useCase].join(" ")).join(" "),
      card.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesSystem = filters.system === "all" || card.system === filters.system;
    const matchesDifficulty = filters.difficulty === "all" || card.difficulty === filters.difficulty;
    const matchesStatus = filters.status === "all" || card.status === filters.status;
    const matchesTags = filters.tags.length === 0 || filters.tags.every((tag) => card.tags.includes(tag));

    return matchesQuery && matchesSystem && matchesDifficulty && matchesStatus && matchesTags;
  });
}

export function toggleFilterTag(filters: RecallFilters, tag: string): RecallFilters {
  const nextTags = filters.tags.includes(tag)
    ? filters.tags.filter((item) => item !== tag)
    : [...filters.tags, tag];

  return { ...filters, tags: nextTags };
}

export function clearRecallFilters(): RecallFilters {
  return { ...defaultRecallFilters, tags: [] };
}

export function getAdjacentCardId(cards: InstantRecallCard[], selectedId: string, direction: "next" | "previous") {
  if (cards.length === 0) {
    return "";
  }

  const currentIndex = Math.max(0, cards.findIndex((card) => card.id === selectedId));
  const offset = direction === "next" ? 1 : -1;
  const nextIndex = (currentIndex + offset + cards.length) % cards.length;

  return cards[nextIndex]?.id ?? cards[0]?.id ?? "";
}

export function serializeCards(cards: InstantRecallCard[]) {
  const deck = instantRecallDeckExportSchema.parse({
    schema: DECK_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    cards: cards.map(prepareCardForValidation),
  });

  return JSON.stringify(deck, null, 2);
}

export function parseCardImport(value: string): InstantRecallCard[] {
  if (getTextByteLength(value) > MAX_IMPORT_FILE_BYTES) {
    throw new Error(`Import is too large. Maximum supported size is ${MAX_IMPORT_FILE_BYTES.toLocaleString()} bytes.`);
  }

  const parsed = parseJson(value);
  const candidateCards = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.cards)
      ? parsed.cards
      : null;

  if (!candidateCards) {
    throw new Error("Import must be an array of cards or an object with a cards array.");
  }

  if (candidateCards.length > MAX_CARDS_PER_IMPORT) {
    throw new Error(`Import contains ${candidateCards.length} cards. Maximum supported count is ${MAX_CARDS_PER_IMPORT}.`);
  }

  return candidateCards.map((card, index) => normalizeImportedCard(card, index));
}

function normalizeImportedCard(value: unknown, index: number): InstantRecallCard {
  if (!isRecord(value)) {
    throw new Error(`Card ${index + 1}: every imported card must be an object.`);
  }

  const now = new Date().toISOString();
  const system = recallSystems.includes(value.system as never)
    ? (value.system as InstantRecallCard["system"])
    : "Pathology";
  const difficulty = recallDifficulties.includes(value.difficulty as never)
    ? (value.difficulty as InstantRecallCard["difficulty"])
    : "medium";
  const status = recallStatuses.includes(value.status as never)
    ? (value.status as InstantRecallCard["status"])
    : "draft";
  const provenance = recallProvenanceTypes.includes(value.provenance as never)
    ? (value.provenance as InstantRecallCard["provenance"])
    : "imported";
  const tags = Array.isArray(value.tags) ? value.tags.map((tag) => normalizeTag(String(tag))).filter(Boolean) : [];
  const normalized = {
    schemaVersion: CARD_SCHEMA_VERSION,
    id: typeof value.id === "string" && value.id.trim() ? value.id : `irc-import-${Date.now()}-${index}`,
    title: asString(value.title, "Untitled Instant Recall Card"),
    frontPrompt: asString(value.frontPrompt, ""),
    visualCue: asString(value.visualCue, ""),
    answer: asString(value.answer, ""),
    explanation: asString(value.explanation, ""),
    trap: asString(value.trap, ""),
    system,
    discipline: asString(value.discipline, "Pathology"),
    difficulty,
    status,
    tags: Array.from(new Set(tags)),
    sourceNote: asString(value.sourceNote, "Imported draft content. Requires review before production use."),
    learningObjective: asString(value.learningObjective, "Imported card requires learning objective review."),
    highYieldRationale: asString(value.highYieldRationale, "Imported card requires high-yield rationale review."),
    citations: normalizeImportedCitations(value.citations),
    visualMedia: normalizeImportedMedia(value.visualMedia),
    author: asString(value.author, "Imported deck"),
    reviewer: asString(value.reviewer, ""),
    reviewedAt: status === "reviewed" ? optionalString(value.reviewedAt) : undefined,
    contentVersion: asPositiveInteger(value.contentVersion, 1),
    provenance,
    createdAt: asString(value.createdAt, now),
    updatedAt: asString(value.updatedAt, now),
  };

  try {
    return instantRecallCardSchema.parse(prepareCardForValidation(normalized as InstantRecallCard));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Card ${index + 1}: ${getZodIssueMessage(error)}`);
    }

    throw error;
  }
}

function prepareCardForValidation(card: InstantRecallCard): InstantRecallCard {
  if (card.status === "reviewed" && card.reviewer.trim() && !card.reviewedAt) {
    return { ...card, reviewer: card.reviewer.trim(), reviewedAt: new Date().toISOString() };
  }

  if (card.status !== "reviewed" && card.reviewedAt) {
    return { ...card, reviewedAt: undefined };
  }

  return card.reviewer === card.reviewer.trim() ? card : { ...card, reviewer: card.reviewer.trim() };
}

function normalizeImportedCitations(value: unknown): RecallCitation[] {
  if (!Array.isArray(value)) {
    return [
      {
        label: "Imported deck",
        note: "Source metadata missing in imported card.",
      },
    ];
  }

  return value
    .map((citation) => {
      if (typeof citation === "string") {
        return { label: citation.trim() };
      }

      if (!isRecord(citation)) {
        return null;
      }

      return {
        label: asString(citation.label, "Imported citation"),
        ...(optionalString(citation.url) ? { url: optionalString(citation.url) } : {}),
        ...(optionalString(citation.note) ? { note: optionalString(citation.note) } : {}),
      };
    })
    .filter((citation): citation is RecallCitation => Boolean(citation?.label));
}

function normalizeImportedMedia(value: unknown): RecallVisualMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((media, index) => {
      if (!isRecord(media)) {
        return null;
      }

      const kind = recallMediaKinds.includes(media.kind as never)
        ? (media.kind as RecallVisualMedia["kind"])
        : "diagram";
      const provenance = recallMediaProvenanceTypes.includes(media.provenance as never)
        ? (media.provenance as RecallVisualMedia["provenance"])
        : "user-provided";

      return {
        id: asString(media.id, `media-import-${index + 1}`),
        kind,
        title: asString(media.title, "Imported visual asset"),
        description: asString(media.description, "Imported media requires source and medical review."),
        imageUrl: asString(media.imageUrl, "/media/instant-recall/placeholder.svg"),
        sourceName: asString(media.sourceName, "Imported deck"),
        ...(optionalString(media.sourceUrl) ? { sourceUrl: optionalString(media.sourceUrl) } : {}),
        license: asString(media.license, "Unverified imported media license"),
        ...(optionalString(media.attribution) ? { attribution: optionalString(media.attribution) } : {}),
        provenance,
        useCase: asString(media.useCase, "Visual support for rapid recognition."),
      };
    })
    .filter((media): media is RecallVisualMedia => Boolean(media));
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new Error("Import JSON could not be parsed.");
  }
}

function getZodIssueMessage(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "card"}: ${issue.message}`).join("; ");
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asPositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

function getTextByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
