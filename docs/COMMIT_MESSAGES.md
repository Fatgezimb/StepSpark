# Commit Message Format

StepSpark uses Conventional Commits.

## Format

```text
<type>(optional-scope): <summary>
```

## Common Types

- `docs` - documentation only
- `chore` - repository maintenance
- `feat` - user-facing feature
- `fix` - bug fix
- `test` - tests
- `refactor` - restructuring without behavior change
- `perf` - performance improvement
- `security` - security hardening

## Examples

```text
docs: add AI contribution guide
chore: create repository folder structure
decision: record authentication evaluation criteria
test: add card scheduling unit tests
```

## Rules

- Use present tense.
- Keep the first line under 72 characters when practical.
- Explain why in the body when the change is not obvious.
- Reference issues or ADRs when relevant.

