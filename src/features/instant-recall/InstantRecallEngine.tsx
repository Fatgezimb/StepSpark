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
import { toggleFilterTag } from "./engine";
import { CardLibraryPanel } from "./components/CardLibrary";
import { CardMetadataRail, CardViewer, type FluencyRating } from "./components/CardViewer";
import { CardWorkbench } from "./components/CardWorkbench";
import { FilterPanel } from "./components/FilterPanel";
import type { InstantRecallCard } from "./schema";
import { useInstantRecallCards } from "./useInstantRecallCards";

type DashboardSummary = {
  total: number;
  filtered: number;
  draft: number;
  reviewed: number;
};

export function InstantRecallEngine() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [confidence, setConfidence] = useState(5);
  const [fluency, setFluency] = useState<FluencyRating>("yellow");
  const cardsState = useInstantRecallCards();
  const {
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
        setRevealed((current) => !current);
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
        selectAdjacent("next");
        return;
      }

      if (key === "p" || key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        selectAdjacent("previous");
        return;
      }

      if (key === "e" && selectedCard) {
        event.preventDefault();
        startEditingCard(selectedCard);
        return;
      }

      if (key === "f") {
        event.preventDefault();
        setRevealed((current) => !current);
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
  }, [closeEditorDraft, exportCards, selectAdjacent, selectedCard, setRevealed, startEditingCard]);

  return (
    <div className="flex flex-col gap-3">
      <section className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_18rem]" aria-label="Instant Recall learning workspace">
        <div className="min-w-0">
          {selectedCard ? (
            <CardViewer
              card={selectedCard}
              revealed={revealed}
              confidence={confidence}
              fluency={fluency}
              cardIndex={selectedIndex}
              totalCards={filteredCards.length || cards.length}
              onToggleReveal={() => setRevealed((current) => !current)}
              onPrevious={() => selectAdjacent("previous")}
              onNext={() => selectAdjacent("next")}
              onEdit={() => startEditingCard(selectedCard)}
              onDuplicate={duplicateSelectedCard}
              onDelete={removeSelectedCard}
              onConfidenceChange={setConfidence}
              onFluencyChange={setFluency}
            />
          ) : (
            <EmptyDeckCard onNew={startNewCard} />
          )}
        </div>
        {selectedCard ? (
          <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_minmax(16rem,0.85fr)] 2xl:grid-cols-1">
            <CardMetadataRail
              card={selectedCard}
              onEdit={() => startEditingCard(selectedCard)}
              onDuplicate={duplicateSelectedCard}
              onExport={exportCards}
            />
            <MobileStudyPreview card={selectedCard} revealed={revealed} cardIndex={selectedIndex} totalCards={filteredCards.length || cards.length} />
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(18rem,0.78fr)_minmax(26rem,1.4fr)_minmax(20rem,0.98fr)]" aria-label="Learning dashboard modules">
        <DashboardPreview summary={summary} cards={cards} />
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
        <DailyReviewQueue cards={cards} selectedCardId={selectedCard?.id ?? ""} onSelect={selectCard} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(22rem,1.05fr)_minmax(18rem,0.95fr)_minmax(18rem,0.9fr)]" aria-label="Editor analytics and priority concepts">
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
        />
        <AnalyticsPreview cards={cards} />
        <MustNotMissConcepts cards={cards} />
      </section>

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

function DashboardPreview({ summary, cards }: { summary: DashboardSummary; cards: InstantRecallCard[] }) {
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
          <MetricTile label="Due Today" value="23" accent="text-violet-200" />
          <MetricTile label="Must Not Miss" value={String(highPriority)} accent="text-rose-200" />
          <MetricTile label="Avg Fluency" value="68%" accent="text-emerald-200" />
        </div>
        <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-xs font-bold uppercase text-slate-400">Fluency Overview</div>
          <div className="flex items-end gap-2" aria-hidden="true">
            {[56, 82, 44, 66, 91, 72].map((height, index) => (
              <div key={index} className="flex flex-1 items-end rounded bg-white/[0.04]" style={{ height: 72 }}>
                <div className="spark-mini-chart-bar w-full rounded" style={{ height: `${height}%` }} />
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
  cards,
  selectedCardId,
  onSelect,
}: {
  cards: InstantRecallCard[];
  selectedCardId: string;
  onSelect: (cardId: string) => void;
}) {
  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <BookOpenCheckIcon className="size-5 text-emerald-300" aria-hidden="true" />
          Daily Review Queue
        </CardTitle>
        <CardDescription className="text-slate-400">Seed-card queue preview using existing deck data.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {cards.slice(0, 5).map((card, index) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Open daily review card ${index + 1}`}
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
            <span className="shrink-0 text-xs font-semibold text-slate-400">{24 + index * 7}s</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function AnalyticsPreview({ cards }: { cards: InstantRecallCard[] }) {
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
          <strong className="text-emerald-200">{cards.filter((card) => card.status === "reviewed").length}</strong>.
        </div>
      </CardContent>
    </Card>
  );
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
