import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/design-system/lib/utils";

type ChartKind = "area" | "bar";

export interface MetricChartDatum {
  label: string;
  primary: number;
  secondary?: number;
}

export interface MetricChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: MetricChartDatum[];
  kind?: ChartKind;
  primaryLabel?: string;
  secondaryLabel?: string;
}

const axisColor = "var(--ds-muted-foreground)";
const gridColor = "var(--ds-border)";

function MetricChart({
  data,
  kind = "area",
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
  className,
  ...props
}: MetricChartProps) {
  const chart = kind === "bar" ? (
    <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
      <CartesianGrid stroke={gridColor} vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
      <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} width={32} />
      <Tooltip content={<ChartTooltip primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} />} />
      <Bar dataKey="primary" fill="var(--ds-chart-1)" radius={[4, 4, 0, 0]} />
      <Bar dataKey="secondary" fill="var(--ds-chart-2)" radius={[4, 4, 0, 0]} />
    </BarChart>
  ) : (
    <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
      <CartesianGrid stroke={gridColor} vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
      <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} width={32} />
      <Tooltip content={<ChartTooltip primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} />} />
      <Area
        type="monotone"
        dataKey="primary"
        stroke="var(--ds-chart-1)"
        fill="var(--ds-chart-1)"
        fillOpacity={0.18}
        strokeWidth={2}
      />
      <Area
        type="monotone"
        dataKey="secondary"
        stroke="var(--ds-chart-2)"
        fill="var(--ds-chart-2)"
        fillOpacity={0.12}
        strokeWidth={2}
      />
    </AreaChart>
  );

  return (
    <div className={cn("h-64 w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  primaryLabel,
  secondaryLabel,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-popover">
      <div className="mb-1 font-medium">{label}</div>
      <div className="flex flex-col gap-1 text-muted-foreground">
        {payload.map((item) => (
          <div key={String(item.dataKey)} className="flex items-center justify-between gap-6">
            <span>{item.dataKey === "primary" ? primaryLabel : secondaryLabel}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MetricChart };

