import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  BookOpenCheckIcon,
  BrainCircuitIcon,
  PlusIcon,
  ShieldAlertIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import { clearRecallFilters, toggleFilterTag } from "./engine";
import { CardLibraryPanel } from "./components/CardLibrary";
import { CardMetadataRail, CardViewer } from "./components/CardViewer";
import { CardWorkbench } from "./components/CardWorkbench";
import { FilterPanel } from "./components/FilterPanel";
import type { FluencyRating, ReviewMetrics } from "./review";
import type { InstantRecallCard } from "./schema";
import { useInstantRecallCards } from "./useInstantRecallCards";

type DashboardSummary = {
  total: number;
  filtered: number;
  draft: number;
  reviewed: number;
};

export type InstantRecallSection =
  | "dashboard"
  | "daily-review"
  | "card-library"
  | "must-not-miss"
  | "analytics"
  | "card-editor"
  | "import-text"
  | "concept-map"
  | "nbme-challenge"
  | "notifications"
  | "preferences"
  | "learning-compass";

export type InstantRecallCardsState = ReturnType<typeof useInstantRecallCards>;

type InstantRecallEngineProps = {
  activeSection?: InstantRecallSection;
  cardsState?: InstantRecallCardsState;
  onNavigate?: (section: InstantRecallSection) => void;
};

export function InstantRecallEngine(props: InstantRecallEngineProps = {}) {
  if (props.cardsState) {
    return <InstantRecallEngineContent {...props} cardsState={props.cardsState} />;
  }

  return <StandaloneInstantRecallEngine {...props} />;
}

function StandaloneInstantRecallEngine(props: Omit<InstantRecallEngineProps, "cardsState">) {
  const cardsState = useInstantRecallCards();

  return <InstantRecallEngineContent {...props} cardsState={cardsState} />;
}

