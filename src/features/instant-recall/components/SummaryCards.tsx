import { Card, CardContent, CardDescription, CardHeader } from "@/design-system/components/ui/card";

type DeckSummary = {
  total: number;
  filtered: number;
  draft: number;
  reviewed: number;
};

export function SummaryCards({ summary }: { summary: DeckSummary }) {
  return (
    <section className="order-3 grid grid-cols-2 gap-3 xl:order-2 xl:grid-cols-4" aria-label="Instant Recall deck summary">
      <SummaryCard label="Total cards" value={String(summary.total)} detail="Current local deck" tone="blue" />
      <SummaryCard label="Filtered" value={String(summary.filtered)} detail="Visible after search" tone="purple" />
      <SummaryCard label="Draft" value={String(summary.draft)} detail="Needs medical review" tone="amber" />
      <SummaryCard label="Reviewed" value={String(summary.reviewed)} detail="Approved placeholder state" tone="green" />
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "purple" | "amber" | "green";
}) {
  const toneClass = {
    blue: "exam-panel",
    purple: "exam-panel-purple",
    amber: "exam-panel-amber",
    green: "exam-panel-green",
  }[tone];

  return (
    <Card className={toneClass}>
      <CardHeader className="p-4 sm:p-6">
        <CardDescription className="font-bold uppercase tracking-normal text-primary">{label}</CardDescription>
        <div className="text-3xl font-extrabold leading-none tracking-normal">{value}</div>
      </CardHeader>
      <CardContent className="hidden px-4 pb-4 sm:block sm:px-6 sm:pb-6">
        <div className="text-sm font-medium text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}
