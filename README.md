# StepSpark

StepSpark is planned as a USMLE Step 1 visual learning platform focused on Instant Recall Cards, NBME-style question generation, rapid recognition, and long-term retention.

This repository now contains the engineering foundation, source-owned design system, application shell, and the first local Instant Recall Card prototype. The prototype is frontend-local and not production medical content.

## Mission

Create the world's best USMLE Step 1 visual learning platform by combining high-quality medical education, visual memory systems, question-writing rigor, fast interaction design, and disciplined engineering.

## Current Scope

The current repository establishes:

- Repository structure
- Engineering documentation
- Agent responsibilities
- GitHub workflow standards
- Architectural decision process
- Technology evaluation guidance
- AI contribution rules
- Multi-month development plan
- Source-owned design system
- Vite/React application shell
- Local Instant Recall Card engine with runtime validation and tests

## Repository Map

- `agents/` - role definitions for AI and human contributors
- `design/` - design system notes, visual standards, and future assets
- `docs/` - engineering workflow, recommendations, and planning
- `prompts/` - reusable prompts for future AI-assisted workflows
- `public/` - future static assets, intentionally empty of product assets for now
- `scripts/` - future developer automation, intentionally empty for now
- `src/` - application shell, design system, and local Instant Recall Card feature
- `.github/` - pull request and issue templates

## Guardrails

- Do not add generated medical content yet.
- Do not install large dependency stacks without an architectural decision.
- Do not treat AI output as accepted medical content without expert review.
- Do not add database persistence, authentication, review engines, question generation, or analytics until ADRs approve them.

## Local Development

```bash
npm run dev
npm test
npm run test:e2e
npm run ci
```

## GitHub Pages Deployment

This repository is configured to publish the Vite app to GitHub Pages with
`.github/workflows/pages.yml`.

To publish:

1. Push the repository to GitHub.
2. Open the repository settings, then `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or run the `Deploy GitHub Pages` workflow manually.

The workflow builds with `VITE_BASE_PATH=/<repository-name>/`, which is required
for GitHub project pages. Repositories named `<owner>.github.io` automatically
build with `/` as the base path.

For a local Pages-equivalent build:

```bash
VITE_BASE_PATH=/your-repository-name/ npm run build:app
```

## How To Contribute

Start with:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/AI_CONTRIBUTION_GUIDE.md](docs/AI_CONTRIBUTION_GUIDE.md)
- [docs/DEVELOPMENT_MASTER_PLAN.md](docs/DEVELOPMENT_MASTER_PLAN.md)
- [DECISIONS.md](DECISIONS.md)

Every meaningful technical choice should be documented before implementation begins or in the same pull request as the implementation.
