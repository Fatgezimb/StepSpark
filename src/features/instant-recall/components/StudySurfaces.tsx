import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenCheckIcon,
  ClockIcon,
  DatabaseIcon,
  FileJsonIcon,
  FlameIcon,
  GaugeIcon,
  ImportIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import { getCardTaskPrompt } from "../engine";
import { getFluencyScore, type CardReviewState, type ReviewMetrics, type ReviewStateMap } from "../review";
import type { InstantRecallCard } from "../schema";
import { formatOption } from "./format";
import { StatusBadge } from "./StatusBadge";

type SparkIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

export type DashboardSummary = {
  total: number;
  filtered: number;
  draft: number;
  reviewed: number;
};

export function SectionHeader({
  eyebrow = "Current section",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="spark-panel rounded-2xl p-4 sm:p-5" aria-label={title}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase text-sky-300">{eyebrow}</div>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

export function TodayDashboard({
  summary,
  cards,
  reviews,
  reviewMetrics,
  selectedCard,
  selectedReview,
  onStartReview,
  onBrowseLibrary,
  onCreateCard,
  onImportDeck,
}: {
  summary: DashboardSummary;
  cards: InstantRecallCard[];
  reviews: ReviewStateMap;
  reviewMetrics: ReviewMetrics;
  selectedCard: InstantRecallCard | null;
  selectedReview?: CardReviewState;
  onStartReview: () => void;
  onBrowseLibrary: () => void;
  onCreateCard: () => void;
  onImportDeck: () => void;
}) {
  const highRiskCount = getHighRiskCards(cards, reviews).length;
  const estimatedMinutes = getEstimatedMinutes(reviewMetrics);
  const weakestSystem = formatSystemCompact(getWeakestSystem(cards, reviews));

  return (
    <section className="spark-mission-panel rounded-3xl p-4 sm:p-5" aria-label="Today's StepSpark Mission">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-300/22 bg-cyan-400/12 text-cyan-100" variant="outline">Today</Badge>
            <Badge className="border-amber-300/22 bg-amber-400/12 text-amber-100" variant="outline">Local prototype</Badge>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-[1.05] text-white sm:text-4xl">
            Today's StepSpark Mission
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Review due visual cards, mark confidence and fluency, then use the library to target weak systems. All progress is stored locally in this browser.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button size="lg" onClick={onStartReview} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <BookOpenCheckIcon data-icon="inline-start" />
              Start Review
            </Button>
            <Button size="lg" variant="outline" className="border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/10" onClick={onBrowseLibrary}>
              <SearchIcon data-icon="inline-start" />
              Browse Library
            </Button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Due cards" value={String(reviewMetrics.dueToday)} icon={ClockIcon} tone="cyan" />
            <MetricCard label="Reviewed today" value={String(reviewMetrics.reviewedToday)} icon={BookOpenCheckIcon} tone="emerald" />
            <MetricCard label="Weakest system" value={weakestSystem} icon={GaugeIcon} tone="violet" />
            <MetricCard label="Must-not-miss" value={String(highRiskCount)} icon={ShieldAlertIcon} tone="rose" />
            <MetricCard label="Est. review" value={`${estimatedMinutes} min`} icon={FlameIcon} tone="amber" />
          </div>
        </div>

        <Card className="border-white/10 bg-slate-950/55 shadow-none">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <TargetIcon className="size-5 text-cyan-300" aria-hidden="true" />
              Current Card
            </CardTitle>
            <CardDescription className="text-slate-400">The next review target visible in the cockpit.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {selectedCard ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedCard.status} />
                  <Badge variant="outline">{selectedCard.system}</Badge>
                  <Badge variant="secondary">{formatDifficulty(selectedCard.difficulty)}</Badge>
                  {selectedReview?.fluency ? <FluencyChip fluency={selectedReview.fluency} /> : null}
                </div>
                <div>
                  <div className="text-lg font-black leading-tight text-white">{selectedCard.title}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{getCardTaskPrompt(selectedCard)}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{selectedCard.trap}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="font-bold uppercase text-slate-500">Visual cue</div>
                    <div className="mt-1 line-clamp-2 text-slate-200">{selectedCard.visualCue}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="font-bold uppercase text-slate-500">Deck state</div>
                    <div className="mt-1 text-slate-200">{summary.reviewed} reviewed / {summary.draft} draft</div>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState title="No selected card" description="Clear filters or import a deck to choose a card." />
            )}
          </CardContent>
          <CardFooter className="grid gap-2 sm:grid-cols-2">
            <Button onClick={onStartReview}>
              Review Card
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onBrowseLibrary}>
              Open Library
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <QuickAction icon={PlusIcon} label="Create Card" description="Start a draft with review metadata." onClick={onCreateCard} />
        <QuickAction icon={ImportIcon} label="Import Deck" description="Validate JSON before merge or replace." onClick={onImportDeck} />
        <QuickAction icon={DatabaseIcon} label="Local Only" description="No backend, auth, or cloud sync active." />
        <QuickAction icon={FileJsonIcon} label="Draft Content" description="Medical review required before production use." />
      </div>
    </section>
  );
}

