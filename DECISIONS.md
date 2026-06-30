# Decisions

This file records architectural and process decisions. For larger decisions, create a dedicated ADR under `docs/decisions/` later and link it here.

## Decision Log

### DEC-0001: Phase 0 Is Documentation And Standards Only

Status: accepted

StepSpark will not begin application implementation until repository structure, documentation, workflow standards, and planning are in place.

### DEC-0002: Medical Content Requires Review

Status: accepted

Generated or contributed medical content must not be treated as production-ready until a medical education review process is defined and completed.

### DEC-0003: Technology Choices Require ADRs

Status: accepted

Major dependencies such as application framework, database, authentication, analytics, and offline tooling require documented evaluation before installation.

### DEC-0004: AI Contributions Must Be Reviewable

Status: accepted

AI assistants may draft code, documentation, test plans, and analysis, but their output must be reviewed through the same pull request process as human work.

### DEC-0005: Design System Foundation

Status: accepted

StepSpark will use a source-owned shadcn-style design system built on Radix Primitives, Tailwind CSS, Lucide icons, Recharts, Motion, and Storybook. This gives the project accessible behavior, local component ownership, dark mode, responsive styling, and reviewable component documentation without committing to application business logic.

### DEC-0006: Instant Recall Runtime Validation

Status: accepted

Instant Recall Cards use a Zod-backed runtime schema for import, export, and save validation. See [ADR-0001](docs/decisions/0001-instant-recall-validation.md).

### DEC-0007: Test Stack

Status: accepted

StepSpark uses Vitest, Testing Library, Playwright, and axe-core checks for the current frontend quality gate. See [ADR-0002](docs/decisions/0002-test-stack.md).

### DEC-0008: Routing Is Deferred

Status: accepted

Manual shell navigation remains acceptable while StepSpark has one real feature plus settings. Typed URL routing should be introduced before additional product surfaces are added. See [ADR-0003](docs/decisions/0003-routing-strategy.md).

### DEC-0009: Persistence Is Deferred

Status: accepted

Instant Recall Cards remain local volatile state until the content model, privacy posture, and storage strategy are approved. See [ADR-0004](docs/decisions/0004-persistence-strategy.md).

### DEC-0010: Medical Metadata Is Required

Status: accepted

Every Instant Recall Card now carries learning objective, high-yield rationale, citation, author, reviewer, version, and provenance fields. See [ADR-0005](docs/decisions/0005-medical-content-metadata.md).

## ADR Template

### Title

Decision title.

### Status

Proposed, accepted, superseded, or rejected.

### Context

What problem is being solved?

### Decision

What choice was made?

### Consequences

What tradeoffs follow from this decision?

### Alternatives Considered

What options were rejected and why?
