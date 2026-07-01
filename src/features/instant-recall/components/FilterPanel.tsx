import { type RefObject } from "react";
import { KeyboardIcon, ListFilterIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { cn } from "@/design-system/lib/utils";
import { recallDifficulties, recallStatuses, recallSystems, type RecallFilters } from "../schema";
import { formatOption } from "./format";

export function FilterPanel({
  filters,
  tags,
  searchRef,
  onFiltersChange,
  onToggleTag,
  onReset,
  onShowShortcuts,
}: {
  filters: RecallFilters;
  tags: string[];
  searchRef: RefObject<HTMLInputElement | null>;
  onFiltersChange: (filters: Partial<RecallFilters>) => void;
  onToggleTag: (tag: string) => void;
  onReset: () => void;
  onShowShortcuts: () => void;
}) {
  const activeFilters = [
    filters.query.trim() ? `Search: ${filters.query.trim()}` : "",
    filters.system !== "all" ? `System: ${formatOption(filters.system)}` : "",
    filters.difficulty !== "all" ? `Difficulty: ${formatOption(filters.difficulty)}` : "",
    filters.status !== "all" ? `Status: ${formatOption(filters.status)}` : "",
    ...filters.tags.map((tag) => `Tag: ${tag}`),
  ].filter(Boolean);

  return (
    <Card className="spark-panel order-2 rounded-2xl xl:order-none">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <ListFilterIcon className="size-5 text-sky-300" aria-hidden="true" />
          Search & Filters
        </CardTitle>
        <CardDescription className="text-slate-400">Find cards by clue, answer, system, difficulty, status, or tags.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-search">Search</Label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="card-search"
              ref={searchRef}
              value={filters.query}
              onChange={(event) => onFiltersChange({ query: event.target.value })}
              className="ps-9"
              placeholder="Search title, clue, mechanism, trap..."
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase text-slate-400">Active filters</div>
            <Badge variant="outline">{activeFilters.length}</Badge>
          </div>
          {activeFilters.length ? (
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.slice(0, 8).map((filter) => (
                <Badge key={filter} className="border-cyan-300/18 bg-cyan-400/10 text-cyan-100" variant="outline">
                  {filter}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">Showing the full local deck. Use search, system, difficulty, status, or tags to narrow it.</p>
          )}
        </div>

        <FilterSelect
          label="System"
          value={filters.system}
          options={["all", ...recallSystems]}
          onValueChange={(value) => onFiltersChange({ system: value as RecallFilters["system"] })}
        />
        <FilterSelect
          label="Difficulty"
          value={filters.difficulty}
          options={["all", ...recallDifficulties]}
          onValueChange={(value) => onFiltersChange({ difficulty: value as RecallFilters["difficulty"] })}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={["all", ...recallStatuses]}
          onValueChange={(value) => onFiltersChange({ status: value as RecallFilters["status"] })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Tags</Label>
            <Badge variant="outline">{filters.tags.length} active</Badge>
          </div>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-auto rounded-md border border-white/10 bg-white/[0.035] p-2">
            {tags.map((tag) => {
              const active = filters.tags.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleTag(tag)}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
                    active
                      ? "border-sky-300/35 bg-sky-400/20 text-sky-100"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onShowShortcuts}>
            <KeyboardIcon data-icon="inline-start" />
            Keys
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {formatOption(option)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