export function ReviewQueuePanel({
  reviewMetrics,
  selectedCardId,
  onSelect,
  title = "Daily Review Queue",
  description,
}: {
  reviewMetrics: ReviewMetrics;
  selectedCardId: string;
  onSelect: (cardId: string) => void;
  title?: string;
  description?: string;
}) {
  const estimatedMinutes = getEstimatedMinutes(reviewMetrics);

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BookOpenCheckIcon className="size-5 text-emerald-300" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {description ?? `${reviewMetrics.dueToday} cards due · estimated ${estimatedMinutes} min.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2" data-card-list="true">
        {reviewMetrics.queue.length === 0 ? (
          <EmptyState title="No due cards" description="Nothing is due based on local review state. Browse the library or create a new card." />
        ) : reviewMetrics.queue.slice(0, 8).map(({ card, estimateSeconds, review }) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Open review card ${card.title}`}
            onClick={() => onSelect(card.id)}
            className={cn(
              "group rounded-xl border p-3 text-left transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25",
              selectedCardId === card.id ? "border-cyan-300/35 bg-cyan-400/10 shadow-card" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-100">{card.title}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{getCardTaskPrompt(card)}</div>
              </div>
              <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs font-bold text-slate-300">{estimateSeconds}s</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="outline">{card.system}</Badge>
              <Badge variant="secondary">{formatDifficulty(card.difficulty)}</Badge>
              {review?.fluency ? <FluencyChip fluency={review.fluency} /> : <Badge variant="outline">New</Badge>}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export function MustNotMissQueue({
  cards,
  reviews,
  selectedCardId,
  onSelect,
}: {
  cards: InstantRecallCard[];
  reviews: ReviewStateMap;
  selectedCardId: string;
  onSelect: (cardId: string) => void;
}) {
  const highRiskCards = getHighRiskCards(cards, reviews);

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ShieldAlertIcon className="size-5 text-rose-300" aria-hidden="true" />
          Must Not Miss Queue
        </CardTitle>
        <CardDescription className="text-slate-400">
          Hard, bookmarked, red-fluency, and high-yield risk cards from local data.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3" data-card-list="true">
        {highRiskCards.length ? highRiskCards.map(({ card, reason, review }) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-rose-400/25",
              selectedCardId === card.id ? "border-rose-300/35 bg-rose-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
            )}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-rose-300/24 bg-rose-500/12 text-rose-100" variant="outline">{reason}</Badge>
                  <Badge variant="outline">{card.system}</Badge>
                  <Badge variant="secondary">{formatDifficulty(card.difficulty)}</Badge>
                  {review?.fluency ? <FluencyChip fluency={review.fluency} /> : null}
                </div>
                <div className="mt-3 text-lg font-black leading-tight text-white">{card.title}</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{getCardTaskPrompt(card)}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-200">
                Review
                <ArrowRightIcon className="size-3" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <RiskDetail label="Trap" value={card.trap} tone="amber" />
              <RiskDetail label="Visual cue" value={card.visualCue} tone="cyan" />
            </div>
          </button>
        )) : (
          <EmptyState title="No high-risk cards yet" description="Hard, bookmarked, or red-fluency cards will appear here after local review activity." />
        )}
      </CardContent>
    </Card>
  );
}

