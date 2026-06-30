import type { InstantRecallCard } from "./schema";

export type FluencyRating = "red" | "yellow" | "green";

export type CardReviewState = {
  confidence?: number;
  fluency?: FluencyRating;
  lastReviewedAt?: string;
  reviewCount: number;
  bookmarked: boolean;
  averageTimeSeconds?: number;
};

export type ReviewStateMap = Record<string, CardReviewState>;

export type ReviewQueueItem = {
  card: InstantRecallCard;
  due: boolean;
  estimateSeconds: number;
  review?: CardReviewState;
};

export type ReviewMetrics = {
  totalCards: number;
  dueToday: number;
  reviewedToday: number;
  correctToday: number;
  averageFluency: number;
  averageTimeSeconds: number;
  bookmarkedCount: number;
  redCount: number;
  yellowCount: number;
  greenCount: number;
  queue: ReviewQueueItem[];
};

export function buildSubmittedReview(
  card: InstantRecallCard,
  previous: CardReviewState | undefined,
  confidence: number,
  fluency: FluencyRating,
  reviewedAt = new Date().toISOString(),
): CardReviewState {
  const reviewCount = (previous?.reviewCount ?? 0) + 1;

  return {
    ...previous,
    confidence,
    fluency,
    lastReviewedAt: reviewedAt,
    reviewCount,
    bookmarked: previous?.bookmarked ?? false,
    averageTimeSeconds: estimateReviewSeconds(card, { ...previous, confidence, fluency, reviewCount, bookmarked: previous?.bookmarked ?? false }),
  };
}

export function toggleBookmarkReview(previous: CardReviewState | undefined): CardReviewState {
  return {
    ...previous,
    reviewCount: previous?.reviewCount ?? 0,
    bookmarked: !(previous?.bookmarked ?? false),
  };
}

export function getReviewMetrics(cards: InstantRecallCard[], reviews: ReviewStateMap, now = new Date()): ReviewMetrics {
  const queue = cards.map((card) => {
    const review = reviews[card.id];

    return {
      card,
      review,
      due: isCardDue(review, now),
      estimateSeconds: estimateReviewSeconds(card, review),
    };
  });
  const reviewedToday = queue.filter((item) => isSameUtcDate(item.review?.lastReviewedAt, now)).length;
  const correctToday = queue.filter((item) => isSameUtcDate(item.review?.lastReviewedAt, now) && (item.review?.confidence ?? 0) >= 4).length;
  const reviewedWithFluency = queue.filter((item) => item.review?.fluency);
  const averageFluency = reviewedWithFluency.length
    ? Math.round(reviewedWithFluency.reduce((total, item) => total + getFluencyScore(item.review?.fluency), 0) / reviewedWithFluency.length)
    : 0;
  const timedReviews = queue.filter((item) => item.review?.averageTimeSeconds);
  const averageTimeSeconds = timedReviews.length
    ? Math.round(timedReviews.reduce((total, item) => total + (item.review?.averageTimeSeconds ?? 0), 0) / timedReviews.length)
    : Math.round(queue.reduce((total, item) => total + item.estimateSeconds, 0) / Math.max(queue.length, 1));

  return {
    totalCards: cards.length,
    dueToday: queue.filter((item) => item.due).length,
    reviewedToday,
    correctToday,
    averageFluency,
    averageTimeSeconds,
    bookmarkedCount: queue.filter((item) => item.review?.bookmarked).length,
    redCount: queue.filter((item) => item.review?.fluency === "red").length,
    yellowCount: queue.filter((item) => item.review?.fluency === "yellow").length,
    greenCount: queue.filter((item) => item.review?.fluency === "green").length,
    queue: queue
      .filter((item) => item.due)
      .sort((a, b) => a.estimateSeconds - b.estimateSeconds || a.card.title.localeCompare(b.card.title)),
  };
}

export function estimateReviewSeconds(card: InstantRecallCard, review?: CardReviewState) {
  const difficultyBase = {
    easy: 22,
    medium: 30,
    hard: 42,
  }[card.difficulty];
  const confidencePenalty = review?.confidence ? (5 - review.confidence) * 4 : 8;
  const fluencyPenalty = review?.fluency === "red" ? 12 : review?.fluency === "yellow" ? 6 : 0;
  const repetitionCredit = Math.min(review?.reviewCount ?? 0, 5) * 2;

  return Math.max(12, difficultyBase + confidencePenalty + fluencyPenalty - repetitionCredit);
}

export function getFluencyScore(fluency: FluencyRating | undefined) {
  if (fluency === "green") {
    return 100;
  }

  if (fluency === "yellow") {
    return 67;
  }

  if (fluency === "red") {
    return 33;
  }

  return 0;
}

function isCardDue(review: CardReviewState | undefined, now: Date) {
  if (!review?.lastReviewedAt || !review.fluency) {
    return true;
  }

  return getNextReviewDate(review).getTime() <= now.getTime();
}

function getNextReviewDate(review: CardReviewState) {
  const reviewedAt = new Date(review.lastReviewedAt ?? 0);
  const intervalDays = review.fluency === "red" ? 1 : review.fluency === "yellow" ? 3 : 7;

  reviewedAt.setUTCDate(reviewedAt.getUTCDate() + intervalDays);
  return reviewedAt;
}

function isSameUtcDate(value: string | undefined, now: Date) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}
