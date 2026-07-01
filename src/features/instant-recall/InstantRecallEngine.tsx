import { useEffect, useMemo, useRef, useState } from "react";
import {
  PlusIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { resolvePublicAsset } from "./assets";
import { clearRecallFilters, getCardTaskPrompt, toggleFilterTag } from "./engine";
import { CardLibraryPanel } from "./components/CardLibrary";
import { CardMetadataRail, CardViewer } from "./components/CardViewer";
import { CardWorkbench } from "./components/CardWorkbench";
import { FilterPanel } from "./components/FilterPanel";
import {
  LocalAnalyticsView,
  MustNotMissQueue,
  PrototypePreviewPanel,
  ReviewQueuePanel,
  SectionHeader,
  TodayDashboard,
  type DashboardSummary,
} from "./components/StudySurfaces";
import type { FluencyRating } from "./review";
import type { InstantRecallCard } from "./schema";
import { useInstantRecallCards } from "./useInstantRecallCards";

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

const keyboardSectionOrder: InstantRecallSection[] = [
  "dashboard",
  "daily-review",
  "card-library",
  "must-not-miss",
  "analytics",
  "card-editor",
  "import-text",
  "concept-map",
  "nbme-challenge",
];

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
  const viewerRef = useRef<HTMLDivElement>(null);
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
      if (isGlobalShortcutBlocked(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const targetIsCardList = event.target instanceof HTMLElement && Boolean(event.target.closest("[data-card-list='true']"));

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

      if (key === "n" || key === "j" || event.key === "ArrowRight") {
        event.preventDefault();
        if (filteredCards.length) {
          selectAdjacent("next");
          focusViewerSoon(viewerRef);
        }
        return;
      }

      if (key === "p" || key === "k" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (filteredCards.length) {
          selectAdjacent("previous");
          focusViewerSoon(viewerRef);
        }
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        if (targetIsCardList) {
          if (filteredCards.length) {
            selectAdjacent(event.key === "ArrowDown" ? "next" : "previous");
            focusViewerSoon(viewerRef);
          }

          return;
        }

        if (onNavigate) {
          onNavigate(getAdjacentSection(activeSection, event.key === "ArrowDown" ? "next" : "previous"));
        } else if (filteredCards.length) {
          selectAdjacent(event.key === "ArrowDown" ? "next" : "previous");
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
  }, [activeSection, closeEditorDraft, exportCards, filteredCards.length, onNavigate, selectAdjacent, selectedCard, setRevealed, startEditingCard]);

  function handlePrint() {
    window.print();
  }

  function handleRelatedConcept(concept: string) {
    setFilters({ ...clearRecallFilters(), query: concept });
    onNavigate?.("card-library");
  }

  function handleOpenCard(cardId: string, nextSection: InstantRecallSection = "dashboard") {
    selectCard(cardId);
    onNavigate?.(nextSection);
    focusViewerSoon(viewerRef);
  }

  function handleCreateCard() {
    startNewCard();
    onNavigate?.("card-editor");
  }

  const selectedReview = selectedCard ? reviews[selectedCard.id] : undefined;
  const sectionMeta = getSectionMeta(activeSection);

  const workspace = (
    <section className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Instant Recall learning workspace">
      <div ref={viewerRef} className="min-w-0 scroll-mt-24 focus-visible:outline-none" tabIndex={-1}>
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
        reviews={reviews}
        selectedCardId={selectedCard?.id ?? ""}
        onSelect={(cardId) => handleOpenCard(cardId, "card-library")}
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
          <ReviewQueuePanel reviewMetrics={reviewMetrics} selectedCardId={selectedCard?.id ?? ""} onSelect={(cardId) => handleOpenCard(cardId, "daily-review")} />
        </div>
      );
    }

    if (activeSection === "card-library") {
      return (
        <section className="grid gap-3 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]" aria-label="Library browser and selected card">
          {filtersAndLibrary}
          {workspace}
        </section>
      );
    }

    if (activeSection === "must-not-miss") {
      return (
        <section className="grid gap-3 xl:grid-cols-[minmax(24rem,0.88fr)_minmax(0,1.12fr)]">
          <MustNotMissQueue cards={cards} reviews={reviews} selectedCardId={selectedCard?.id ?? ""} onSelect={(cardId) => handleOpenCard(cardId, "must-not-miss")} />
          {workspace}
        </section>
      );
    }

    if (activeSection === "analytics") {
      return (
        <LocalAnalyticsView cards={cards} reviews={reviews} reviewMetrics={reviewMetrics} />
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
      return (
        <PrototypePreviewPanel
          title="Concept Map"
          cards={cards}
          description="A planned graph view for organ systems, tags, mechanisms, and related concepts."
          previewItems={["Map systems to tags and visual cues", "Jump from concept nodes into real card review", "No graph database or generated relationships are active yet"]}
        />
      );
    }

    if (activeSection === "nbme-challenge") {
      return (
        <PrototypePreviewPanel
          title="NBME Challenge"
          cards={cards}
          description="A planned challenge mode for turning reviewed concepts into NBME-style practice stems."
          previewItems={["No AI question generation is active", "Future stems must use reviewed content and citations", "Current prototype only previews workflow shape"]}
        />
      );
    }

    if (activeSection === "notifications") {
      return <PrototypePreviewPanel title="Notifications" cards={cards} description="Planned review reminders and local study nudges will live here." />;
    }

    if (activeSection === "preferences") {
      return <PrototypePreviewPanel title="Preferences" cards={cards} description="Theme, density, keyboard, and local data preferences are planned for this surface." />;
    }

    if (activeSection === "learning-compass") {
      return <PrototypePreviewPanel title="Learning Compass" cards={cards} description="A planned orientation view for weak systems, high-yield gaps, and next best study actions." />;
    }

    return (
      <>
        <TodayDashboard
          summary={summary}
          cards={cards}
          reviews={reviews}
          reviewMetrics={reviewMetrics}
          selectedCard={selectedCard}
          selectedReview={selectedReview}
          onStartReview={() => onNavigate?.("daily-review")}
          onBrowseLibrary={() => onNavigate?.("card-library")}
          onCreateCard={handleCreateCard}
          onImportDeck={() => onNavigate?.("import-text")}
        />

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]" aria-label="Primary review cockpit">
          {workspace}
          <ReviewQueuePanel
            title="Due Next"
            description="Select a due card, review it, then save confidence and fluency."
            reviewMetrics={reviewMetrics}
            selectedCardId={selectedCard?.id ?? ""}
            onSelect={(cardId) => handleOpenCard(cardId, "dashboard")}
          />
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(26rem,1.2fr)_minmax(20rem,0.8fr)]" aria-label="Browse and priority modules">
          <CardLibraryPanel
            cards={filteredCards.slice(0, 6)}
            totalCards={cards.length}
            reviews={reviews}
            selectedCardId={selectedCard?.id ?? ""}
            onSelect={(cardId) => handleOpenCard(cardId, "dashboard")}
          />
          <MustNotMissQueue cards={cards} reviews={reviews} selectedCardId={selectedCard?.id ?? ""} onSelect={(cardId) => handleOpenCard(cardId, "dashboard")} />
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.86fr)]" aria-label="Local analytics and authoring">
          <LocalAnalyticsView cards={cards} reviews={reviews} reviewMetrics={reviewMetrics} />
          {workbench}
        </section>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DraftSafetyBanner warning={storageWarning} />
      <SectionHeader title={sectionMeta.title} description={sectionMeta.description} />
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

