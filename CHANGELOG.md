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

### Changed

- Restyled the card library, filters, workbench, and app surfaces to match the dark medical education dashboard direction while preserving existing card workflows.
- Updated the Instant Recall card board to show progressive-disclosure media without answer-bearing captions before reveal.
- Replaced hard-coded review metrics and misleading disabled controls with local state-derived metrics, print, bookmark, export JSON, and coming-soon panels.
- Improved filtered empty states so zero-result searches never show stale selected cards.