function InstantRecallEngineContent({
  activeSection = "dashboard",
  cardsState,
  onNavigate,
}: {
  activeSection?: InstantRecallSection;
  cardsState: InstantRecallCardsState;
  onNavigate?: (section: InstantRecallSection) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [confidence, setConfidence] = useState(5);
  const [fluency, setFluency] = useState<FluencyRating>("yellow");
  const {
    cards,
    filters,
    filteredCards,
    selectedCard,
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
    resetToSeed,
    submitReview,
    toggleBookmark,
    clearFilters,
  } = cardsState;

  const selectedIndex = useMemo(() => {
    if (!selectedCard) {
      return 0;
    }

    const index = filteredCards.findIndex((card) => card.id === selectedCard.id);
    return index >= 0 ? index : 0;
  }, [filteredCards, selectedCard]);

  useEffect(() => {
    if (activeSection === "card-editor") {
      setEditorTab("editor");
    }

    if (activeSection === "import-text") {
      setEditorTab("import");
    }
  }, [activeSection, setEditorTab]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    const review = reviews[selectedCard.id];
    setConfidence(review?.confidence ?? 5);
    setFluency(review?.fluency ?? "yellow");
  }, [reviews, selectedCard]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        if (selectedCard) {
          setRevealed((current) => !current);
        }
        return;
      }

      if (["1", "2", "3", "4", "5"].includes(event.key)) {
        event.preventDefault();
        setConfidence(Number(event.key));
        return;
      }

      if (key === "r" || key === "y" || key === "g") {
        event.preventDefault();
        setFluency(key === "r" ? "red" : key === "y" ? "yellow" : "green");
        return;
      }

      if (key === "n" || key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        if (filteredCards.length) {
          selectAdjacent("next");
        }
        return;
      }

      if (key === "p" || key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        if (filteredCards.length) {
          selectAdjacent("previous");
        }
        return;
      }

      if (key === "e" && selectedCard) {
        event.preventDefault();
        startEditingCard(selectedCard);
        return;
      }

      if (key === "f") {
        event.preventDefault();
        if (selectedCard) {
          setRevealed((current) => !current);
        }
        return;
      }

      if (key === "x") {
        event.preventDefault();
        exportCards();
        return;
      }

      if (event.key === "Escape") {
        closeEditorDraft();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeEditorDraft, exportCards, filteredCards.length, selectAdjacent, selectedCard, setRevealed, startEditingCard]);

  function handlePrint() {
    window.print();
  }

  function handleRelatedConcept(concept: string) {
    setFilters({ ...clearRecallFilters(), query: concept });
    onNavigate?.("card-library");
  }

  const selectedReview = selectedCard ? reviews[selectedCard.id] : undefined;
  const sectionMeta = getSectionMeta(activeSection);

  const workspace = (
    <section className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Instant Recall learning workspace">
      <div className="min-w-0">
        {selectedCard ? (
          <CardViewer
            card={selectedCard}
            revealed={revealed}
            confidence={confidence}
            fluency={fluency}
            bookmarked={Boolean(selectedReview?.bookmarked)}
            reviewMessage={reviewMessage}
            cardIndex={selectedIndex}
            totalCards={filteredCards.length}
            onToggleReveal={() => setRevealed((current) => !current)}
            onPrevious={() => selectAdjacent("previous")}
            onNext={() => selectAdjacent("next")}
            onEdit={() => startEditingCard(selectedCard)}
            onDuplicate={duplicateSelectedCard}
            onDelete={removeSelectedCard}
            onBookmark={() => toggleBookmark(selectedCard.id)}
            onPrint={handlePrint}
            onSubmitReview={() => submitReview(selectedCard.id, confidence, fluency)}
            onConfidenceChange={setConfidence}
            onFluencyChange={setFluency}
          />
        ) : cards.length === 0 ? (
          <EmptyDeckCard onNew={startNewCard} />
        ) : (
          <NoMatchingCardsCard filteredCount={filteredCards.length} totalCount={cards.length} onClear={clearFilters} />
        )}
      </div>
      {selectedCard ? (
        <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_minmax(16rem,0.85fr)] 2xl:grid-cols-1">
          <CardMetadataRail
            card={selectedCard}
            bookmarked={Boolean(selectedReview?.bookmarked)}
            onEdit={() => startEditingCard(selectedCard)}
            onDuplicate={duplicateSelectedCard}
            onBookmark={() => toggleBookmark(selectedCard.id)}
            onPrint={handlePrint}
            onExport={exportCards}
            onRelatedConcept={handleRelatedConcept}
          />
          <MobileStudyPreview card={selectedCard} revealed={revealed} cardIndex={selectedIndex} totalCards={filteredCards.length} />
        </div>
      ) : null}
    </section>
  );

  const filtersAndLibrary = (
    <section className="grid gap-3 xl:grid-cols-[minmax(18rem,0.62fr)_minmax(0,1.38fr)]" aria-label="Card library filters and results">
      <FilterPanel
        filters={filters}
        tags={tags}
        searchRef={searchRef}
        onFiltersChange={updateFilters}
        onToggleTag={(tag) => setFilters((current) => toggleFilterTag(current, tag))}
        onReset={clearFilters}
        onShowShortcuts={() => setEditorTab("shortcuts")}
      />
      <CardLibraryPanel
        cards={filteredCards}
        totalCards={cards.length}
        selectedCardId={selectedCard?.id ?? ""}
        onSelect={(cardId) => {
          selectCard(cardId);
          onNavigate?.("dashboard");
        }}
      />
    </section>
  );

  const workbench = (
    <CardWorkbench
      editorTab={editorTab}
      editingCard={editingCard}
      selectedCard={selectedCard}
      canSave={canSave}
      validationMessage={validationMessage}
      editorNotice={editorNotice}
      importText={importText}
      importMessage={importMessage}
      onTabChange={setEditorTab}
      onEditSelected={() => selectedCard && startEditingCard(selectedCard)}
      onEditingCardChange={updateEditingCard}
      onSave={saveEditingCard}
      onCancel={cancelEditingCard}
      onNew={startNewCard}
      onImportTextChange={setImportText}
      onReadFile={readImportFile}
      onMerge={mergeImportedCards}
      onReplace={replaceWithImportedCards}
      onExport={exportCards}
      onResetToSeed={resetToSeed}
    />
  );

  function renderSection() {
    if (activeSection === "daily-review") {
      return (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-3">{workspace}</div>
          <DailyReviewQueue reviewMetrics={reviewMetrics} selectedCardId={selectedCard?.id ?? ""} onSelect={selectCard} />
        </div>
      );
    }

    if (activeSection === "card-library") {
      return filtersAndLibrary;
    }

    if (activeSection === "must-not-miss") {
      return (
        <section className="grid gap-3 xl:grid-cols-[minmax(20rem,0.6fr)_minmax(0,1.4fr)]">
          <MustNotMissConcepts cards={cards} />
          <CardLibraryPanel
            cards={cards.filter((card) => card.difficulty === "hard" || card.tags.includes("oncology")).slice(0, 12)}
            totalCards={cards.length}
            selectedCardId={selectedCard?.id ?? ""}
            onSelect={(cardId) => {
              selectCard(cardId);
              onNavigate?.("dashboard");
            }}
          />
        </section>
      );
    }

    if (activeSection === "analytics") {
      return (
        <section className="grid gap-3 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
          <DashboardPreview summary={summary} cards={cards} reviewMetrics={reviewMetrics} />
          <AnalyticsPreview cards={cards} reviewMetrics={reviewMetrics} />
        </section>
      );
    }

    if (activeSection === "card-editor" || activeSection === "import-text") {
      return (
        <section className="grid gap-3 xl:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
          {workbench}
          {workspace}
        </section>
      );
    }

    if (activeSection === "concept-map") {
      return <ComingSoonPanel title="Concept Map" cards={cards} description="A graph view for organ systems, tags, mechanisms, and related concepts." />;
    }

    if (activeSection === "nbme-challenge") {
      return <ComingSoonPanel title="NBME Challenge" cards={cards} description="A future challenge mode for turning reviewed cards into NBME-style stems." />;
    }

    if (activeSection === "notifications") {
      return <ComingSoonPanel title="Notifications" cards={cards} description="Planned review reminders and local study nudges will live here." />;
    }

    if (activeSection === "preferences") {
      return <ComingSoonPanel title="Preferences" cards={cards} description="Theme, density, keyboard, and local data preferences are planned for this surface." />;
    }

    if (activeSection === "learning-compass") {
      return <ComingSoonPanel title="Learning Compass" cards={cards} description="A future orientation view for weak systems, high-yield gaps, and next best study actions." />;
    }

    return (
      <>
        {workspace}
        <section className="grid gap-3 xl:grid-cols-[minmax(18rem,0.78fr)_minmax(26rem,1.4fr)_minmax(20rem,0.98fr)]" aria-label="Learning dashboard modules">
          <DashboardPreview summary={summary} cards={cards} reviewMetrics={reviewMetrics} />
          <div className="grid min-w-0 gap-3">
            <FilterPanel
              filters={filters}
              tags={tags}
              searchRef={searchRef}
              onFiltersChange={updateFilters}
              onToggleTag={(tag) => setFilters((current) => toggleFilterTag(current, tag))}
              onReset={clearFilters}
              onShowShortcuts={() => setEditorTab("shortcuts")}
            />
            <CardLibraryPanel
              cards={filteredCards}
              totalCards={cards.length}
              selectedCardId={selectedCard?.id ?? ""}
              onSelect={selectCard}
            />
          </div>
          <DailyReviewQueue reviewMetrics={reviewMetrics} selectedCardId={selectedCard?.id ?? ""} onSelect={selectCard} />
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(22rem,1.05fr)_minmax(18rem,0.95fr)_minmax(18rem,0.9fr)]" aria-label="Editor analytics and priority concepts">
          {workbench}
          <AnalyticsPreview cards={cards} reviewMetrics={reviewMetrics} />
          <MustNotMissConcepts cards={cards} />
        </section>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DraftSafetyBanner warning={storageWarning} />
      <SectionHeading title={sectionMeta.title} description={sectionMeta.description} />
      {renderSection()}
      <KeyboardShortcutStrip />
    </div>
  );
}

