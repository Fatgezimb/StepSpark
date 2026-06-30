import type { Meta, StoryObj } from "@storybook/react-vite";
import { motion } from "motion/react";
import { colorTokens, spacingScale, typeScale } from "@/design-system/tokens";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Cluster, Container, DesignSystemSurface, ResponsiveGrid, Section, Stack } from "@/design-system/components/layout";

const meta = {
  title: "Design System/Foundations",
  parameters: {
    docs: {
      description: {
        component: "StepSpark design tokens for typography, colors, spacing, motion, and responsive layout.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typography: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Typography</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Clear hierarchy for fast study surfaces</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                The type system is built for dense medical learning interfaces: compact labels, readable body copy, and restrained headings.
              </p>
            </Stack>
            <Card>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-6">
                  {typeScale.map((item) => (
                    <div key={item.name} className="grid gap-3 border-b pb-5 last:border-b-0 last:pb-0 md:grid-cols-[10rem_1fr]">
                      <div className="text-sm font-medium text-muted-foreground">{item.name}</div>
                      <div className={item.className}>Recognition improves when hierarchy is predictable.</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const Colors: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Color</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Accessible clinical palette</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Neutral surfaces carry most of the UI. Teal, indigo, coral, green, amber, and red are reserved for meaning.
              </p>
            </Stack>
            <ResponsiveGrid>
              {colorTokens.map((token) => (
                <Card key={token}>
                  <CardHeader>
                    <CardTitle>{token}</CardTitle>
                    <CardDescription>var(--ds-{token})</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-20 rounded-md border"
                      style={{ backgroundColor: `var(--ds-${token})` }}
                    />
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const SpacingAndRadius: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Spacing</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Compact rhythm without crowding</h1>
            </Stack>
            <Card>
              <CardContent className="pt-5">
                <Stack className="gap-4">
                  {spacingScale.map((space) => (
                    <div key={space.name} className="grid items-center gap-3 md:grid-cols-[5rem_8rem_1fr]">
                      <div className="text-sm font-medium">{space.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{space.value}</div>
                      <div className="h-3 rounded-sm bg-primary" style={{ width: space.value }} />
                    </div>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Cluster>
              <div className="size-16 rounded-xs border bg-card" />
              <div className="size-16 rounded-sm border bg-card" />
              <div className="size-16 rounded-md border bg-card" />
              <div className="size-16 rounded-lg border bg-card" />
              <div className="size-16 rounded-xl border bg-card" />
            </Cluster>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const Motion: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Motion</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Subtle state changes only</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Motion should clarify state and hierarchy. It must respect reduced-motion preferences.
              </p>
            </Stack>
            <ResponsiveGrid>
              {["Fade", "Slide", "Scale"].map((label, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{label}</CardTitle>
                      <CardDescription>Designed for feedback and disclosure.</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};
