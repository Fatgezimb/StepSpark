# ADR-0002: Test Stack

## Status

Accepted

## Context

The repository had typecheck and build scripts but no automated behavioral tests. The Instant Recall Card engine includes import/export, keyboard shortcuts, editor behavior, and accessibility-sensitive UI.

## Decision

Use Vitest for unit tests, Testing Library for React component behavior, Playwright for rendered app smoke tests, and axe-core through Playwright for automated accessibility checks.

## Consequences

- Pure helpers can be tested quickly without a browser.
- Editor/viewer behavior is covered at the component level.
- CI can verify the app renders and core interactions work.
- Automated accessibility checks reduce regressions but do not replace manual accessibility review.

## Alternatives Considered

- Jest: rejected because Vitest fits the Vite project with less setup.
- Manual screenshot checks only: rejected because they are not repeatable quality gates.
