import type { Meta, StoryObj } from "@storybook/react-vite";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BarChart3Icon,
  BookOpenIcon,
  FilterIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/design-system/icons";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { MetricChart } from "@/design-system/components/ui/metric-chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Switch } from "@/design-system/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/design-system/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/components/ui/tabs";
import { Textarea } from "@/design-system/components/ui/textarea";
import { Cluster, Container, DesignSystemSurface, ResponsiveGrid, Section, Stack } from "@/design-system/components/layout";

const chartData = [
  { label: "Mon", primary: 42, secondary: 21 },
  { label: "Tue", primary: 55, secondary: 28 },
  { label: "Wed", primary: 49, secondary: 32 },
  { label: "Thu", primary: 68, secondary: 37 },
  { label: "Fri", primary: 74, secondary: 41 },
  { label: "Sat", primary: 63, secondary: 39 },
  { label: "Sun", primary: 81, secondary: 46 },
];

const layoutCards: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Recognition", description: "Compact surfaces for fast pattern matching.", Icon: ActivityIcon },
  { title: "Retention", description: "Clear hierarchy for repeated review.", Icon: BookOpenIcon },
  { title: "Trust", description: "States and provenance stay visible.", Icon: ShieldCheckIcon },
];

const meta = {
  title: "Design System/Components",
  parameters: {
    docs: {
      description: {
        component: "Source-owned StepSpark UI components built from Radix primitives, Tailwind tokens, Lucide icons, and Recharts.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonsAndBadges: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Actions</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Buttons and status badges</h1>
            </Stack>
            <Card>
              <CardContent className="pt-5">
                <Stack className="gap-6">
                  <Cluster>
                    <Button>
                      <SparklesIcon data-icon="inline-start" />
                      Primary
                    </Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">
                      <FilterIcon data-icon="inline-start" />
                      Outline
                    </Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="accent">Accent</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button size="icon" aria-label="Search">
                      <SearchIcon />
                    </Button>
                  </Cluster>
                  <Cluster>
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Reviewed</Badge>
                    <Badge variant="warning">Needs check</Badge>
                    <Badge variant="destructive">Blocked</Badge>
                  </Cluster>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const Forms: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <ResponsiveGrid className="lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inputs</CardTitle>
                <CardDescription>Form controls with labels, focus states, disabled states, and validation styling.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="search">Search</Label>
                    <Input id="search" placeholder="Search topics, systems, or tags" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Write a short explanation..." />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>System</Label>
                    <Select defaultValue="cardio">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Organ systems</SelectLabel>
                          <SelectItem value="cardio">Cardiovascular</SelectItem>
                          <SelectItem value="renal">Renal</SelectItem>
                          <SelectItem value="pulm">Pulmonary</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Control States</CardTitle>
                <CardDescription>Binary controls use Radix primitives and visible labels.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack className="gap-5">
                  <label className="flex items-center gap-3 rounded-md border p-3">
                    <Checkbox defaultChecked aria-label="Include reviewed items" />
                    <span className="text-sm font-medium">Include reviewed items</span>
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-md border p-3">
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">Reduced motion</span>
                      <span className="text-sm text-muted-foreground">Keep transitions subtle.</span>
                    </span>
                    <Switch aria-label="Reduced motion" />
                  </label>
                  <Input aria-invalid placeholder="Invalid state" />
                </Stack>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const CardsAndLayout: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Stack className="gap-6">
            <Stack className="gap-2">
              <Badge>Layout</Badge>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal">Cards, sections, and responsive grids</h1>
            </Stack>
            <ResponsiveGrid>
              {layoutCards.map(({ title, description, Icon }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" size="sm">View state</Button>
                  </CardFooter>
                </Card>
              ))}
            </ResponsiveGrid>
          </Stack>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const TablesAndTabs: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <Card>
            <CardHeader>
              <CardTitle>Table Shell</CardTitle>
              <CardDescription>Tables stay compact, readable, and horizontally scrollable on narrow screens.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Signal</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ["Content block", "Ready", "Strong", "92"],
                        ["Form pattern", "Draft", "Moderate", "76"],
                        ["Media panel", "Needs check", "Weak", "61"],
                      ].map(([item, status, signal, score]) => (
                        <TableRow key={item}>
                          <TableCell className="font-medium">{item}</TableCell>
                          <TableCell>{status}</TableCell>
                          <TableCell>{signal}</TableCell>
                          <TableCell className="text-right tabular-nums">{score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="notes">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Tab panels preserve focus and spacing for dense operational interfaces.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};

export const Charts: Story = {
  render: () => (
    <DesignSystemSurface>
      <Container>
        <Section>
          <ResponsiveGrid className="lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="size-5 text-primary" aria-hidden="true" />
                  Area chart
                </CardTitle>
                <CardDescription>Accessible colors and readable axes for analytics surfaces.</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart data={chartData} primaryLabel="Current" secondaryLabel="Baseline" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bar chart</CardTitle>
                <CardDescription>Same token set, different visualization type.</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricChart data={chartData} kind="bar" primaryLabel="Current" secondaryLabel="Baseline" />
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Section>
      </Container>
    </DesignSystemSurface>
  ),
};
