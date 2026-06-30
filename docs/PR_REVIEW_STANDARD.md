# Pull Request Review Standard

Reviewers should protect product quality, learner trust, and long-term maintainability.

## Review Priorities

1. Correctness
2. Medical safety and educational quality
3. Security and privacy
4. Accessibility
5. Performance
6. Maintainability
7. Documentation

## What To Look For

- Does the change solve the stated problem?
- Is the scope appropriate?
- Are edge cases handled?
- Are tests meaningful?
- Are docs updated?
- Are risks explicit?
- Is the implementation consistent with existing decisions?

## Reasons To Block A Pull Request

- Medical content is unreviewed but presented as final.
- Security or privacy risk is unresolved.
- Accessibility regression is introduced.
- Tests are missing for critical behavior.
- The implementation contradicts an accepted decision.
- The pull request is too broad to review safely.

