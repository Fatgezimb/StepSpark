import { parseCardImport, serializeCards } from "./engine";
import type { CardReviewState, ReviewStateMap } from "./review";
import type { InstantRecallCard } from "./schema";

export const DECK_STORAGE_KEY = "stepspark.instant-recall.deck.v1";
export const REVIEW_STORAGE_KEY = "stepspark.instant-recall.reviews.v1";

type LoadCardsResult = {
  cards: InstantRecallCard[];
  warning: string;
};

type LoadReviewsResult = {
  reviews: ReviewStateMap;
  warning: string;
};

export function loadPersistedCards(fallbackCards: InstantRecallCard[]): LoadCardsResult {
  if (!hasLocalStorage()) {
    return { cards: fallbackCards, warning: "" };
  }

  const raw = window.localStorage.getItem(DECK_STORAGE_KEY);

  if (!raw) {
    return { cards: fallbackCards, warning: "" };
  }

  try {
    return { cards: parseCardImport(raw), warning: "" };
  } catch {
    return {
      cards: fallbackCards,
      warning: "Saved deck data could not be read. StepSpark restored the draft seed deck instead.",
    };
  }
}

export function persistCards(cards: InstantRecallCard[]) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(DECK_STORAGE_KEY, serializeCards(cards));
}

export function loadPersistedReviews(): LoadReviewsResult {
  if (!hasLocalStorage()) {
    return { reviews: {}, warning: "" };
  }

  const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);

  if (!raw) {
    return { reviews: {}, warning: "" };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed) || parsed.schema !== REVIEW_STORAGE_KEY || !isRecord(parsed.reviews)) {
      throw new Error("Invalid review storage shape.");
    }

    return {
      reviews: Object.fromEntries(
        Object.entries(parsed.reviews)
          .map(([cardId, review]) => [cardId, normalizeReview(review)])
          .filter((entry): entry is [string, CardReviewState] => Boolean(entry[1])),
      ),
      warning: "",
    };
  } catch {
    return {
      reviews: {},
      warning: "Saved review progress could not be read. Review metrics were reset for this browser.",
    };
  }
}

export function persistReviews(reviews: ReviewStateMap) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    REVIEW_STORAGE_KEY,
    JSON.stringify(
      {
        schema: REVIEW_STORAGE_KEY,
        updatedAt: new Date().toISOString(),
        reviews,
      },
      null,
      2,
    ),
  );
}

export function clearInstantRecallStorage() {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(DECK_STORAGE_KEY);
  window.localStorage.removeItem(REVIEW_STORAGE_KEY);
}

function normalizeReview(value: unknown): CardReviewState | null {
  if (!isRecord(value)) {
    return null;
  }

  const fluency = value.fluency === "red" || value.fluency === "yellow" || value.fluency === "green" ? value.fluency : undefined;
  const confidence = typeof value.confidence === "number" && value.confidence >= 1 && value.confidence <= 5 ? value.confidence : undefined;
  const lastReviewedAt = typeof value.lastReviewedAt === "string" ? value.lastReviewedAt : undefined;
  const reviewCount = typeof value.reviewCount === "number" && Number.isFinite(value.reviewCount) ? Math.max(0, Math.floor(value.reviewCount)) : 0;
  const averageTimeSeconds = typeof value.averageTimeSeconds === "number" && Number.isFinite(value.averageTimeSeconds)
    ? Math.max(1, Math.round(value.averageTimeSeconds))
    : undefined;

  return {
    ...(confidence ? { confidence } : {}),
    ...(fluency ? { fluency } : {}),
    ...(lastReviewedAt ? { lastReviewedAt } : {}),
    reviewCount,
    bookmarked: Boolean(value.bookmarked),
    ...(averageTimeSeconds ? { averageTimeSeconds } : {}),
  };
}

function hasLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