function getSectionMeta(section: InstantRecallSection) {
  const copy: Record<InstantRecallSection, { title: string; description: string }> = {
    dashboard: {
      title: "Today",
      description: "Start here: review due cards, see risk signals, and jump into the card library when you need targeted practice.",
    },
    "daily-review": {
      title: "Review",
      description: "A focused recall cockpit for the selected card: predict, reveal, explain, then save confidence and fluency locally.",
    },
    "card-library": {
      title: "Library",
      description: "Search and filter the local deck by task, trap, visual availability, system, difficulty, status, tags, and review state.",
    },
    "must-not-miss": {
      title: "Must Not Miss",
      description: "High-risk concepts surfaced from the current deck using difficulty and tag signals.",
    },
    analytics: {
      title: "Progress",
      description: "Prototype analytics derived from deck composition and local review state.",
    },
    "card-editor": {
      title: "Card Editor",
      description: "Create or edit draft cards, including the learner-facing task prompt and medical review metadata.",
    },
    "import-text": {
      title: "Import from Text",
      description: "Import, merge, replace, export, or reset the local JSON deck while preserving schema validation.",
    },
    "concept-map": {
      title: "Concept Map",
      description: "Explore the current deck context by system, tag, mechanism, and related card signals. Full graph view is planned.",
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
  const primaryMedia = card.visualMedia[0];

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
        <div className="mt-4">
          <div className="text-xs font-bold uppercase text-violet-200">Your task</div>
          <p className="mt-1 text-sm font-bold leading-5 text-white">{getCardTaskPrompt(card)}</p>
        </div>
        {primaryMedia ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white">
            <img src={resolvePublicAsset(primaryMedia.imageUrl)} alt="" className="h-40 w-full object-contain" />
          </div>
        ) : null}
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-xs font-bold uppercase text-sky-200">Clinical scenario</div>
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
    ["← / →", "Previous / Next Card"],
    ["↑ / ↓", "Move Cards / Sections"],
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

function getAdjacentSection(section: InstantRecallSection, direction: "next" | "previous") {
  const currentIndex = Math.max(0, keyboardSectionOrder.indexOf(section));
  const offset = direction === "next" ? 1 : -1;
  const nextIndex = (currentIndex + offset + keyboardSectionOrder.length) % keyboardSectionOrder.length;

  return keyboardSectionOrder[nextIndex] ?? "dashboard";
}

function focusViewerSoon(ref: { current: HTMLElement | null }) {
  window.setTimeout(() => {
    ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    ref.current?.focus({ preventScroll: true });
  }, 0);
}

function isGlobalShortcutBlocked(target: EventTarget | null) {
  if (document.body.dataset.stepsparkModalOpen === "true") {
    return true;
  }

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable ||
    Boolean(target.closest("[role='dialog'], [role='combobox'], [role='listbox'], [data-command-search='true']"))
  );
}
