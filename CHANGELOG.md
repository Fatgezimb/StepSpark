# Changelog

All notable changes to StepSpark will be documented in this file.

The format follows the spirit of Keep a Changelog and uses semantic versioning once releases begin.

## Unreleased

### Added

- Phase 0 repository foundation.
- Project vision, roadmap, architecture, style, and tech stack documentation.
- Agent role definitions.
- GitHub pull request and issue templates.
- AI contribution guide.
- Open-source recommendation research.
- Development master plan.
- Dark premium StepSpark dashboard shell inspired by the visual redesign scaffold.
- Scaffold-style Instant Recall workspace with metadata rail, responsive card board, fluency controls, dashboard modules, and keyboard shortcut strip.
- Validated visual-media metadata for Instant Recall cards, including source, license, provenance, and use-case fields.
- Seed-card visual assets using sourced open/public-domain medical images and original local SVG diagrams.
- Visual media strategy documentation covering image selection, attribution, and local Ollama model roles.
- Versioned local Instant Recall deck persistence, local review signals, bookmark state, reset-to-seed recovery, and GitHub Pages-safe media path resolution.
- Real app-section navigation and command search across cards, sections, tags, systems, and concepts.
- Optional Instant Recall task prompts for clearer learner-facing questions, with backward-compatible imports and fallback prompt derivation.

### Changed

- Restyled the card library, filters, workbench, and app surfaces to match the dark medical education dashboard direction while preserving existing card workflows.
- Updated the Instant Recall card board to show progressive-disclosure media without answer-bearing captions before reveal.
- Replaced hard-coded review metrics and misleading disabled controls with local state-derived metrics, print, bookmark, export JSON, and coming-soon panels.
- Improved filtered empty states so zero-result searches never show stale selected cards.
- Redesigned the Instant Recall learning flow around task, large contained visual, clinical scenario, prediction, reveal, explanation, and supporting rationale.
- Improved visual-media readability with object-contained display, larger media frames, accessible full-image viewing, captions, source, and license metadata.
- Expanded keyboard navigation with left/right card movement, up/down card-or-section movement, scoped shortcut blocking for text entry and modals, and visible shortcut documentation.
- Improved Dashboard and Card Library flow with section CTAs, task-aware library rows, visual/review state indicators, and focus return to the selected card viewer.
- Reworked the app information architecture around Today, Review, Library, Must Not Miss, Progress, Build, and Prototype sections so the next study action is clear on first load.
- Added a stronger Today's StepSpark Mission dashboard, high-risk Must Not Miss queue, local-only analytics view, and polished prototype preview panels for planned surfaces.
- Split production builds into deterministic vendor chunks so Vite no longer emits an oversized single JavaScript chunk warning.
- Improved remote visual resilience with an explicit loading state, persistent source/license metadata, and a full-image fallback when media fails to load.
