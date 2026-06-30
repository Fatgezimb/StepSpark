# ADR-0001: Instant Recall Runtime Validation

## Status

Accepted

## Context

Instant Recall Card imports are untrusted JSON. TypeScript interfaces do not validate runtime data, and permissive parsing can admit malformed cards before the product has persistence, review, or recovery systems.

## Decision

Use Zod as the runtime validation source for Instant Recall Cards and deck exports. Keep the deck wire schema versioned as `stepspark.instant-recall-cards.v1`. Accept legacy raw card arrays only through normalization followed by schema validation.

## Consequences

- Imports fail early with actionable messages.
- Exported decks contain validated cards.
- Future schema changes must include migration or normalization logic.
- TypeScript card types should remain aligned with the Zod schema.

## Alternatives Considered

- Manual validation: rejected because it is easy to miss fields and drift from TypeScript types.
- Full backend validation only: rejected because frontend import/export exists before backend APIs.
