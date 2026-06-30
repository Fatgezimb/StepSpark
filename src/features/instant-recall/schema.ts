import { z } from "zod";

export const CARD_SCHEMA_VERSION = "stepspark.instant-recall-card.v1";
export const DECK_SCHEMA_VERSION = "stepspark.instant-recall-cards.v1";
export const MAX_CARDS_PER_IMPORT = 500;
export const MAX_IMPORT_FILE_BYTES = 1_000_000;

export const recallSystems = [
  "Cardiovascular",
  "Endocrine",
  "Gastrointestinal",
  "Hematology",
  "Immunology",
  "Microbiology",
  "Neurology",
  "Pathology",
  "Pharmacology",
  "Renal",
  "Respiratory",
] as const;

export const recallDifficulties = ["easy", "medium", "hard"] as const;
export const recallStatuses = ["draft", "needs-review", "reviewed"] as const;
export const recallProvenanceTypes = ["seed", "author-entered", "imported", "ai-generated"] as const;
export const recallMediaKinds = [
  "anatomy",
  "biochemistry",
  "diagram",
  "graph",
  "histology",
  "mnemonic",
  "pathology",
  "radiology",
] as const;
export const recallMediaProvenanceTypes = [
  "open-license",
  "public-domain",
  "stepspark-generated",
  "ai-generated",
  "user-provided",
] as const;

export const citationSchema = z.object({
  label: z.string().trim().min(1, "Citation label is required.").max(160),
  url: z.string().trim().url("Citation URL must be valid.").optional(),
  note: z.string().trim().max(300).optional(),
});

export const visualMediaSchema = z.object({
  id: z.string().trim().min(1, "Media id is required.").max(120),
  kind: z.enum(recallMediaKinds),
  title: z.string().trim().min(1, "Media title is required.").max(140),
  description: z.string().trim().min(1, "Media description is required.").max(600),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Media image URL is required.")
    .max(1_000)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "Media image must be a local path or HTTPS URL."),
  sourceName: z.string().trim().min(1, "Media source name is required.").max(180),
  sourceUrl: z.string().trim().url("Media source URL must be valid.").optional(),
  license: z.string().trim().min(1, "Media license is required.").max(160),
  attribution: z.string().trim().max(240).optional(),
  provenance: z.enum(recallMediaProvenanceTypes),
  useCase: z.string().trim().min(1, "Media use case is required.").max(300),
});

export const instantRecallCardSchema = z
  .object({
    schemaVersion: z.literal(CARD_SCHEMA_VERSION),
    id: z.string().trim().min(1, "Card id is required.").max(120),
    title: z.string().trim().min(1, "Title is required.").max(140),
    frontPrompt: z.string().trim().min(1, "Recall prompt is required.").max(1_000),
    visualCue: z.string().trim().min(1, "Visual cue is required.").max(1_000),
    answer: z.string().trim().min(1, "Answer is required.").max(1_000),
    explanation: z.string().trim().min(1, "Explanation is required.").max(2_000),
    trap: z.string().trim().min(1, "Common trap is required.").max(1_000),
    system: z.enum(recallSystems),
    discipline: z.string().trim().min(1, "Discipline is required.").max(80),
    difficulty: z.enum(recallDifficulties),
    status: z.enum(recallStatuses),
    tags: z.array(z.string().trim().min(1).max(40)).max(20),
    sourceNote: z.string().trim().min(1, "Source note is required.").max(1_000),
    learningObjective: z.string().trim().min(1, "Learning objective is required.").max(400),
    highYieldRationale: z.string().trim().min(1, "High-yield rationale is required.").max(600),
    citations: z.array(citationSchema).max(8),
    visualMedia: z.array(visualMediaSchema).max(4).default([]),
    author: z.string().trim().min(1, "Author is required.").max(80),
    reviewer: z.string().trim().max(80),
    reviewedAt: z.string().datetime().optional(),
    contentVersion: z.number().int().positive(),
    provenance: z.enum(recallProvenanceTypes),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((card, context) => {
    if (card.status === "reviewed" && !card.reviewer.trim()) {
      context.addIssue({
        code: "custom",
        message: "Reviewed cards require a named medical reviewer.",
        path: ["reviewer"],
      });
    }

    if (card.status === "reviewed" && !card.reviewedAt) {
      context.addIssue({
        code: "custom",
        message: "Reviewed cards require a review timestamp.",
        path: ["reviewedAt"],
      });
    }

    if (card.status !== "reviewed" && card.reviewedAt) {
      context.addIssue({
        code: "custom",
        message: "Only reviewed cards may include a review timestamp.",
        path: ["reviewedAt"],
      });
    }

    if (card.status === "reviewed" && card.provenance === "ai-generated") {
      context.addIssue({
        code: "custom",
        message: "AI-generated cards must be converted to reviewed human-authored content before approval.",
        path: ["provenance"],
      });
    }
  });

export const instantRecallDeckExportSchema = z.object({
  schema: z.literal(DECK_SCHEMA_VERSION),
  exportedAt: z.string().datetime(),
  cards: z.array(instantRecallCardSchema).max(MAX_CARDS_PER_IMPORT),
});

export type RecallDifficulty = (typeof recallDifficulties)[number];
export type RecallStatus = (typeof recallStatuses)[number];
export type RecallSystem = (typeof recallSystems)[number];
export type RecallProvenance = (typeof recallProvenanceTypes)[number];
export type RecallMediaKind = (typeof recallMediaKinds)[number];
export type RecallMediaProvenance = (typeof recallMediaProvenanceTypes)[number];
export type RecallCitation = z.infer<typeof citationSchema>;
export type RecallVisualMedia = z.infer<typeof visualMediaSchema>;
export type InstantRecallCard = z.infer<typeof instantRecallCardSchema>;

export interface RecallFilters {
  query: string;
  system: "all" | RecallSystem;
  difficulty: "all" | RecallDifficulty;
  status: "all" | RecallStatus;
  tags: string[];
}

export const defaultRecallFilters: RecallFilters = {
  query: "",
  system: "all",
  difficulty: "all",
  status: "all",
  tags: [],
};

export const emptyCardDraft: Omit<InstantRecallCard, "id" | "createdAt" | "updatedAt"> = {
  schemaVersion: CARD_SCHEMA_VERSION,
  title: "",
  frontPrompt: "",
  visualCue: "",
  answer: "",
  explanation: "",
  trap: "",
  system: "Pathology",
  discipline: "Pathology",
  difficulty: "medium",
  status: "draft",
  tags: [],
  sourceNote: "Draft seed or author-entered content. Requires medical review before production use.",
  learningObjective: "",
  highYieldRationale: "",
  citations: [],
  visualMedia: [],
  author: "StepSpark Author",
  reviewer: "",
  contentVersion: 1,
  provenance: "author-entered",
};
