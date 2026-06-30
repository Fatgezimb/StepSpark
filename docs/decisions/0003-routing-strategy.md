# ADR-0003: Routing Strategy

## Status

Accepted

## Context

The shell currently switches between Instant Cards and Settings with local React state. A route library would add structure, but StepSpark has only one real product feature today.

## Decision

Keep manual shell navigation for now. Introduce typed URL routing before adding another major product surface or shareable card search/filter state.

## Consequences

- The current app stays simple.
- Search and selected card state are not yet URL-addressable.
- TanStack Router remains the preferred candidate when routing becomes necessary.

## Alternatives Considered

- Add TanStack Router immediately: deferred to avoid unnecessary abstraction while surface area is small.
- Keep manual navigation indefinitely: rejected because it will not scale to review sessions, dashboards, authoring, and settings.
