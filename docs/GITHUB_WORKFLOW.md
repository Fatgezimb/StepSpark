# GitHub Workflow

## Issues

Every meaningful change should start with an issue, task, bug report, feature request, or ADR proposal.

## Pull Requests

Pull requests should be small, focused, and linked to the issue they address.

Required pull request sections:

- Summary
- Scope
- Testing
- Documentation
- Risks
- Review focus

## Reviews

Review should be role-aware:

- Architecture changes need architect review.
- UI changes need frontend and UI/UX review.
- Medical content changes need medical education review.
- Data or auth changes need security review.
- Performance-sensitive changes need performance review.

## Merge Criteria

A pull request may merge only when:

- Required reviews are complete.
- CI passes once CI exists.
- Documentation is current.
- No unresolved high-severity comments remain.
- The change fits the approved scope.

## Labels

Recommended labels:

- `type:docs`
- `type:feature`
- `type:bug`
- `type:decision`
- `area:frontend`
- `area:backend`
- `area:content`
- `area:accessibility`
- `area:security`
- `area:performance`
- `priority:high`
- `blocked`