export function LocalAnalyticsView({
  cards,
  reviews,
  reviewMetrics,
}: {
  cards: InstantRecallCard[];
  reviews: ReviewStateMap;
  reviewMetrics: ReviewMetrics;
}) {
  const systems = getSystemCounts(cards);
  const maxSystemCount = Math.max(...systems.map(([, count]) => count), 1);
  const reviewedCount = cards.filter((card) => reviews[card.id]?.lastReviewedAt).length;
  const unreviewedCount = Math.max(0, cards.length - reviewedCount);
  const weakAreas = getWeakAreas(cards, reviews);

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BarChart3Icon className="size-5 text-sky-300" aria-hidden="true" />
          Local Progress
        </CardTitle>
        <CardDescription className="text-slate-400">Honest metrics derived only from this browser's deck and review state.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Reviewed" value={`${reviewedCount}/${cards.length}`} icon={BookOpenCheckIcon} tone="emerald" />
          <MetricCard label="Unreviewed" value={String(unreviewedCount)} icon={LayersIcon} tone="slate" />
          <MetricCard label="Due load" value={String(reviewMetrics.dueToday)} icon={ClockIcon} tone="cyan" />
          <MetricCard label="Avg fluency" value={`${reviewMetrics.averageFluency}%`} icon={GaugeIcon} tone="violet" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-xs font-bold uppercase text-slate-400">Deck composition by system</div>
            <div className="grid gap-3">
              {systems.map(([system, count]) => (
                <div key={system}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-300">{system}</span>
                    <span className="text-slate-500">{count} card{count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(12, (count / maxSystemCount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs font-bold uppercase text-slate-400">Fluency distribution</div>
              <div className="mt-3 grid gap-2">
                <DistributionRow label="Red" count={reviewMetrics.redCount} className="bg-rose-400" />
                <DistributionRow label="Yellow" count={reviewMetrics.yellowCount} className="bg-amber-400" />
                <DistributionRow label="Green" count={reviewMetrics.greenCount} className="bg-emerald-400" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs font-bold uppercase text-slate-400">Weak areas</div>
              <div className="mt-3 grid gap-2">
                {weakAreas.map(([system, score]) => (
                  <div key={system} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-300">{system}</span>
                    <span className="font-bold text-amber-200">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-sky-300/16 bg-sky-400/[0.07] p-3 text-sm leading-6 text-sky-100">
          These analytics are local-only prototype signals. They do not represent cloud sync, class benchmarking, or medically reviewed performance analytics.
        </div>
      </CardContent>
    </Card>
  );
}

export function PrototypePreviewPanel({
  title,
  description,
  cards,
  previewItems,
}: {
  title: string;
  description: string;
  cards: InstantRecallCard[];
  previewItems?: string[];
}) {
  const systems = Array.from(new Set(cards.map((card) => card.system))).slice(0, 6);
  const items = previewItems ?? [
    "Uses current deck metadata only",
    "No backend, generation, or scoring is active",
    "Designed preview for future workflow planning",
  ];

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <SparklesIcon className="size-5 text-violet-300" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-amber-300/18 bg-amber-400/[0.08] p-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-amber-100">
            <AlertTriangleIcon className="size-4" aria-hidden="true" />
            Prototype only
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-50">
            This surface is intentionally non-operational. It previews direction without implying unavailable production functionality.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="text-xs font-bold uppercase text-slate-400">Preview scope</div>
          <div className="mt-3 grid gap-2">
            {items.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">{cards.length} cards</Badge>
            {systems.map((system) => (
              <Badge key={system} variant="secondary">{system}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-5 text-center">
      <div className="text-sm font-bold text-slate-100">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: SparkIcon;
  tone: "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate";
}) {
  return (
    <div className={cn("rounded-xl border p-3", metricToneClass(tone))}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[0.68rem] font-black uppercase text-slate-400">{label}</div>
        <Icon className="size-4 text-current opacity-85" aria-hidden="true" />
      </div>
      <div className="mt-2 truncate text-2xl font-black leading-none text-white">{value}</div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: SparkIcon;
  label: string;
  description: string;
  onClick?: () => void;
}) {
  const className = cn(
    "rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left transition-colors",
    onClick && "hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-cyan-400/25",
  );
  const content = (
    <>
      <div className="flex items-center gap-2 text-sm font-black text-slate-100">
        <Icon className="size-4 text-cyan-300" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}

function RiskDetail({ label, value, tone }: { label: string; value: string; tone: "amber" | "cyan" }) {
  return (
    <div className={cn("rounded-xl border p-3", tone === "amber" ? "border-amber-300/18 bg-amber-400/[0.07]" : "border-cyan-300/18 bg-cyan-400/[0.07]")}>
      <div className={cn("text-[0.68rem] font-black uppercase", tone === "amber" ? "text-amber-200" : "text-cyan-200")}>{label}</div>
      <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-200">{value}</div>
    </div>
  );
}

function DistributionRow({ label, count, className }: { label: string; count: number; className: string }) {
  const width = `${Math.max(count ? 12 : 4, Math.min(100, count * 24))}%`;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-slate-400">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div className={cn("h-full rounded-full", className)} style={{ width }} />
      </div>
    </div>
  );
}

function FluencyChip({ fluency }: { fluency: CardReviewState["fluency"] }) {
  if (!fluency) {
    return null;
  }

  const classes = {
    red: "border-rose-300/24 bg-rose-500/12 text-rose-100",
    yellow: "border-amber-300/24 bg-amber-500/12 text-amber-100",
    green: "border-emerald-300/24 bg-emerald-500/12 text-emerald-100",
  }[fluency];

  return <Badge className={classes} variant="outline">{formatOption(fluency)} fluency</Badge>;
}

function getHighRiskCards(cards: InstantRecallCard[], reviews: ReviewStateMap) {
  const riskCards: Array<{ card: InstantRecallCard; reason: string; review?: CardReviewState }> = [];

  cards.forEach((card) => {
    const review = reviews[card.id];
    const reason = review?.fluency === "red"
      ? "Red fluency"
      : review?.bookmarked
        ? "Bookmarked"
        : card.difficulty === "hard"
          ? "Hard card"
          : card.tags.includes("oncology")
            ? "High-yield risk"
            : "";

    if (reason) {
      riskCards.push({ card, reason, ...(review ? { review } : {}) });
    }
  });

  return riskCards.sort((a, b) => getRiskRank(a.reason) - getRiskRank(b.reason) || a.card.system.localeCompare(b.card.system) || a.card.title.localeCompare(b.card.title));
}

function getRiskRank(reason: string) {
  return reason === "Red fluency" ? 0 : reason === "Bookmarked" ? 1 : reason === "Hard card" ? 2 : 3;
}

function getWeakestSystem(cards: InstantRecallCard[], reviews: ReviewStateMap) {
  const reviewedBySystem = new Map<string, { count: number; score: number }>();

  cards.forEach((card) => {
    const review = reviews[card.id];

    if (!review?.fluency) {
      return;
    }

    const previous = reviewedBySystem.get(card.system) ?? { count: 0, score: 0 };
    reviewedBySystem.set(card.system, {
      count: previous.count + 1,
      score: previous.score + getFluencyScore(review.fluency),
    });
  });

  if (!reviewedBySystem.size) {
    const hardSystem = cards.find((card) => card.difficulty === "hard")?.system;
    return hardSystem ?? "Not enough data";
  }

  return Array.from(reviewedBySystem.entries())
    .map(([system, value]) => [system, Math.round(value.score / value.count)] as const)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "Not enough data";
}

function getWeakAreas(cards: InstantRecallCard[], reviews: ReviewStateMap) {
  const systems = new Map<string, { count: number; score: number }>();

  cards.forEach((card) => {
    const review = reviews[card.id];
    const score = review?.fluency ? getFluencyScore(review.fluency) : card.difficulty === "hard" ? 40 : card.difficulty === "medium" ? 60 : 80;
    const previous = systems.get(card.system) ?? { count: 0, score: 0 };
    systems.set(card.system, { count: previous.count + 1, score: previous.score + score });
  });

  return Array.from(systems.entries())
    .map(([system, value]) => [system, Math.round(value.score / value.count)] as const)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, 4);
}

function getSystemCounts(cards: InstantRecallCard[]) {
  const counts = new Map<string, number>();
  cards.forEach((card) => counts.set(card.system, (counts.get(card.system) ?? 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function getEstimatedMinutes(reviewMetrics: ReviewMetrics) {
  return Math.max(1, Math.round(reviewMetrics.queue.reduce((total, item) => total + item.estimateSeconds, 0) / 60));
}

function formatDifficulty(difficulty: InstantRecallCard["difficulty"]) {
  return difficulty === "easy" ? "Low" : difficulty === "medium" ? "Medium" : "High";
}

function formatSystemCompact(system: string) {
  const labels: Record<string, string> = {
    cardiovascular: "Cardio",
    endocrine: "Endo",
    gastrointestinal: "GI",
    hematology: "Heme",
    immunology: "Immuno",
    microbiology: "Micro",
    musculoskeletal: "MSK",
    neurology: "Neuro",
    renal: "Renal",
  };

  return labels[system.toLowerCase()] ?? system;
}

function metricToneClass(tone: "cyan" | "emerald" | "amber" | "rose" | "violet" | "slate") {
  const classes = {
    cyan: "border-cyan-300/18 bg-cyan-400/[0.075] text-cyan-200",
    emerald: "border-emerald-300/18 bg-emerald-400/[0.075] text-emerald-200",
    amber: "border-amber-300/18 bg-amber-400/[0.075] text-amber-200",
    rose: "border-rose-300/18 bg-rose-400/[0.075] text-rose-200",
    violet: "border-violet-300/18 bg-violet-400/[0.075] text-violet-200",
    slate: "border-white/10 bg-white/[0.035] text-slate-300",
  };

  return classes[tone];
}
