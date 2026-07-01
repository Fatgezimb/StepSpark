import { describe, expect, it } from "vitest";
import {
  buildSubmittedReview,
  getReviewMetrics,
} from "./review";
import {
  duplicateCard,
  filterCards,
  getAdjacentCardId,
  getCardTaskPrompt,
  getCardValidationMessage,
  parseCardImport,
  parseTags,
  serializeCards,
  upsertCard,
} from "./engine";
import { resolvePublicAsset } from "./assets";
import { seedInstantRecallCards } from "./seed";
import { CARD_SCHEMA_VERSION, DECK_SCHEMA_VERSION, instantRecallCardSchema } from "./schema";

describe("Instant Recall card engine", () => {
  it("normalizes and deduplicates tags", () => {
    expect(parseTags(" Histology, rapid recognition, histology, red blood cells ")).toEqual([
      "histology",
      "rapid-recognition",
      "red-blood-cells",
    ]);
  });

  it("filters cards by query, system, difficulty, status, and tags", () => {
    const filtered = filterCards(seedInstantRecallCards, {
      query: "owl-eye",
      system: "Hematology",
      difficulty: "medium",
      status: "draft",
      tags: ["histology"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe("Reed-Sternberg Recognition");
  });

  it("accepts optional task prompts and derives a clear fallback", () => {
    const cardWithTask = instantRecallCardSchema.parse(seedInstantRecallCards[0]);
    const { taskPrompt, ...cardWithoutTask } = seedInstantRecallCards[1]!;
    const parsedWithoutTask = instantRecallCardSchema.parse(cardWithoutTask);

    expect(taskPrompt).toBeTruthy();
    expect(getCardTaskPrompt(cardWithTask)).toContain("lymphoma pattern");
    expect(parsedWithoutTask.taskPrompt).toBeUndefined();
    expect(getCardTaskPrompt(parsedWithoutTask)).toContain("Inspect the visual and clinical stem");
  });

  it("wraps adjacent card navigation", () => {
    expect(getAdjacentCardId(seedInstantRecallCards, "irc-001", "previous")).toBe("irc-010");
    expect(getAdjacentCardId(seedInstantRecallCards, "irc-010", "next")).toBe("irc-001");
  });

  it("serializes a validated deck with the expected schema version", () => {
    const parsed = JSON.parse(serializeCards(seedInstantRecallCards)) as {
      schema: string;
      cards: Array<{ schemaVersion: string }>;
    };

    expect(parsed.schema).toBe(DECK_SCHEMA_VERSION);
    expect(parsed.cards).toHaveLength(10);
    expect(parsed.cards[0]?.schemaVersion).toBe(CARD_SCHEMA_VERSION);
  });

  it("normalizes legacy imported cards and adds required metadata", () => {
    const imported = parseCardImport(
      JSON.stringify([
        {
          id: "legacy-1",
          title: "Legacy Card",
          frontPrompt: "Prompt",
          visualCue: "Cue",
          answer: "Answer",
          explanation: "Explanation",
          trap: "Trap",
          system: "Bad system",
          discipline: "Pathology",
          difficulty: "bad",
          status: "bad",
          tags: ["Upper Case Tag"],
          sourceNote: "Imported source.",
          createdAt: "2026-06-28T00:00:00.000Z",
          updatedAt: "2026-06-28T00:00:00.000Z",
        },
      ]),
    );

    expect(imported[0]).toMatchObject({
      schemaVersion: CARD_SCHEMA_VERSION,
      system: "Pathology",
      difficulty: "medium",
      status: "draft",
      provenance: "imported",
      contentVersion: 1,
      tags: ["upper-case-tag"],
    });
    expect(imported[0]?.learningObjective).toContain("Imported card requires");
    expect(imported[0]?.citations[0]?.label).toBe("Imported deck");
  });

  it("preserves imported task prompts when provided", () => {
    const [imported] = parseCardImport(
      JSON.stringify([
        {
          id: "task-import-1",
          title: "Task Import",
          taskPrompt: "Identify the mechanism from the visual clue.",
          frontPrompt: "Prompt",
          visualCue: "Cue",
          answer: "Answer",
          explanation: "Explanation",
          trap: "Trap",
          system: "Pathology",
          discipline: "Pathology",
          difficulty: "medium",
          status: "draft",
          tags: [],
          sourceNote: "Imported source.",
          createdAt: "2026-06-28T00:00:00.000Z",
          updatedAt: "2026-06-28T00:00:00.000Z",
        },
      ]),
    );

    expect(imported?.taskPrompt).toBe("Identify the mechanism from the visual clue.");
  });

  it("rejects malformed imports with actionable errors", () => {
    expect(() => parseCardImport("{")).toThrow("Import JSON could not be parsed");
    expect(() => parseCardImport(JSON.stringify({ cards: ["bad"] }))).toThrow(
      "Card 1: every imported card must be an object",
    );
    expect(() => parseCardImport(JSON.stringify([{ title: "" }]))).toThrow("Card 1");
  });

  it("duplicates cards as author-entered draft content", () => {
    const duplicated = duplicateCard(seedInstantRecallCards, seedInstantRecallCards[0]!);

    expect(duplicated.id).not.toBe(seedInstantRecallCards[0]?.id);
    expect(duplicated.status).toBe("draft");
    expect(duplicated.provenance).toBe("author-entered");
    expect(duplicated.contentVersion).toBe(1);
    expect(duplicated.reviewer).toBe("");
  });

  it("requires reviewer metadata before a card can be reviewed", () => {
    const reviewedWithoutReviewer = {
      ...seedInstantRecallCards[0]!,
      status: "reviewed" as const,
      reviewer: "",
      reviewedAt: undefined,
    };

    expect(getCardValidationMessage(reviewedWithoutReviewer)).toContain(
      "Reviewed cards require a named medical reviewer",
    );
  });

  it("stamps reviewedAt when a reviewed card has a named reviewer", () => {
    const reviewedWithReviewer = {
      ...seedInstantRecallCards[0]!,
      status: "reviewed" as const,
      reviewer: "Medical Reviewer",
      reviewedAt: undefined,
    };

    const [saved] = upsertCard(seedInstantRecallCards, reviewedWithReviewer);

    expect(saved?.status).toBe("reviewed");
    expect(saved?.reviewer).toBe("Medical Reviewer");
    expect(saved?.reviewedAt).toEqual(expect.any(String));
  });

  it("rejects AI-generated cards from being marked reviewed", () => {
    const aiGeneratedReviewedCard = {
      ...seedInstantRecallCards[0]!,
      status: "reviewed" as const,
      provenance: "ai-generated" as const,
      reviewer: "Medical Reviewer",
      reviewedAt: "2026-06-28T00:00:00.000Z",
    };

    expect(getCardValidationMessage(aiGeneratedReviewedCard)).toContain(
      "AI-generated cards must be converted",
    );
  });

  it("resolves local public media under the configured Vite base path", () => {
    expect(resolvePublicAsset("/media/instant-recall/digeorge-3-4-pouches.svg", "/StepSpark/")).toBe(
      "/StepSpark/media/instant-recall/digeorge-3-4-pouches.svg",
    );
    expect(resolvePublicAsset("https://example.com/image.png", "/StepSpark/")).toBe("https://example.com/image.png");
  });

  it("derives review metrics from local review state", () => {
    const firstCard = seedInstantRecallCards[0]!;
    const review = buildSubmittedReview(firstCard, undefined, 5, "green", new Date().toISOString());
    const metrics = getReviewMetrics(seedInstantRecallCards, { [firstCard.id]: review });

    expect(metrics.reviewedToday).toBe(1);
    expect(metrics.correctToday).toBe(1);
    expect(metrics.greenCount).toBe(1);
    expect(metrics.averageFluency).toBe(100);
    expect(metrics.dueToday).toBe(seedInstantRecallCards.length - 1);
  });
});