function EmptyDeckCard({ onNew }: { onNew: () => void }) {
  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader>
        <CardTitle>No cards available</CardTitle>
        <CardDescription>Create or import a card to begin.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onNew}>
          <PlusIcon data-icon="inline-start" />
          New card
        </Button>
      </CardFooter>
    </Card>
  );
}

function NoMatchingCardsCard({
  filteredCount,
  totalCount,
  onClear,
}: {
  filteredCount: number;
  totalCount: number;
  onClear: () => void;
}) {
  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader>
        <CardTitle>No cards match</CardTitle>
        <CardDescription>
          {filteredCount} cards visible from {totalCount} total. Clear filters or try a broader search.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onClear}>
          Clear filters
        </Button>
      </CardFooter>
    </Card>
  );
}

function DraftSafetyBanner({ warning }: { warning: string }) {
  return (
    <section className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-50" aria-label="Content review status">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <strong className="font-bold">Draft educational seed deck.</strong>{" "}
          These Instant Recall Cards are for prototype study workflows and require medical education review before production use.
        </div>
        <Badge className="w-fit border-amber-300/25 bg-amber-400/12 text-amber-100" variant="outline">
          Review pending
        </Badge>
      </div>
      {warning ? <div className="mt-2 text-amber-100" role="status">{warning}</div> : null}
    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <section className="spark-panel rounded-2xl p-4" aria-label="Active section">
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase text-sky-300">Current section</div>
        <h2 className="text-2xl font-bold leading-tight text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </section>
  );
}

