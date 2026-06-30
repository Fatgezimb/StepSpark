# StepSpark Design System

This design system defines the visual and component foundation for StepSpark. It contains no business logic, database code, review engine, or product workflow.

## Stack

- React + TypeScript for components
- Tailwind CSS 4 for design tokens and utility classes
- Radix Primitives for accessible behavior
- shadcn/ui conventions for source-owned components
- Lucide for icons
- Recharts for chart components
- Motion for restrained animation
- Storybook for documentation and review

## Tokens

Tokens live in [src/design-system/styles.css](../src/design-system/styles.css).

Included token groups:

- Typography
- Color
- Spacing
- Radius
- Shadow
- Focus ring
- Chart colors
- Motion timing and easing
- Dark mode

## Components

Components live under `src/design-system/components`.

Current components:

- Button
- Badge
- Card
- Input
- Textarea
- Label
- Checkbox
- Switch
- Select
- Tabs
- Table
- MetricChart
- Layout primitives

## Accessibility Standards

- Components use semantic HTML or Radix primitives.
- Focus states are visible.
- Inputs support `aria-invalid`.
- Interactive controls expose labels in stories.
- Dark mode uses semantic CSS variables.
- Motion respects `prefers-reduced-motion`.
- Tables remain horizontally scrollable on narrow screens.

## Storybook

Run:

```bash
npm run storybook
```

Build:

```bash
npm run build-storybook
```

Storybook includes foundation and component stories under `src/design-system/stories`.

## Boundaries

Do not add:

- Application pages
- Business logic
- Database clients
- Review engines
- Medical content generation
- Product workflow state

This phase stopped at design-system infrastructure and component examples.

## Application Shell Usage

The application shell composes this design system under `src/app`. It now hosts the local Instant Recall Card feature while continuing to exclude database access, review logic, authentication, question generation, and medical content workflows.
