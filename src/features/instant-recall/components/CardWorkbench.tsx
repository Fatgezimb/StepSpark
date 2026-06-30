import { useEffect, useState, type ReactNode } from "react";
import { DownloadIcon, FileJsonIcon, ImportIcon, KeyboardIcon, PlusIcon, RotateCcwIcon, SaveIcon, UploadIcon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/components/ui/tabs";
import { Textarea } from "@/design-system/components/ui/textarea";
import { cn } from "@/design-system/lib/utils";
import { formatCitations, formatTags, parseCitations, parseTags } from "../engine";
import {
  recallDifficulties,
  recallStatuses,
  recallSystems,
  type InstantRecallCard,
  type RecallDifficulty,
  type RecallStatus,
  type RecallSystem,
} from "../schema";
import type { EditorTab } from "../useInstantRecallCards";
import { formatOption } from "./format";

const shortcutRows = [
  ["/", "Focus search"],
  ["Space", "Reveal or hide answer"],
  ["1-5", "Set confidence"],
  ["R / Y / G", "Mark fluency"],
  ["N", "Next card"],
  ["P", "Previous card"],
  ["E", "Edit selected"],
  ["F", "Reveal or hide answer"],
  ["X", "Export cards"],
  ["Esc", "Close editor draft"],
];

export function CardWorkbench({
  className,
  editorTab,
  editingCard,
  selectedCard,
  canSave,
  validationMessage,
  editorNotice,
  importText,
  importMessage,
  onTabChange,
  onEditSelected,
  onEditingCardChange,
  onSave,
  onCancel,
  onNew,
  onImportTextChange,
  onReadFile,
  onMerge,
  onReplace,
  onExport,
  onResetToSeed,
}: {
  className?: string;
  editorTab: EditorTab;
  editingCard: InstantRecallCard | null;
  selectedCard: InstantRecallCard | null;
  canSave: boolean;
  validationMessage: string;
  editorNotice: string;
  importText: string;
  importMessage: string;
  onTabChange: (tab: EditorTab) => void;
  onEditSelected: () => void;
  onEditingCardChange: (card: InstantRecallCard) => void;
  onSave: () => void;
  onCancel: () => void;
  onNew: () => void;
  onImportTextChange: (value: string) => void;
  onReadFile: (file: File | undefined) => void;
  onMerge: () => void;
  onReplace: () => void;
  onExport: () => void;
  onResetToSeed: () => void;
}) {
  return (
    <Card className={cn("spark-panel order-3 rounded-2xl xl:order-none", className)}>
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-slate-100">Card Workbench</CardTitle>
        <CardDescription className="text-slate-400">Edit cards, import/export JSON, and view shortcuts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={editorTab} onValueChange={(value) => onTabChange(value as EditorTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="shortcuts">Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="editor">
            <CardEditor
              card={editingCard}
              selectedCard={selectedCard}
              canSave={canSave}
              validationMessage={validationMessage}
              notice={editorNotice}
              onEditSelected={onEditSelected}
              onChange={onEditingCardChange}
              onSave={onSave}
              onCancel={onCancel}
              onNew={onNew}
            />
          </TabsContent>
          <TabsContent value="import">
            <ImportExportPanel
              importText={importText}
              importMessage={importMessage}
              onImportTextChange={onImportTextChange}
              onReadFile={onReadFile}
              onMerge={onMerge}
              onReplace={onReplace}
              onExport={onExport}
              onResetToSeed={onResetToSeed}
            />
          </TabsContent>
          <TabsContent value="shortcuts">
            <ShortcutsPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CardEditor({
  card,
  selectedCard,
  canSave,
  validationMessage,
  notice,
  onEditSelected,
  onChange,
  onSave,
  onCancel,
  onNew,
}: {
  card: InstantRecallCard | null;
  selectedCard: InstantRecallCard | null;
  canSave: boolean;
  validationMessage: string;
  notice: string;
  onEditSelected: () => void;
  onChange: (card: InstantRecallCard) => void;
  onSave: () => void;
  onCancel: () => void;
  onNew: () => void;
}) {
  if (!card) {
    return (
      <div className="flex flex-col gap-4">
        <Notice message={notice || "Select Edit to modify the current card, or create a new Instant Recall Card."} />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onNew}>
            <PlusIcon data-icon="inline-start" />
            New
          </Button>
          <Button className="flex-1" variant="outline" onClick={onEditSelected} disabled={!selectedCard}>
            Edit selected
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? <Notice message={notice} tone="warning" /> : null}
      {validationMessage ? <Notice message={validationMessage} tone="warning" /> : null}
      <EditorField id="card-title" label="Title">
        <Input id="card-title" value={card.title} onChange={(event) => onChange({ ...card, title: event.target.value })} />
      </EditorField>
      <EditorField id="card-front-prompt" label="Recall prompt">
        <Textarea
          id="card-front-prompt"
          value={card.frontPrompt}
          onChange={(event) => onChange({ ...card, frontPrompt: event.target.value })}
          className="min-h-28"
        />
      </EditorField>
      <EditorField id="card-visual-cue" label="Visual cue">
        <Textarea
          id="card-visual-cue"
          value={card.visualCue}
          onChange={(event) => onChange({ ...card, visualCue: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      <EditorField id="card-answer" label="Answer">
        <Textarea
          id="card-answer"
          value={card.answer}
          onChange={(event) => onChange({ ...card, answer: event.target.value })}
          className="min-h-24"
        />
      </EditorField>
      <EditorField id="card-explanation" label="Explanation">
        <Textarea
          id="card-explanation"
          value={card.explanation}
          onChange={(event) => onChange({ ...card, explanation: event.target.value })}
          className="min-h-24"
        />
      </EditorField>
      <EditorField id="card-trap" label="Common trap">
        <Textarea
          id="card-trap"
          value={card.trap}
          onChange={(event) => onChange({ ...card, trap: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      <EditorField id="card-learning-objective" label="Learning objective">
        <Textarea
          id="card-learning-objective"
          value={card.learningObjective}
          onChange={(event) => onChange({ ...card, learningObjective: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      <EditorField id="card-high-yield-rationale" label="High-yield rationale">
        <Textarea
          id="card-high-yield-rationale"
          value={card.highYieldRationale}
          onChange={(event) => onChange({ ...card, highYieldRationale: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      <div className="grid gap-3 sm:grid-cols-2">
        <EditorSelect
          label="System"
          value={card.system}
          options={recallSystems}
          onValueChange={(value) => onChange({ ...card, system: value as RecallSystem })}
        />
        <EditorSelect
          label="Difficulty"
          value={card.difficulty}
          options={recallDifficulties}
          onValueChange={(value) => onChange({ ...card, difficulty: value as RecallDifficulty })}
        />
        <EditorSelect
          label="Status"
          value={card.status}
          options={recallStatuses}
          onValueChange={(value) => onChange({ ...card, status: value as RecallStatus })}
        />
        <EditorField id="card-discipline" label="Discipline">
          <Input
            id="card-discipline"
            value={card.discipline}
            onChange={(event) => onChange({ ...card, discipline: event.target.value })}
          />
        </EditorField>
      </div>
      <EditorField id="card-tags" label="Tags">
        <Input
          id="card-tags"
          value={formatTags(card.tags)}
          onChange={(event) => onChange({ ...card, tags: parseTags(event.target.value) })}
          placeholder="histology, rapid-recognition"
        />
      </EditorField>
      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField id="card-author" label="Author">
          <Input id="card-author" value={card.author} onChange={(event) => onChange({ ...card, author: event.target.value })} />
        </EditorField>
        <EditorField id="card-reviewer" label="Reviewer">
          <Input
            id="card-reviewer"
            value={card.reviewer}
            onChange={(event) => onChange({ ...card, reviewer: event.target.value })}
            placeholder="Pending"
          />
        </EditorField>
      </div>
      <EditorField id="card-citations" label="Citations">
        <Textarea
          id="card-citations"
          value={formatCitations(card.citations)}
          onChange={(event) => onChange({ ...card, citations: parseCitations(event.target.value) })}
          className="min-h-24 font-mono text-xs"
          placeholder="Label | https://example.com | optional note"
        />
      </EditorField>
      <EditorField id="card-source-note" label="Source note">
        <Textarea
          id="card-source-note"
          value={card.sourceNote}
          onChange={(event) => onChange({ ...card, sourceNote: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onSave} disabled={!canSave}>
          <SaveIcon data-icon="inline-start" />
          Save
        </Button>
        <Button className="flex-1" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function EditorField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function EditorSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
}) {
  const labelId = `card-${label.toLowerCase().replace(/\s+/g, "-")}-label`;

  return (
    <div className="flex flex-col gap-2">
      <Label id={labelId}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-labelledby={labelId}>
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

function ImportExportPanel({
  importText,
  importMessage,
  onImportTextChange,
  onReadFile,
  onMerge,
  onReplace,
  onExport,
  onResetToSeed,
}: {
  importText: string;
  importMessage: string;
  onImportTextChange: (value: string) => void;
  onReadFile: (file: File | undefined) => void;
  onMerge: () => void;
  onReplace: () => void;
  onExport: () => void;
  onResetToSeed: () => void;
}) {
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setConfirmReplace(false);
  }, [importText]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <DownloadIcon className="size-4 text-primary" aria-hidden="true" />
          Export
        </div>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Export the current local deck as StepSpark Instant Recall JSON.
        </p>
        <Button variant="outline" className="w-full" onClick={onExport}>
          <FileJsonIcon data-icon="inline-start" />
          Export JSON
        </Button>
      </div>

      <div className="rounded-md border border-amber-300/25 bg-amber-500/8 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-100">
          <RotateCcwIcon className="size-4" aria-hidden="true" />
          Reset local prototype data
        </div>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Restore the draft seed deck and clear local review progress in this browser.
        </p>
        {confirmReset ? (
          <div className="grid gap-2">
            <div className="text-sm text-amber-100" role="status">Reset the local deck to seed content?</div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="destructive" onClick={onResetToSeed}>
                Confirm reset
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setConfirmReset(true)}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset to seed deck
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ImportIcon className="size-4 text-primary" aria-hidden="true" />
          Import
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="card-import-file">Upload JSON</Label>
          <Input
            id="card-import-file"
            type="file"
            accept="application/json,.json"
            onChange={(event) => onReadFile(event.currentTarget.files?.[0])}
          />
          <Label htmlFor="card-import-json">Paste JSON</Label>
          <Textarea
            id="card-import-json"
            value={importText}
            onChange={(event) => onImportTextChange(event.target.value)}
            className="min-h-40 font-mono text-xs"
            placeholder='{"schema":"stepspark.instant-recall-cards.v1","cards":[...]}'
          />
          {importMessage ? <Notice message={importMessage} /> : null}
          {confirmReplace ? (
            <div className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/8 p-3">
              <div className="text-sm" role="status">
                Replace the entire local deck with this import?
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="destructive" onClick={onReplace}>
                  Confirm replace
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setConfirmReplace(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={onMerge} disabled={!importText.trim()}>
                <UploadIcon data-icon="inline-start" />
                Merge
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => setConfirmReplace(true)}
                disabled={!importText.trim()}
              >
                Replace
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShortcutsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <KeyboardIcon className="size-4 text-primary" aria-hidden="true" />
          Keyboard shortcuts
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Shortcuts are disabled while typing in fields.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shortcutRows.map(([key, action]) => (
            <TableRow key={key}>
              <TableCell>
                <kbd className="rounded-sm border bg-muted px-2 py-1 text-xs font-semibold">{key}</kbd>
              </TableCell>
              <TableCell>{action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Notice({ message, tone = "default" }: { message: string; tone?: "default" | "warning" }) {
  return (
    <div
      className={
        tone === "warning"
          ? "rounded-md border border-warning/30 bg-warning/12 p-3 text-sm leading-6"
          : "rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-muted-foreground"
      }
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
