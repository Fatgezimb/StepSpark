# AI Contribution Guide

This guide explains how AI assistants should contribute to StepSpark.

## Core Rule

AI should accelerate careful engineering, not bypass review. All AI-created work must be understandable, reviewable, and aligned with the repository standards.

## ChatGPT Usage

Use ChatGPT for:

- Product thinking and workflow exploration.
- Medical education explanation drafts.
- Prompt design and critique.
- Documentation outlines.
- Comparative technology analysis.
- Test case brainstorming.

Do not use ChatGPT output as final medical content without expert review.

## Codex Usage

Use Codex for:

- Repository edits.
- Refactoring.
- Test creation.
- Bug fixes.
- Documentation updates.
- Pull request preparation.

Codex must read the existing code and docs before changing files. It should keep edits focused, run relevant checks, and summarize what changed.

## Local LLM Usage

Use local LLMs for:

- Private brainstorming.
- Draft summarization.
- Local search over documentation.
- Non-sensitive prototype workflows.

Local LLMs should not be trusted for medical correctness without review. They should not be given secrets, private learner data, or credentials.

## GitHub Usage

Use GitHub as the source of truth for:

- Issues
- Pull requests
- Code review
- Release notes
- Architecture decisions linked from pull requests
- CI results

No large architectural change should exist only in chat history.

## Review Workflow

AI-created pull requests should be reviewed for:

- Correctness
- Scope control
- Medical education quality
- Accessibility
- Security
- Performance
- Test coverage
- Documentation updates

If the reviewer cannot explain the change, the change is not ready.

## Architectural Decisions

Record architectural decisions in [DECISIONS.md](../DECISIONS.md). When a decision becomes large or controversial, create a dedicated ADR under `docs/decisions/`.

## Documentation Maintenance

Documentation must be updated in the same pull request as the behavior it describes. Outdated documentation should be treated as technical debt.

## Prompt Hygiene

Reusable prompts belong in `prompts/`. Prompts should include purpose, expected inputs, expected outputs, quality checks, and known failure modes.