function ComingSoonPanel({
  title,
  description,
  cards,
}: {
  title: string;
  description: string;
  cards: InstantRecallCard[];
}) {
  const systems = Array.from(new Set(cards.map((card) => card.system))).slice(0, 6);

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-slate-100">{title}</CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="text-xs font-bold uppercase text-slate-400">Status</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This is intentionally marked as coming soon so the prototype does not imply unavailable learning workflows are active.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="text-xs font-bold uppercase text-slate-400">Current deck context</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{cards.length} draft cards</Badge>
            {systems.map((system) => (
              <Badge key={system} variant="secondary">{system}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPreview({
  summary,
  cards,
  reviewMetrics,
}: {
  summary: DashboardSummary;
  cards: InstantRecallCard[];
  reviewMetrics: ReviewMetrics;
}) {
  const highPriority = cards.filter((card) => card.difficulty === "hard").length;

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ActivityIcon className="size-5 text-sky-300" aria-hidden="true" />
          Dashboard
        </CardTitle>
        <CardDescription className="text-slate-400">At-a-glance spaced repetition and deck quality.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <MetricTile label="Total Cards" value={String(summary.total)} accent="text-sky-200" />
          <MetricTile label="Visible Cards" value={String(summary.filtered)} accent="text-cyan-200" />
          <MetricTile label="Due Today" value={String(reviewMetrics.dueToday)} accent="text-violet-200" />
          <MetricTile label="Must Not Miss" value={String(highPriority)} accent="text-rose-200" />
          <MetricTile label="Avg Fluency" value={`${reviewMetrics.averageFluency}%`} accent="text-emerald-200" />
        </div>
        <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-xs font-bold uppercase text-slate-400">Fluency Overview</div>
          <div className="flex items-end gap-2" aria-hidden="true">
            {[
              reviewMetrics.redCount * 18,
              reviewMetrics.yellowCount * 18,
              reviewMetrics.greenCount * 18,
              reviewMetrics.reviewedToday * 18,
              reviewMetrics.dueToday * 8,
              reviewMetrics.bookmarkedCount * 18,
            ].map((height, index) => (
              <div key={index} className="flex flex-1 items-end rounded bg-white/[0.04]" style={{ height: 72 }}>
                <div className="spark-mini-chart-bar w-full rounded" style={{ height: `${Math.min(100, Math.max(8, height))}%` }} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/[0.18] p-3">
      <div className="text-[0.68rem] font-bold uppercase text-slate-500">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold leading-none", accent)}>{value}</div>
    </div>
  );
}

function DailyReviewQueue({
  reviewMetrics,
  selectedCardId,
  onSelect,
}: {
  reviewMetrics: ReviewMetrics;
  selectedCardId: string;
  onSelect: (cardId: string) => void;
}) {
  const estimatedMinutes = Math.max(1, Math.round(reviewMetrics.queue.reduce((total, item) => total + item.estimateSeconds, 0) / 60));

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BookOpenCheckIcon className="size-5 text-emerald-300" aria-hidden="true" />
          Daily Review Queue
        </CardTitle>
        <CardDescription className="text-slate-400">
          {reviewMetrics.dueToday} cards due today · estimated {estimatedMinutes} min.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {reviewMetrics.queue.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            No cards are due based on the local review state.
          </div>
        ) : reviewMetrics.queue.slice(0, 5).map(({ card, estimateSeconds }) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Open daily review card ${card.title}`}
            onClick={() => onSelect(card.id)}
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25",
              selectedCardId === card.id ? "border-sky-300/28 bg-sky-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-100">{card.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{card.discipline} · {formatDifficulty(card.difficulty)}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-slate-400">{estimateSeconds}s</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function AnalyticsPreview({ cards, reviewMetrics }: { cards: InstantRecallCard[]; reviewMetrics: ReviewMetrics }) {
  const systems = useMemo(() => {
    const counts = new Map<string, number>();
    cards.forEach((card) => counts.set(card.system, (counts.get(card.system) ?? 0) + 1));
    return Array.from(counts.entries()).slice(0, 6);
  }, [cards]);

  const max = Math.max(...systems.map(([, count]) => count), 1);

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BarChart3Icon className="size-5 text-sky-300" aria-hidden="true" />
          Analytics
        </CardTitle>
        <CardDescription className="text-slate-400">Deck composition and review readiness.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {systems.map(([system, count]) => (
            <div key={system}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">{system}</span>
                <span className="font-semibold text-slate-400">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.max(16, (count / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-300">
          Draft cards: <strong className="text-amber-200">{cards.filter((card) => card.status === "draft").length}</strong>. Reviewed cards:{" "}
          <strong className="text-emerald-200">{cards.filter((card) => card.status === "reviewed").length}</strong>. Local review fluency:{" "}
          <strong className="text-sky-200">{reviewMetrics.averageFluency}%</strong>.
        </div>
      </CardContent>
    </Card>
  );
}

function getSectionMeta(section: InstantRecallSection) {
  const copy: Record<InstantRecallSection, { title: string; description: string }> = {
    dashboard: {
      title: "Dashboard",
      description: "Instant Recall workspace with live deck metrics, filters, review queue, editor, analytics, and priority concepts.",
    },
    "daily-review": {
      title: "Daily Review",
      description: "Work through cards due from local review signals, then save confidence and fluency back to this browser.",
    },
    "card-library": {
      title: "Card Library",
      description: "Search, filter, and select cards by system, discipline, difficulty, status, tags, and recognition cues.",
    },
    "must-not-miss": {
      title: "Must Not Miss",
      description: "High-risk concepts surfaced from the current deck using difficulty and tag signals.",
    },
    analytics: {
      title: "Analytics",
      description: "Prototype analytics derived from deck composition and local review state.",
    },
    "card-editor": {
      title: "Card Editor",
      description: "Create or edit draft Instant Recall Cards with schema validation and review metadata.",
    },
    "import-text": {
      title: "Import from Text",
      description: "Import, merge, replace, export, or reset the local JSON deck safely.",
    },
    "concept-map": {
      title: "Concept Map",
      description: "Planned graph workspace for connecting systems, mechanisms, tags, and related cards.",
    },
    "nbme-challenge": {
      title: "NBME Challenge",
      description: "Planned question-generation workflow. No generated medical content is active in this prototype.",
    },
    notifications: {
      title: "Notifications",
      description: "Planned local reminders and review nudges.",
    },
    preferences: {
      title: "Preferences",
      description: "Planned shell and learning preference controls.",
    },
    "learning-compass": {
      title: "Learning Compass",
      description: "Planned weak-area and next-action guidance.",
    },
  };

  return copy[section] ?? copy.dashboard;
}

function MustNotMissConcepts({ cards }: { cards: InstantRecallCard[] }) {
  const concepts = cards
    .filter((card) => card.difficulty !== "easy")
    .slice(0, 7)
    .map((card) => ({
      title: card.title,
      system: card.system,
      count: card.difficulty === "hard" ? 20 : 12,
    }));

  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ShieldAlertIcon className="size-5 text-rose-300" aria-hidden="true" />
          Must Not Miss
        </CardTitle>
        <CardDescription className="text-slate-400">High-yield concepts organized by risk.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {concepts.map((concept) => (
          <div key={concept.title} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-100">{concept.title}</div>
              <div className="mt-1 text-xs text-slate-500">{concept.system}</div>
            </div>
            <Badge className="border-rose-300/16 bg-rose-500/10 text-rose-100" variant="outline">
              {concept.count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MobileStudyPreview({
  card,
  revealed,
  cardIndex,
  totalCards,
}: {
  card: InstantRecallCard;
  revealed: boolean;
  cardIndex: number;
  totalCards: number;
}) {
  return (
    <div className="spark-phone-shell hidden rounded-[2rem] p-3 xl:block 2xl:hidden" aria-label="Mobile card preview">
      <div className="rounded-[1.45rem] border border-white/10 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
          <span>9:41</span>
          <span>{cardIndex + 1} / {totalCards}</span>
        </div>
        <div className="text-lg font-bold leading-tight text-white">{card.title}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="spark-badge spark-badge-gold rounded px-1.5 py-0.5 text-[0.62rem] font-bold">ROI 5</span>
          <span className="spark-badge spark-badge-rose rounded px-1.5 py-0.5 text-[0.62rem] font-bold">Must Not Miss</span>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-xs font-bold uppercase text-sky-200">Clinical Scenario</div>
          <p className="mt-2 line-clamp-5 text-xs leading-5 text-slate-200">{card.frontPrompt}</p>
        </div>
        <div className="mt-3 rounded-xl bg-violet-500/80 px-3 py-2 text-center text-xs font-bold text-white">
          {revealed ? "Answer revealed" : "Reveal Answer · Space"}
        </div>
      </div>
    </div>
  );
}

function KeyboardShortcutStrip() {
  const shortcuts = [
    ["Space", "Reveal Answer"],
    ["1-5", "Confidence"],
    ["R", "Red Fluency"],
    ["Y", "Yellow Fluency"],
    ["G", "Green Fluency"],
    ["N", "Next Card"],
    ["P", "Previous Card"],
    ["E", "Edit Card"],
    ["⌘/Ctrl K", "Command Search"],
  ];

  return (
    <section className="spark-panel grid gap-3 rounded-2xl p-4 xl:grid-cols-[11rem_minmax(0,1fr)]" aria-label="Keyboard shortcuts">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
        <ZapIcon className="size-4 text-violet-300" aria-hidden="true" />
        Keyboard Shortcuts
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {shortcuts.map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-slate-400">
            <kbd className="min-w-10 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-center font-mono text-slate-200">{key}</kbd>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatDifficulty(difficulty: InstantRecallCard["difficulty"]) {
  return difficulty === "easy" ? "Low" : difficulty === "medium" ? "Medium" : "High";
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}
