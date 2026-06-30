# ADR-0004: Persistence Strategy

## Status

Accepted

## Context

The card engine currently uses local volatile React state. Persisting learner data or authored medical content introduces privacy, sync, migration, backup, and review workflow concerns.

## Decision

Do not add database, IndexedDB, localStorage, or server persistence yet. Treat import/export as a prototype transfer mechanism until a storage ADR defines the canonical data model and privacy requirements.

## Consequences

- Refreshing the page resets local edits.
- No learner data is stored by the app today.
- Future persistence must include migration, provenance, access control, and data-retention decisions.

## Alternatives Considered

- localStorage: rejected for now because it creates implicit persistence without a recovery or migration story.
- IndexedDB/Dexie: deferred until offline requirements are approved.
- Backend database: deferred until auth, privacy, and content operations are specified.
