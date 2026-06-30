# Branch Strategy

## Default Branch

`main` is the stable integration branch.

## Branch Types

- `docs/<short-description>` - documentation changes
- `feature/<short-description>` - product or platform features
- `fix/<short-description>` - bug fixes
- `chore/<short-description>` - maintenance
- `decision/<short-description>` - ADRs and major technical decisions
- `codex/<short-description>` - branches created by Codex

## Branch Rules

- Keep branches focused on one concern.
- Rebase or merge from `main` before review if the branch is stale.
- Do not mix formatting churn with functional changes.
- Do not commit secrets, credentials, or exported learner data.
- Delete merged branches unless needed for release support.

## Release Branches

Release branches should not be created until the product has deployable versions.

