# ADR-0005: Medical Content Metadata

## Status

Accepted

## Context

USMLE learning content must remain traceable and reviewable. Draft, generated, and reviewed content must not be confused, especially before a formal content operations workflow exists.

## Decision

Instant Recall Cards require learning objective, high-yield rationale, citation metadata, author, reviewer, content version, and provenance fields. Seed cards remain `draft` and use placeholder citations until medical education review supplies source-level citations.

The schema enforces these review-state rules:

- Reviewed cards must include a named medical reviewer.
- Reviewed cards must include a review timestamp.
- Draft, pending-review, and retired cards must not carry a review timestamp.
- AI-generated cards cannot be marked reviewed without first moving through a human review provenance path.

## Consequences

- Card authors must provide more metadata than a basic flashcard would require.
- Imports from older card shapes are normalized into the richer model.
- Production release must still add authenticated reviewer identity, citation quality standards, and content retirement/versioning workflows.

## Alternatives Considered

- Keep metadata only in docs: rejected because the app could not enforce review-readiness.
- Add full content operations now: deferred because backend, auth, and workflow decisions are not approved.
