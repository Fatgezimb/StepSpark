# Open-Source Recommendations

Research date: 2026-06-28

This document recommends modern open-source projects to evaluate for StepSpark. These are recommendations only. Do not install a category until an ADR approves it.

## UI Libraries

### Recommended

- [Radix UI](https://www.radix-ui.com/) plus [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Base UI](https://base-ui.com/) as an alternative primitive layer

### Pros

- Strong accessibility primitives.
- Good fit for dense study tools.
- Copy-owned components can be customized deeply.
- Tailwind supports fast token-driven iteration.

### Cons

- shadcn/ui components become local code that must be maintained.
- Tailwind discipline is required to avoid inconsistent styling.
- Primitive libraries do not provide full product design by themselves.

## Search

### Recommended

- [Typesense](https://typesense.org/)
- [Meilisearch](https://www.meilisearch.com/)
- [PostgreSQL full-text search](https://www.postgresql.org/docs/current/textsearch.html) for simpler early needs

### Pros

- Typesense and Meilisearch provide typo-tolerant search and fast filtering.
- PostgreSQL search avoids extra infrastructure in early phases.
- Search can support topics, tags, organ systems, and weak areas.

### Cons

- Dedicated search engines add operational complexity.
- Medical synonyms and abbreviations will still need domain-specific curation.
- Search relevance must be tested against real learner tasks.

## Tables And Data Grids

### Recommended

- [TanStack Table](https://tanstack.com/table/latest)

### Pros

- Headless and highly flexible.
- Strong TypeScript fit.
- Good for review queues, content operations, and analytics tables.

### Cons

- Requires building accessible UI behavior around the headless model.
- Advanced grids may need virtualization and careful keyboard support.

## Editors

### Recommended

- [Tiptap](https://tiptap.dev/)
- [Lexical](https://lexical.dev/)
- [BlockNote](https://www.blocknotejs.org/) for block-style authoring evaluation
- [MDXEditor](https://mdxeditor.dev/) for markdown-oriented workflows

### Pros

- Tiptap and Lexical are strong foundations for structured rich text.
- Block editors may fit content authoring.
- Markdown workflows are easier to diff and review.

### Cons

- Rich text editors are complex and should be introduced only when authoring requirements are clear.
- Medical content needs schema constraints beyond generic text editing.
- Collaborative editing adds substantial complexity.

## Charts

### Recommended

- [Recharts](https://recharts.org/)
- [Apache ECharts](https://echarts.apache.org/)
- [Nivo](https://nivo.rocks/)

### Pros

- Recharts is approachable for dashboard basics.
- ECharts is powerful for complex interactive charts.
- Nivo offers polished React chart primitives.

### Cons

- Chart accessibility varies and must be tested.
- Complex charting can distract from learning if overused.
- Analytics definitions matter more than visual polish.

## Animations

### Recommended

- [Motion](https://motion.dev/)
- [React Spring](https://www.react-spring.dev/)
- [Lottie](https://lottiefiles.com/open-source)

### Pros

- Motion is ergonomic for interface transitions.
- React Spring can model physics-based interactions.
- Lottie can support lightweight educational animations.

### Cons

- Motion must respect reduced-motion settings.
- Animation can harm study speed if used decoratively.
- Medical mechanism animations need accuracy review.

## Diagramming

### Recommended

- [Mermaid](https://mermaid.js.org/)
- [React Flow / XYFlow](https://reactflow.dev/)
- [Excalidraw](https://github.com/excalidraw/excalidraw)
- [tldraw](https://www.tldraw.com/)

### Pros

- Mermaid is excellent for docs and simple generated diagrams.
- React Flow fits interactive pathways and concept maps.
- Excalidraw and tldraw are strong whiteboard-style tools.

### Cons

- Interactive diagram editors can become their own product surface.
- Generated diagrams need medical and visual review.
- Diagram data models should be decided before implementation.

## Image Viewers And Annotation

### Recommended

- [OpenSeadragon](https://openseadragon.github.io/)
- [PhotoSwipe](https://photoswipe.com/)
- [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch)
- [Annotorious](https://annotorious.dev/)

### Pros

- OpenSeadragon supports deep zoom for large images.
- PhotoSwipe is useful for galleries.
- Zoom and annotation tools can support visual recognition training.

### Cons

- Medical images require licensing and attribution diligence.
- Annotation accessibility is difficult and must be planned.
- Large image assets can affect performance and offline storage.

## Authentication

### Recommended

- [Auth.js](https://authjs.dev/)
- [Better Auth](https://www.better-auth.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### Pros

- Auth.js is established in the JavaScript ecosystem.
- Better Auth is TypeScript-focused and modern.
- Supabase Auth can simplify auth if Supabase is selected.

### Cons

- Authentication choice is tightly coupled to deployment, database, and user model.
- Medical learning data needs careful privacy handling.
- Migration away from auth providers can be costly.

## Database And Data Access

### Recommended

- [PostgreSQL](https://www.postgresql.org/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Prisma](https://www.prisma.io/)
- [Kysely](https://kysely.dev/)

### Pros

- PostgreSQL is a strong default for relational content and learner events.
- Supabase combines Postgres, auth, storage, and realtime options.
- Neon offers serverless Postgres.
- Drizzle, Prisma, and Kysely all have strong TypeScript stories.

### Cons

- ORM choice affects migrations, query control, and type safety.
- Supabase can be convenient but should not hide data-model discipline.
- Learner analytics may require separate modeling from content data.

## PWA And Offline Support

### Recommended

- [Workbox](https://developer.chrome.com/docs/workbox)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Dexie.js](https://dexie.org/)

### Pros

- Offline review can become a major learner advantage.
- Dexie provides a practical IndexedDB layer.
- Workbox can support caching strategies.

### Cons

- Offline data sync is hard and can corrupt learning state if designed casually.
- Storage quotas and asset size need testing.
- Offline support should begin with narrow workflows.

## Accessibility

### Recommended

- [axe-core](https://github.com/dequelabs/axe-core)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- Radix UI accessibility primitives

### Pros

- Automated checks catch many regressions.
- Testing Library encourages user-centered tests.
- Playwright supports browser-level keyboard and screen behavior checks.

### Cons

- Automated tools do not prove full accessibility.
- Medical diagrams and image annotation need manual accessibility review.
- Keyboard workflows must be designed, not patched later.

## Testing

### Recommended

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/) for API mocking when APIs exist

### Pros

- Vitest is fast and ergonomic for TypeScript projects.
- Playwright covers real browser workflows.
- MSW keeps integration tests closer to user behavior.

### Cons

- Test strategy must avoid brittle UI snapshots.
- Generated content systems will need deterministic fixtures.
- E2E tests require maintenance discipline.

## Analytics And Observability

### Recommended

- [PostHog](https://posthog.com/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Sentry](https://sentry.io/open-source/) for error monitoring evaluation

### Pros

- PostHog supports product analytics and feature flags.
- OpenTelemetry supports vendor-neutral traces and metrics.
- Analytics can expose content quality and learning outcomes.

### Cons

- Privacy rules must be established before tracking learner behavior.
- Analytics events need naming governance.
- Too many metrics can obscure actual learning outcomes.

## State Management

### Recommended

- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Jotai](https://jotai.org/)

### Pros

- TanStack Query is a strong default for server state.
- Zustand is simple for local client state.
- Jotai fits fine-grained state modeling.

### Cons

- State libraries should be added only when framework primitives are insufficient.
- Mixing too many state models increases cognitive load.
- Offline sync may require a separate state strategy.

## Virtualization

### Recommended

- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [React Virtuoso](https://virtuoso.dev/)
- [react-window](https://github.com/bvaughn/react-window)

### Pros

- Useful for large card decks, search results, and content tables.
- TanStack Virtual pairs well with TanStack Table.
- React Virtuoso provides higher-level list behavior.

### Cons

- Virtualized lists can break accessibility if implemented poorly.
- Dynamic item heights require careful testing.
- Virtualization should be applied where measurement proves need.

## Recommendation Process

Before installing any recommendation:

1. Create or update an ADR.
2. Define the StepSpark use case.
3. Compare at least two options.
4. Check accessibility and maintenance status.
5. Prototype only the risky part.
6. Document the final choice and migration risks.

