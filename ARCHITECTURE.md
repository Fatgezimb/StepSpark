# Architecture

StepSpark will be designed as a modular learning platform. This document describes intended boundaries and quality attributes before implementation begins.

## Architectural Goals

- Keep medical content, learning logic, UI, and infrastructure concerns separated.
- Make content review and traceability first-class.
- Support fast review sessions on low-power devices.
- Support future offline practice without rewriting core models.
- Support rigorous testing of learning workflows and question logic.

## Planned Domains

- **Learning Objects** - Instant Recall Cards, question stems, answers, explanations, tags, citations, and visual assets.
- **Practice Sessions** - queueing, response capture, feedback, timing, review modes, and session summaries.
- **Retention Engine** - scheduling, mastery scoring, forgetting risk, and review intervals.
- **Content Operations** - drafting, medical review, approval, versioning, and retirement.
- **Search And Discovery** - topic filtering, high-yield tags, organ systems, disciplines, and weak-area navigation.
- **User And Identity** - accounts, preferences, study goals, and access control.
- **Analytics** - learning outcomes, product usage, content quality, and performance metrics.

## Boundary Rules

- UI components should not contain medical correctness rules.
- Domain logic should be testable without a browser.
- Generated content must remain distinguishable from reviewed content.
- Every medically meaningful object should support provenance and review status.
- Analytics must not leak protected or unnecessary personal data.

## Data Model Principles

- Prefer explicit review states over implicit flags.
- Prefer versioned content over destructive edits.
- Store citations and reviewer metadata with content.
- Separate learner performance events from authored medical content.
- Treat visual assets as referenced content with metadata, not anonymous files.

## Quality Attributes

- **Accuracy** - medical correctness and source traceability.
- **Performance** - instant card rendering and fast review interactions.
- **Accessibility** - keyboard navigation, screen reader support, contrast, reduced motion, and semantic structure.
- **Reliability** - offline-resilient study sessions where technically feasible.
- **Security** - least privilege, safe authentication, and careful handling of learner data.
- **Maintainability** - documented decisions, clear ownership, and strict tests around shared behavior.

## Decision Process

Architecture decisions are recorded in [DECISIONS.md](DECISIONS.md). Larger decisions should later be moved into individual ADR files under `docs/decisions/` if the decision log grows too large.

## Current Implementation Status

The repository now contains a Vite/React application shell, a source-owned design system, and the first local Instant Recall Card feature. The card feature is still frontend-local: it has no database, authentication, server API, retention engine, or production medical review workflow.

Current implemented boundaries:

- `src/design-system` contains reusable tokens and UI primitives.
- `src/app` contains the shell, navigation, settings scaffold, theme switcher, and shell search presentation.
- `src/features/instant-recall` contains the card schema, seed data, validation, feature state hook, feature-specific UI components, and tests.

The next architecture priority is to keep card content validation, medical provenance, accessibility, and tests ahead of any database, review engine, or generated medical content work.
