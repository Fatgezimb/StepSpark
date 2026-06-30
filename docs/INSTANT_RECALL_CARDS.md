# Instant Recall Cards

Instant Recall Cards are the first StepSpark feature. This implementation is local frontend functionality only.

## Included

- Card schema
- Seed deck with 10 draft cards
- Card library
- Card viewer
- Card editor
- Search
- Filters
- Tag filtering and tag editing
- Keyboard shortcuts
- JSON import
- JSON export
- Runtime schema validation
- Medical metadata fields
- Unit, component, and browser smoke tests

## Excluded

- Database persistence
- Authentication
- Review engine
- Spaced repetition
- Question generation
- Server APIs

## Schema

The card schema lives in `src/features/instant-recall/schema.ts`.

Core fields:

- `schemaVersion`
- `id`
- `title`
- `frontPrompt`
- `visualCue`
- `answer`
- `explanation`
- `trap`
- `system`
- `discipline`
- `difficulty`
- `status`
- `tags`
- `sourceNote`
- `learningObjective`
- `highYieldRationale`
- `citations`
- `author`
- `reviewer`
- `reviewedAt`
- `contentVersion`
- `provenance`
- `createdAt`
- `updatedAt`

The runtime schema is implemented with Zod. Import, export, and save paths validate cards before they enter the local deck.

Medical review invariants:

- `reviewed` cards require a named medical reviewer.
- `reviewed` cards require a review timestamp. The local editor stamps `reviewedAt` when a reviewer marks a card reviewed.
- Non-reviewed cards cannot carry a `reviewedAt` timestamp.
- `ai-generated` cards cannot be marked `reviewed`; generated content must pass through a human-authored or reviewed provenance path first.

## Seed Content

The seed deck lives in `src/features/instant-recall/seed.ts`.

All seeded cards are marked `draft` with `provenance: "seed"`. They are educational scaffolding and require medical education review plus source-level citations before production use.

## Import/Export

Export format:

```json
{
  "schema": "stepspark.instant-recall-cards.v1",
  "exportedAt": "ISO date",
  "cards": []
}
```

Import accepts either the object above or a raw array of card objects.

Limits:

- Maximum import size: 1,000,000 bytes
- Maximum cards per import: 500
- Legacy cards are normalized, then validated against the current card schema

## Keyboard Shortcuts

- `/` - Focus search
- `N` - New card
- `E` - Edit selected card
- `F` - Reveal or hide answer
- `J` or Down Arrow - Next filtered card
- `K` or Up Arrow - Previous filtered card
- `X` - Export cards
- `Esc` - Close editor draft

Shortcuts are disabled while typing in inputs, textareas, selects, or editable regions. Unsaved edits block card changes until the user saves or cancels.

## Tests

- `npm test` runs unit and component tests.
- `npm run test:e2e` runs Playwright browser checks, including an axe accessibility scan.
- `npm run ci` runs the repository quality gate.
