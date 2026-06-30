import { LayersIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { cn } from "@/design-system/lib/utils";
import type { InstantRecallCard } from "../schema";
import { StatusBadge } from "./StatusBadge";

export function CardLibraryPanel({
  cards,
  totalCards,
  selectedCardId,
  onSelect,
}: {
  cards: InstantRecallCard[];
  totalCards: number;
  selectedCardId: string;
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
        <CardLibrary cards={cards} selectedCardId={selectedCardId} onSelect={onSelect} />
      </CardContent>
    </Card>
  );
}

function CardLibrary({
  cards,
  selectedCardId,
  onSelect,
}: {
  cards: InstantRecallCard[];
  selectedCardId: string;
  onSelect: (cardId: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
        No cards match the current search and filters.
      </div>
    );
  }

  return (
    <div className="grid max-h-[26rem] gap-2 overflow-auto pr-1">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          aria-current={selectedCardId === card.id ? "true" : undefined}
          onClick={() => onSelect(card.id)}
          className={cn(
            "rounded-md border p-3 text-left transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
            selectedCardId === card.id
              ? "border-sky-300/28 bg-sky-400/10 shadow-sm"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-100">{card.title}</div>
              <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{card.frontPrompt}</div>
            </div>
            <StatusBadge status={card.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline">{card.system}</Badge>
            <Badge variant="secondary">{card.difficulty}</Badge>
            {card.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
