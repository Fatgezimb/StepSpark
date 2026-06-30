# Tech Stack

No production stack has been installed yet. This document records the initial direction and evaluation criteria.

## Stack Status

Current status: planning only.

All major technology choices require an architectural decision before installation.

## Evaluation Criteria

- Long-term maintainability
- Strong TypeScript support
- Accessibility support
- Performance on modest laptops and tablets
- Offline or PWA compatibility where relevant
- Testing ecosystem maturity
- Security model and maintenance health
- Fit for visual medical education workflows

## Provisional Direction

- **Language** - TypeScript
- **Application** - React-based web application, framework to be decided
- **Styling** - utility-first or token-driven CSS with accessible primitives
- **Data** - PostgreSQL-backed persistence, ORM/query layer to be decided
- **Authentication** - standards-based authentication, provider to be decided
- **Testing** - unit, integration, accessibility, and browser tests
- **Analytics** - privacy-aware product analytics and observability

## Do Not Install Yet

- UI framework
- Database SDK
- Authentication framework
- Analytics SDK
- Offline/PWA tooling
- Question-generation dependencies

See [docs/OPEN_SOURCE_RECOMMENDATIONS.md](docs/OPEN_SOURCE_RECOMMENDATIONS.md) for researched options.

