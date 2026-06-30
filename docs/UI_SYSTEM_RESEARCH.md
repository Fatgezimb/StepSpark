# UI System Research

Research date: 2026-06-28

The goal was to choose a design-system foundation for StepSpark, not a finished application kit. The winning stack must support dense medical learning tools, strong accessibility, dark mode, long-term customization, Storybook-driven review, and source ownership.

## GitHub Comparison

Repository metrics were checked through the GitHub API on 2026-06-28.

| System | GitHub | Stars | License | Strengths | Tradeoffs |
| --- | --- | ---: | --- | --- | --- |
| shadcn/ui | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 117,660 | MIT | Source-owned components, excellent Tailwind/Radix ecosystem fit, strong for custom design systems | Components become local code that must be maintained |
| Material UI | [mui/material-ui](https://github.com/mui/material-ui) | 98,487 | MIT | Mature, broad component coverage, strong enterprise adoption | Material visual language is opinionated and harder to make uniquely StepSpark |
| Ant Design | [ant-design/ant-design](https://github.com/ant-design/ant-design) | 98,490 | MIT | Very complete enterprise UI system, strong tables/forms | Heavy enterprise look and design assumptions |
| Chakra UI | [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui) | 40,478 | MIT | Accessible component system, productive API | Runtime style abstraction can compete with token/source ownership goals |
| Mantine | [mantinedev/mantine](https://github.com/mantinedev/mantine) | 31,328 | MIT | Large React component library, polished hooks and inputs | More complete framework than StepSpark needs at this phase |
| HeroUI | [heroui-inc/heroui](https://github.com/heroui-inc/heroui) | 29,730 | Apache-2.0 | Modern Tailwind-based component library, attractive defaults | Visual system is more prepackaged and less source-owned |
| Headless UI | [tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) | 28,643 | MIT | Accessible unstyled primitives from Tailwind team | Smaller component surface; would require more custom buildout |
| Radix Primitives | [radix-ui/primitives](https://github.com/radix-ui/primitives) | 19,013 | MIT | Excellent low-level accessible primitives | Not a full visual component library by itself |

## Selected Foundation

StepSpark should use:

- [shadcn/ui](https://ui.shadcn.com/) component architecture
- [Radix Primitives](https://www.radix-ui.com/primitives) for accessible behavior
- [Tailwind CSS](https://tailwindcss.com/) for token-driven styling
- [Lucide](https://lucide.dev/) for consistent outline icons
- [Recharts](https://recharts.org/) for early chart components
- [Motion](https://motion.dev/) for restrained interaction animation
- [Storybook](https://storybook.js.org/) for component review and documentation

## Why This Is Best For StepSpark

StepSpark needs a custom learning interface, not a generic admin dashboard. shadcn/ui plus Radix gives the project source-owned components with accessible behavior underneath. Tailwind keeps tokens visible in code, Storybook gives reviewers a stable workshop, and the design language can evolve around medical learning workflows instead of inheriting Material or enterprise SaaS defaults.

## Why The Others Were Not Selected

- Material UI and Ant Design are excellent but carry strong visual assumptions.
- Chakra and Mantine are productive but introduce broader component frameworks before StepSpark needs them.
- HeroUI is modern and polished, but StepSpark benefits more from source-owned local components.
- Headless UI and Radix alone are strong primitives, but shadcn provides a practical component layer on top.

## Decision

Adopt a shadcn-style, source-owned design system built on Radix, Tailwind, Lucide, Recharts, Motion, and Storybook.

