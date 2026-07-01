import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenCheckIcon,
  BookmarkIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  FileJsonIcon,
  FlameIcon,
  ImageOffIcon,
  LightbulbIcon,
  Maximize2Icon,
  PenLineIcon,
  PrinterIcon,
  SparklesIcon,
  TargetIcon,
  Trash2Icon,
  TrophyIcon,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";
import { resolvePublicAsset } from "../assets";
import { getCardTaskPrompt } from "../engine";
import type { FluencyRating } from "../review";
import type { InstantRecallCard, RecallVisualMedia } from "../schema";
import { StatusBadge } from "./StatusBadge";

export function CardViewer({
  card,
  revealed,
  confidence,
  fluency,
  bookmarked,
  reviewMessage,
  cardIndex,
  totalCards,
  onToggleReveal,
  onPrevious,
  onNext,
  onEdit,
  onDuplicate,
  onDelete,
  onBookmark,
  onPrint,
  onSubmitReview,
  onConfidenceChange,
  onFluencyChange,
}: {
  card: InstantRecallCard;
  revealed: boolean;
  confidence: number;
  fluency: FluencyRating;
  bookmarked: boolean;
  reviewMessage: string;
  cardIndex: number;
  totalCards: number;
  onToggleReveal: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBookmark: () => void;
  onPrint: () => void;
  onSubmitReview: () => void;
  onConfidenceChange: (confidence: number) => void;
  onFluencyChange: (fluency: FluencyRating) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [predictionNote, setPredictionNote] = useState("");
  const taskPrompt = getCardTaskPrompt(card);
  const clinicalClues = useMemo(() => buildClinicalClues(card), [card]);
  const mechanismSteps = useMemo(() => buildMechanismSteps(card), [card]);
  const whyNotRows = useMemo(() => buildWhyNotRows(card), [card]);
  const primaryMedia = card.visualMedia[0];

  useEffect(() => {
    setConfirmingDelete(false);
    setPredictionNote("");
  }, [card.id]);

  return (
    <article
      className="instant-recall-print-card spark-panel-strong overflow-hidden rounded-2xl"
      aria-labelledby="instant-recall-card-title"
    >
      <header className="border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span>Instant Recall Card</span>
              <span aria-hidden="true">/</span>
              <span>{card.system}</span>
              <span aria-hidden="true">/</span>
              <span>{card.discipline}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 id="instant-recall-card-title" className="spark-card-title text-xl font-bold leading-tight sm:text-2xl">
                {card.title}
              </h1>
              <span className="spark-status-chip spark-badge-gold">ROI 5</span>
              <span className="spark-status-chip spark-badge-rose">Must Not Miss</span>
              <span className="spark-status-chip spark-badge-violet">{formatDifficulty(card.difficulty)}</span>
            </div>
          </div>
          <div className="instant-recall-print-hide flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onPrevious}>
              <ArrowLeftIcon data-icon="inline-start" />
              Previous
            </Button>
            <div className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-300">
              {cardIndex + 1} / {totalCards}
            </div>
            <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onNext}>
              Next
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid min-w-0 gap-3">
          <section className="spark-task-panel rounded-xl p-4 sm:p-5" aria-label="Your task">
            <div className="text-xs font-bold uppercase text-violet-200">Your task</div>
            <h2 className="mt-2 max-w-5xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {taskPrompt}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Read the task, inspect the visual, make a prediction, then reveal the answer and review the rationale.
            </p>
          </section>

          {primaryMedia ? (
            <VisualMediaPanel media={primaryMedia} revealed={revealed} />
          ) : (
            <div className="spark-media-frame rounded-xl p-6 text-sm text-slate-400">
              This card has no visual media yet. Continue with the task and clinical scenario.
            </div>
          )}

          <section className="spark-card-section rounded-xl p-4" aria-label="Clinical scenario">
            <PanelLabel icon={BookOpenCheckIcon} tone="violet">Clinical Scenario</PanelLabel>
            <p className="spark-scenario-text mt-3">{card.frontPrompt}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {clinicalClues.map((clue) => (
                <div key={clue.label} className="spark-clue-card rounded-lg p-3">
                  <div className="text-[0.68rem] font-bold uppercase text-violet-200">{clue.label}</div>
                  <div className="mt-1 line-clamp-3 text-sm font-semibold leading-6 text-slate-100">{clue.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]" aria-label="Prediction and answer">
            <div className="spark-card-section rounded-xl p-4">
              <PanelLabel icon={PenLineIcon} tone="violet">Make Your Prediction</PanelLabel>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Predict the answer before revealing. This note is temporary and stays only on screen.
              </p>
              <textarea
                value={predictionNote}
                onChange={(event) => setPredictionNote(event.target.value)}
                className="mt-3 min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-6 text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25"
                placeholder="Type a quick prediction..."
                aria-label="Temporary prediction note"
              />
              <Button className="instant-recall-print-hide mt-3 w-full shadow-card" variant={revealed ? "secondary" : "default"} onClick={onToggleReveal}>
                {revealed ? <EyeOffIcon data-icon="inline-start" /> : <EyeIcon data-icon="inline-start" />}
                {revealed ? "Hide answer" : "Reveal answer"}
              </Button>
            </div>

            <div className="spark-answer-band rounded-xl p-4 sm:p-5" role="region" aria-label="Recall output">
              <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-emerald-100">
                <TrophyIcon className="size-5" aria-hidden="true" />
                Correct Answer
              </div>
              {revealed ? (
                <div className="mt-3">
                  <div className="text-2xl font-extrabold leading-tight text-emerald-50 sm:text-3xl">{card.answer}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-100">{card.explanation}</p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
                  Answer protected. Press <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-xs">Space</kbd> after you predict.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="grid gap-3 content-start" aria-label="Recall supports">
          <FastRecognitionRule card={card} revealed={revealed} />
          <SupportPanel icon={LightbulbIcon} title="High-Yield Pearl" tone="amber">
            {revealed ? card.highYieldRationale : "Pearl appears after reveal so it does not compete with the task."}
          </SupportPanel>
          <SupportPanel icon={BrainCircuitIcon} title="Memory Hook" tone="violet">
            {buildMemoryHook(card)}
          </SupportPanel>
        </aside>
      </div>

      <section className="grid gap-3 border-t border-white/10 p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)]" aria-label="Review and rationale">
        <div className="grid gap-3">
          {revealed ? (
            <div className="spark-card-section rounded-xl p-4">
              <PanelLabel icon={SparklesIcon} tone="green">Recognition Path</PanelLabel>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,0.95fr)_auto_minmax(0,0.95fr)] sm:items-start">
                {mechanismSteps.map((step, index) => (
                  <MechanismNode key={step.label} label={step.label} detail={step.detail} index={index} isLast={index === mechanismSteps.length - 1} />
                ))}
              </div>
            </div>
          ) : null}

          <section aria-label="Why not the other choices">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase text-sky-200">Why Not The Other Choices?</div>
              {revealed ? <div className="text-xs text-slate-500">Decision aid</div> : null}
            </div>
            {revealed ? (
              <div className="spark-why-table overflow-hidden rounded-xl">
                {whyNotRows.map((row) => (
                  <div key={row.letter} className="spark-table-row grid gap-3 border-b bg-white/[0.022] p-3 text-sm last:border-b-0 md:grid-cols-[2.5rem_minmax(11rem,0.44fr)_minmax(0,1fr)]">
                    <div className="grid size-8 place-items-center rounded-lg border border-sky-300/15 bg-sky-400/10 font-extrabold text-sky-200">{row.letter}</div>
                    <div className="font-semibold text-slate-100">{row.choice}</div>
                    <div className="leading-6 text-slate-300">{row.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-slate-400">
                Distractor explanations appear after reveal so the answer stays protected during active recall.
              </div>
            )}
          </section>
        </div>

        <ReviewControls
          confidence={confidence}
          fluency={fluency}
          reviewMessage={reviewMessage}
          onConfidenceChange={onConfidenceChange}
          onFluencyChange={onFluencyChange}
          onSubmitReview={onSubmitReview}
        />
      </section>

      <footer className="instant-recall-print-hide border-t border-white/10 p-3 sm:p-4">
        {confirmingDelete ? (
          <div className="flex w-full flex-col gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-rose-100" role="status">
              Delete this card from the local deck?
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={onDelete}>
                Confirm delete
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onDuplicate}>
              <CopyIcon data-icon="inline-start" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              className={cn(
                "border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10",
                bookmarked && "border-amber-300/35 bg-amber-400/16 text-amber-100",
              )}
              onClick={onBookmark}
              aria-pressed={bookmarked}
            >
              <BookmarkIcon data-icon="inline-start" />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onPrint}>
              <PrinterIcon data-icon="inline-start" />
              Print
            </Button>
            <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2Icon data-icon="inline-start" />
              Delete
            </Button>
          </div>
        )}
      </footer>
    </article>
  );
}

function PanelLabel({
  icon: Icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: "violet" | "green";
  children: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-bold uppercase", tone === "violet" ? "text-violet-200" : "text-emerald-200")}>
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </div>
  );
}

function VisualMediaPanel({ media, revealed }: { media: RecallVisualMedia; revealed: boolean }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageSource = resolvePublicAsset(media.imageUrl);
  const visibleTitle = revealed ? media.title : "Visual recognition anchor";
  const visibleDescription = revealed ? media.description : media.useCase;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    setEnlarged(false);
  }, [media.id, imageSource]);

  return (
    <figure className="spark-media-frame overflow-hidden rounded-xl">
      <div className="spark-media-canvas relative bg-slate-950">
        {!failed && !loaded ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center shadow-card">
              <div className="mx-auto mb-2 size-7 animate-pulse rounded-full border border-sky-300/30 bg-sky-300/15" aria-hidden="true" />
              <div className="text-sm font-semibold text-slate-100">Loading visual asset</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">The task and clinical scenario remain available while media loads.</div>
            </div>
          </div>
        ) : null}
        {failed ? (
          <VisualFallback />
        ) : (
          <img
            src={imageSource}
            alt={revealed ? media.description : "Medical visual recognition asset for this card"}
            className={cn("h-full w-full object-contain transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(false);
            }}
          />
        )}
      </div>
      <figcaption className="border-t border-white/10 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="spark-status-chip border-sky-300/18 bg-sky-500/10 text-sky-100">{formatMediaKind(media.kind)}</span>
              <span className="text-sm font-bold text-slate-100">{visibleTitle}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{visibleDescription}</p>
            <div className="mt-2 text-[0.68rem] leading-5 text-slate-500">
              Source: {media.sourceName}. License: {media.license}
            </div>
          </div>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            size="sm"
            className="instant-recall-print-hide shrink-0 border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10"
            onClick={() => setEnlarged(true)}
          >
            <Maximize2Icon data-icon="inline-start" />
            View full image
          </Button>
        </div>
      </figcaption>
      {enlarged ? (
        <VisualModal
          media={media}
          imageSource={imageSource}
          imageFailed={failed}
          revealed={revealed}
          titleId={modalTitleId}
          descriptionId={modalDescriptionId}
          closeRef={closeRef}
          onClose={() => setEnlarged(false)}
          returnFocusRef={triggerRef}
        />
      ) : null}
    </figure>
  );
}

function VisualModal({
  media,
  imageSource,
  imageFailed,
  revealed,
  titleId,
  descriptionId,
  closeRef,
  onClose,
  returnFocusRef,
}: {
  media: RecallVisualMedia;
  imageSource: string;
  imageFailed: boolean;
  revealed: boolean;
  titleId: string;
  descriptionId: string;
  closeRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const title = revealed ? media.title : "Visual recognition anchor";
  const description = revealed ? media.description : media.useCase;

  useEffect(() => {
    document.body.dataset.stepsparkModalOpen = "true";
    requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      delete document.body.dataset.stepsparkModalOpen;
      returnFocusRef.current?.focus();
    };
  }, [closeRef, onClose, returnFocusRef]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-3 backdrop-blur-sm" data-stepspark-modal="open">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="spark-visual-dialog max-h-[94dvh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/12 bg-slate-950 shadow-popover"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <div className="mb-1 text-xs font-bold uppercase text-sky-300">{formatMediaKind(media.kind)}</div>
            <h2 id={titleId} className="text-lg font-bold leading-tight text-white sm:text-xl">{title}</h2>
          </div>
          <Button ref={closeRef} variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close enlarged visual">
            <XIcon />
          </Button>
        </div>
        <div className="grid max-h-[calc(94dvh-6rem)] gap-0 overflow-auto lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid min-h-[22rem] place-items-center bg-white p-3 sm:min-h-[34rem]">
            {imageFailed ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-700">
                <ImageOffIcon className="mx-auto mb-3 size-10 text-slate-500" aria-hidden="true" />
                <div className="font-semibold">Visual asset unavailable</div>
                <div className="mt-2 max-w-sm text-sm leading-6">
                  The source and license metadata remain visible. Continue with the task and clinical scenario.
                </div>
              </div>
            ) : (
              <img src={imageSource} alt={revealed ? media.description : "Enlarged medical visual recognition asset"} className="max-h-[72dvh] w-full object-contain" />
            )}
          </div>
          <div className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
            <p id={descriptionId} className="text-sm leading-6 text-slate-200">{description}</p>
            <div className="mt-4 grid gap-3 text-sm">
              <MetadataRow label="Source" value={media.sourceName} />
              <MetadataRow label="License" value={media.license} />
              {media.attribution ? <MetadataRow label="Attribution" value={media.attribution} /> : null}
              {media.sourceUrl ? (
                <a className="text-sm font-medium text-sky-300 underline-offset-4 hover:underline" href={media.sourceUrl} target="_blank" rel="noreferrer">
                  Open source page
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualFallback() {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 p-4 text-center">
      <ImageOffIcon className="size-9 text-sky-300" aria-hidden="true" />
      <div className="text-sm font-semibold text-slate-100">Visual asset unavailable</div>
      <div className="max-w-sm text-xs leading-5 text-slate-500">
        Continue with the task and clinical scenario. Source metadata remains available for review.
      </div>
    </div>
  );
}

function MechanismNode({
  label,
  detail,
  index,
  isLast,
}: {
  label: string;
  detail: string;
  index: number;
  isLast: boolean;
}) {
  return (
    <>
      <div className="flex min-w-0 flex-col items-center text-center">
        <div className={cn(
          "grid size-12 place-items-center rounded-xl border text-lg font-bold shadow-card",
          index === 0 && "border-emerald-300/25 bg-emerald-400/12 text-emerald-200",
          index === 1 && "border-violet-300/25 bg-violet-400/12 text-violet-200",
          index === 2 && "border-amber-300/25 bg-amber-400/12 text-amber-200",
        )}>
          {index === 0 ? <SparklesIcon className="size-5" /> : index === 1 ? <FlameIcon className="size-5" /> : <CheckCircle2Icon className="size-5" />}
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-100">{label}</div>
        <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
      </div>
      {!isLast ? (
        <div className="hidden pt-4 text-slate-500 sm:block" aria-hidden="true">
          <ArrowRightIcon className="size-5" />
        </div>
      ) : null}
    </>
  );
}

function FastRecognitionRule({ card, revealed }: { card: InstantRecallCard; revealed: boolean }) {
  return (
    <div className="spark-rule-band rounded-xl p-3.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-100">
        <TargetIcon className="size-4" aria-hidden="true" />
        Fast Recognition Rule
      </div>
      <div className="mt-3 grid gap-2">
        <div className="rounded-lg border border-teal-200/16 bg-black/20 p-2.5">
          <div className="text-[0.68rem] font-bold uppercase text-teal-200">Pattern</div>
          <p className="mt-1 text-sm font-semibold leading-6 text-white">{card.visualCue}</p>
        </div>
        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase text-teal-200">
          <span className="h-px flex-1 bg-teal-200/20" />
          Think
          <span className="h-px flex-1 bg-teal-200/20" />
        </div>
        <div className="rounded-lg border border-emerald-200/16 bg-emerald-400/10 p-2.5">
          {revealed ? (
            <>
              <div className="text-[0.68rem] font-bold uppercase text-emerald-200">Answer</div>
              <p className="mt-1 text-sm font-extrabold leading-6 text-emerald-50">{card.answer}</p>
            </>
          ) : (
            <>
              <div className="text-[0.68rem] font-bold uppercase text-emerald-200">Prediction</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-100">Name it before reveal.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SupportPanel({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone: "teal" | "amber" | "violet";
  children: ReactNode;
}) {
  const toneClass = {
    teal: "spark-rule-band text-teal-100",
    amber: "spark-warning-band text-amber-100",
    violet: "border-violet-300/18 bg-violet-500/10 text-violet-100",
  }[tone];

  return (
    <div className={cn("rounded-xl p-3.5", toneClass)}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-100">{children}</p>
    </div>
  );
}

function ReviewControls({
  confidence,
  fluency,
  reviewMessage,
  onConfidenceChange,
  onFluencyChange,
  onSubmitReview,
}: {
  confidence: number;
  fluency: FluencyRating;
  reviewMessage: string;
  onConfidenceChange: (confidence: number) => void;
  onFluencyChange: (fluency: FluencyRating) => void;
  onSubmitReview: () => void;
}) {
  return (
    <div className="grid content-start gap-3">
      <div className="spark-card-section rounded-xl p-4">
        <div className="text-xs font-bold uppercase text-slate-400">Confidence</div>
        <div className="mt-3 grid grid-cols-5 gap-2" aria-label="Confidence score">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              aria-pressed={confidence === score}
              onClick={() => onConfidenceChange(score)}
              className={cn(
                "h-10 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25",
                confidence === score
                  ? "border-sky-300/40 bg-sky-400/20 text-sky-100"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10",
              )}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
      <div className="spark-card-section rounded-xl p-4">
        <div className="text-xs font-bold uppercase text-slate-400">Your Fluency</div>
        <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Fluency score">
          <FluencyButton value="red" active={fluency === "red"} label="R" onClick={onFluencyChange} />
          <FluencyButton value="yellow" active={fluency === "yellow"} label="Y" onClick={onFluencyChange} />
          <FluencyButton value="green" active={fluency === "green"} label="G" onClick={onFluencyChange} />
        </div>
      </div>
      <div className="spark-card-section rounded-xl p-4">
        <div className="text-xs font-bold uppercase text-slate-400">Local review state</div>
        <p className="mt-1 text-sm leading-6 text-slate-300">Save the current confidence and fluency for this browser.</p>
        {reviewMessage ? <p className="mt-2 text-sm font-semibold text-emerald-200" role="status">{reviewMessage}</p> : null}
        <Button className="mt-3 w-full" onClick={onSubmitReview}>
          <BookOpenCheckIcon data-icon="inline-start" />
          Save review
        </Button>
      </div>
    </div>
  );
}

function FluencyButton({
  value,
  active,
  label,
  onClick,
}: {
  value: FluencyRating;
  active: boolean;
  label: string;
  onClick: (fluency: FluencyRating) => void;
}) {
  const toneClass = {
    red: active ? "border-rose-300/40 bg-rose-500/24 text-rose-100" : "border-rose-300/14 bg-rose-500/8 text-rose-200",
    yellow: active ? "border-amber-300/40 bg-amber-500/24 text-amber-100" : "border-amber-300/14 bg-amber-500/8 text-amber-200",
    green: active ? "border-emerald-300/40 bg-emerald-500/24 text-emerald-100" : "border-emerald-300/14 bg-emerald-500/8 text-emerald-200",
  }[value];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onClick(value)}
      className={cn("h-10 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25", toneClass)}
    >
      {label}
    </button>
  );
}

export function CardMetadataRail({
  card,
  bookmarked,
  onEdit,
  onDuplicate,
  onBookmark,
  onPrint,
  onExport,
  onRelatedConcept,
}: {
  card: InstantRecallCard;
  bookmarked: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onBookmark: () => void;
  onPrint: () => void;
  onExport: () => void;
  onRelatedConcept: (concept: string) => void;
}) {
  const relatedConcepts = buildRelatedConcepts(card);

  return (
    <aside className="spark-panel rounded-2xl p-4" aria-label="Card metadata">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase text-slate-300">Card Info</div>
        <StatusBadge status={card.status} />
      </div>
      <MetadataRow label="Source" value={card.citations[0]?.label || card.sourceNote} />
      <MetadataRow label="Difficulty" value={formatDifficulty(card.difficulty)} />
      <MetadataRow label="Organ System" value={card.system} />
      <MetadataRow label="Discipline" value={card.discipline} />
      <MetadataRow label="Reviewer" value={`Reviewer: ${card.reviewer || "Pending"}`} />
      {card.visualMedia.length ? <MetadataRow label="Visual Media" value={`${card.visualMedia.length} sourced asset${card.visualMedia.length === 1 ? "" : "s"}`} /> : null}
      <div className="border-t border-white/10 py-3">
        <div className="mb-2 text-xs font-semibold text-slate-500">Tags</div>
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <Badge key={tag} className="border-white/10 bg-white/[0.06] text-slate-200" variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-3">
        <div className="mb-2 text-xs font-semibold text-slate-500">Related Concepts</div>
        <div className="grid gap-1.5">
          {relatedConcepts.map((concept) => (
            <button
              key={concept}
              type="button"
              onClick={() => onRelatedConcept(concept)}
              className="text-left text-sm font-medium text-sky-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25"
            >
              {concept}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 border-t border-white/10 pt-3">
        <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onEdit} aria-label="Edit card from metadata panel">
          <BookOpenCheckIcon />
        </Button>
        <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onDuplicate} aria-label="Duplicate card from metadata panel">
          <CopyIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10",
            bookmarked && "border-amber-300/35 bg-amber-400/16 text-amber-100",
          )}
          onClick={onBookmark}
          aria-label={bookmarked ? "Remove bookmark from metadata panel" : "Bookmark card from metadata panel"}
          aria-pressed={bookmarked}
        >
          <BookmarkIcon />
        </Button>
        <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onPrint} aria-label="Print card">
          <PrinterIcon />
        </Button>
        <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/10" onClick={onExport} aria-label="Export JSON deck">
          <FileJsonIcon />
        </Button>
      </div>
    </aside>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 py-3 first:border-t-0 first:pt-0">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium leading-5 text-slate-100">{value}</div>
    </div>
  );
}

function buildClinicalClues(card: InstantRecallCard) {
  return [
    {
      label: "Visual Clue",
      value: card.visualCue,
    },
    {
      label: "System / Discipline",
      value: `${card.system} · ${card.discipline}`,
    },
    {
      label: "Trap To Avoid",
      value: card.trap,
    },
  ];
}

function buildMechanismSteps(card: InstantRecallCard) {
  return [
    {
      label: card.system,
      detail: "Clinical stem anchors the organ system.",
    },
    {
      label: card.discipline,
      detail: "Pattern is narrowed by discipline-specific cues.",
    },
    {
      label: "Recall target",
      detail: "Answer is confirmed after active prediction.",
    },
  ];
}

function buildWhyNotRows(card: InstantRecallCard) {
  return [
    {
      letter: "A",
      choice: "Similar presentation",
      reason: `Does not explain the key visual cue: ${card.visualCue}`,
    },
    {
      letter: "B",
      choice: "Common trap",
      reason: card.trap,
    },
    {
      letter: "C",
      choice: `${card.discipline} distractor`,
      reason: `The learning objective points to ${card.learningObjective.toLowerCase()}`,
    },
    {
      letter: "E",
      choice: "Low-yield association",
      reason: `Current seed source note: ${card.sourceNote}`,
    },
  ];
}

function buildRelatedConcepts(card: InstantRecallCard) {
  return Array.from(new Set([card.system, card.discipline, ...card.tags.slice(0, 3)])).slice(0, 5);
}

function buildMemoryHook(card: InstantRecallCard) {
  const firstTag = card.tags[0] ?? card.system;
  return `${firstTag} clue first, explanation second, answer last.`;
}

function formatMediaKind(kind: RecallVisualMedia["kind"]) {
  return kind.replace(/-/g, " ");
}

function formatDifficulty(difficulty: InstantRecallCard["difficulty"]) {
  return difficulty === "easy" ? "Low" : difficulty === "medium" ? "Medium" : "High";
}
