# Application Shell

The StepSpark application shell establishes the product frame and hosts the first local learning feature: Instant Recall Cards.

## Included

- Sidebar navigation
- Mobile navigation
- Top search bar
- Instant Recall Card feature surface
- Settings shell
- Theme toggle
- Right settings/status rail
- Responsive layout behavior

## Excluded

- Database persistence
- Question generation
- Authentication
- Review engine
- Medical content workflows
- API calls

## Implementation

The shell lives in `src/app` and composes the design-system components from `src/design-system`. The first feature lives in `src/features/instant-recall`.

Shell support links and some settings controls are intentionally marked as future-facing scaffolding until the underlying workflows are implemented.

Run locally:

```bash
npm run dev
```

Storybook remains available:

```bash
npm run storybook
```

Quality checks:

```bash
npm run ci
```
