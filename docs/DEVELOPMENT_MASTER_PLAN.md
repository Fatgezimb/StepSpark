# Development Master Plan

This plan describes how StepSpark should be built over the next several months. Timelines are estimates and should be adjusted after each phase review.

## Month 0: Foundation

### Goals

- Establish repository structure.
- Define engineering standards.
- Define agent responsibilities.
- Record initial technology recommendations.
- Create GitHub workflow.

### Exit Criteria

- Phase 0 docs are reviewed.
- No application code exists.
- Initial ADR backlog is created.

## Month 1: Product And Architecture Definition

### Goals

- Define learner personas.
- Define Instant Recall Card requirements.
- Define NBME-style question requirements.
- Define content review states.
- Define medical citation standards.
- Decide initial framework, database, auth, and testing stack through ADRs.

### Deliverables

- Product requirements document.
- Content model draft.
- ADRs for core stack.
- Design brief for primary workflows.

## Month 2: Design System And App Shell

### Goals

- Create design tokens.
- Prototype study session, card review, and question review layouts.
- Scaffold application only after ADR approval.
- Add linting, formatting, testing, and CI.
- Add initial accessibility checks.

### Deliverables

- App shell.
- Component standards.
- Test harness.
- CI workflow.

## Month 3: Instant Recall Card MVP

### Goals

- Implement card data model.
- Implement card review session.
- Implement simple authoring or seed import workflow.
- Implement mastery states.
- Add tests for review behavior.

### Deliverables

- Reviewed card workflow.
- Session summary.
- Search/filter basics.
- Accessibility and performance baseline.

## Month 4: Question System MVP

### Goals

- Implement NBME-style question structure.
- Implement answer choice and distractor explanations.
- Implement review states.
- Add medical citation metadata.
- Add editor workflow if approved.

### Deliverables

- Question practice flow.
- Explanation review.
- Content QA checklist.
- Initial medical review dashboard.

## Month 5: Retention Engine

### Goals

- Implement spaced review scheduling.
- Add weak-area tracking.
- Add review queue prioritization.
- Add longitudinal progress summaries.

### Deliverables

- Retention scheduler.
- Mastery dashboard.
- Review due queue.
- Tests around scheduling behavior.

## Month 6: Visual Learning Expansion

### Goals

- Add diagram and image annotation strategy.
- Add visual clue highlighting.
- Add image licensing workflow.
- Improve card and question visual layouts.

### Deliverables

- Visual asset model.
- Image viewer or annotation prototype.
- Medical image accessibility standards.

## Month 7 And Beyond: Scale And Quality

### Goals

- Add analytics for learning outcomes and content quality.
- Add offline review if approved.
- Add performance budget enforcement.
- Add content operations workflows.
- Prepare beta release.

### Deliverables

- Beta-ready product.
- Content quality dashboard.
- Release checklist.
- Incident and support process.

## Cross-Cutting Work

- Medical education review happens continuously.
- Accessibility review happens before every user-facing merge.
- Security review happens before auth, data, and analytics work.
- Performance budgets are measured before broad content ingestion.
- Documentation is updated with every meaningful change.

## Build Order Principle

Build the smallest trustworthy learning loop first:

1. Reviewed content object.
2. Fast practice interaction.
3. High-quality feedback.
4. Retention signal.
5. Review and improvement workflow.

