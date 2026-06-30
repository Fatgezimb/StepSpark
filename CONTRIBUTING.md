# Contributing

StepSpark uses a documentation-first workflow. During Phase 0, contributions should improve structure, standards, planning, and decision quality only.

## Contribution Rules

- Start from an issue or documented task.
- Keep pull requests small and reviewable.
- Update documentation with the change.
- Add tests when behavior is introduced in future phases.
- Do not add application code during Phase 0.
- Do not add medical content without a review process.

## Branch Names

Use:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`
- `decision/<short-description>`
- `codex/<short-description>` for Codex-created branches

## Commit Messages

Use Conventional Commits:

- `docs: add AI contribution guide`
- `chore: create repository folders`
- `feat: add card review shell` later, when implementation begins

See [docs/COMMIT_MESSAGES.md](docs/COMMIT_MESSAGES.md).

## Pull Requests

Every pull request should include:

- Purpose
- Scope
- Screenshots or recordings when UI exists
- Testing notes
- Documentation updates
- Risks and rollback notes

## Review Expectations

Reviewers should prioritize correctness, maintainability, accessibility, performance, security, and medical education quality. See [docs/PR_REVIEW_STANDARD.md](docs/PR_REVIEW_STANDARD.md).

