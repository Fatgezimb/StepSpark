# Style Guide

This guide defines early product and engineering style expectations. It will evolve once design artifacts and application code exist.

## Product Voice

- Clear, direct, and clinically precise.
- Encouraging without being casual about medical accuracy.
- Explanations should teach the principle, the clue, and the trap.
- Avoid vague claims such as "high-yield" unless the reason is explicit.

## Medical Education Style

- Use standard medical terminology.
- Prefer concise explanations with high signal.
- Tie visual prompts to tested mechanisms.
- Make distractor explanations specific.
- Include citations or source notes for medical claims when content enters production.

## Visual Design Principles

- Dense but readable study surfaces.
- Strong hierarchy for question stems, clues, diagnosis, mechanism, and explanation.
- Visual assets should clarify recognition patterns.
- Avoid decorative illustration that does not improve recall.
- Use color to encode meaning, not just brand.

## Design Tokens

StepSpark design tokens live in [src/design-system/styles.css](/Users/fatgezimbela/Documents/USMLE%20Step%201%20-%20Q%20bank%20Prep/src/design-system/styles.css).

- Colors: use semantic `--ds-*` tokens for base product UI and `--spark-*` utility classes for premium dark medical surfaces. Meaningful accents are teal for recognition rules, emerald for correct answers, amber for caution/pearls, rose for risk, violet for priority/study-state emphasis, and sky for navigation or metadata.
- Spacing: use compact `--spark-space-1` through `--spark-space-4` for dense card internals, with Tailwind `gap-*` utilities for layout rhythm. Avoid large marketing-style whitespace inside study surfaces.
- Radii: use `--ds-radius-*` for generic components and `--spark-radius-panel` for card sections. Repeated panels should generally stay between `0.75rem` and `1rem`.
- Shadows: use `--ds-shadow-card` for standard cards, `--ds-shadow-popover` for overlays, and `.spark-panel` / `.spark-panel-strong` when glass surfaces need depth.
- Typography scale: use `--spark-text-micro`, `--spark-text-small`, `--spark-text-body`, and `--spark-text-title` for study-card density. Reserve larger type for the card title and revealed answer.
- Badge variants: use `.spark-status-chip` with `.spark-badge-gold`, `.spark-badge-rose`, `.spark-badge-violet`, or `.spark-badge-green` for ROI, Must Not Miss, difficulty, fluency, and reviewed state indicators.

## Accessibility Principles

- Design must work without color alone.
- All interactive controls must be keyboard reachable.
- Text should remain readable at common zoom levels.
- Motion should be optional or reduced when requested by the user.
- Medical images should include useful alt text or adjacent explanation.

## Code Style Principles

- Prefer TypeScript when implementation begins.
- Prefer explicit domain models over loosely shaped objects.
- Keep business logic out of UI components.
- Use tests to lock behavior that affects study outcomes.
- Keep naming consistent with product language.

## Documentation Style

- Use Markdown for project documentation.
- Start each major document with purpose and scope.
- Keep docs current in the same pull request as code changes.
- Link related decisions, issues, and pull requests.
