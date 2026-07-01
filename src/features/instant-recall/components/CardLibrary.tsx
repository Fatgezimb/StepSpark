import { BookmarkIcon, ImageIcon, LayersIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import { getCardTaskPrompt } from "../engine";
import type { ReviewStateMap } from "../review";
import type { InstantRecallCard } from "../schema";
import { StatusBadge } from "./StatusBadge";

export function CardLibraryPanel({
  cards,
  totalCards,
  selectedCardId,
  reviews = {},
  onSelect,
}: {
  cards: InstantRecallCard[];
  totalCards: number;
  selectedCardId: string;
  reviews?: ReviewStateMap;
  onSelect: (cardId: string) => void;
}) {
  return (
    <Card className="spark-panel rounded-2xl">
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-white/10">
        <div>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <LayersIcon className="size-5 text-sky-300" aria-hidden="true" />
            Card Library
          </CardTitle>
          <CardDescription className="text-slate-400">{cards.length} cards visible from {totalCards} total.</CardDescription>
        </div>
        <Badge className="border-amber-300/20 bg-amber-500/10 text-amber-100" variant="outline">Draft seed deck</Badge>
      </CardHeader>
      <CardContent>
        <CardLibrary cards={cards} selectedCardId={selectedCardId} reviews={reviews} onSelect={onSelect} />
      </CardContent>
    </Card>
  );
}

function CardLibrary({
  cards,
  selectedCardId,
  reviews,
  onSelect,
}: {
  cards: InstantRecallCard[];
  selectedCardId: string;
  reviews: ReviewStateMap;
  onSelect: (cardId: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-6 text-sm leading-6 text-slate-400">
        No cards match the current search and filters. Clear filters, reset search, or import a broader deck to continue.
      </div>
    );
  }

  return (
    <div className="grid max-h-[34rem] gap-2 overflow-auto pr-1" data-card-list="true">
      {cards.map((card) => {
        const review = reviews[card.id];

        return (
          <button
            key={card.id}
            type="button"
            aria-current={selectedCardId === card.id ? "true" : undefined}
            onClick={() => onSelect(card.id)}
            className={cn(
              "rounded-xl border p-3 text-left transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
              selectedCardId === card.id
                ? "border-cyan-300/35 bg-cyan-400/10 shadow-card"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-100">{card.title}</div>
                <div className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-300">{getCardTaskPrompt(card)}</div>
                <div className="mt-2 line-clamp-2 rounded-lg border border-amber-300/14 bg-amber-400/[0.06] px-2 py-1.5 text-xs leading-5 text-amber-100">
                  Trap: {card.trap}
                </div>
              </div>
              <StatusBadge status={card.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{card.system}</Badge>
              <Badge variant="secondary">{card.discipline}</Badge>
              <Badge variant="secondary">{card.difficulty}</Badge>
              {card.visualMedia.length ? (
                <Badge className="gap-1 border-sky-300/18 bg-sky-500/10 text-sky-100" variant="outline">
                  <ImageIcon className="size-3" aria-hidden="true" />
                  Visual
                </Badge>
              ) : null}
              {review?.bookmarked ? (
                <Badge className="gap-1 border-amber-300/24 bg-amber-500/12 text-amber-100" variant="outline">
                  <BookmarkIcon className="size-3" aria-hidden="true" />
                  Saved
                </Badge>
              ) : null}
              {review?.fluency ? <Badge variant="secondary">{review.fluency} fluency</Badge> : <Badge variant="outline">Unreviewed</Badge>}
              {card.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
