export const spacingScale = [
  { name: "0", value: "0" },
  { name: "1", value: "0.25rem" },
  { name: "2", value: "0.5rem" },
  { name: "3", value: "0.75rem" },
  { name: "4", value: "1rem" },
  { name: "5", value: "1.25rem" },
  { name: "6", value: "1.5rem" },
  { name: "8", value: "2rem" },
  { name: "10", value: "2.5rem" },
  { name: "12", value: "3rem" },
  { name: "16", value: "4rem" },
] as const;

export const colorTokens = [
  "background",
  "foreground",
  "card",
  "primary",
  "secondary",
  "muted",
  "accent",
  "success",
  "warning",
  "destructive",
  "border",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export const typeScale = [
  { name: "Display", className: "text-5xl leading-[1.02] font-semibold tracking-normal" },
  { name: "Heading 1", className: "text-4xl leading-tight font-semibold tracking-normal" },
  { name: "Heading 2", className: "text-3xl leading-tight font-semibold tracking-normal" },
  { name: "Heading 3", className: "text-2xl leading-snug font-semibold tracking-normal" },
  { name: "Body", className: "text-base leading-7 font-normal tracking-normal" },
  { name: "Small", className: "text-sm leading-6 font-normal tracking-normal" },
  { name: "Caption", className: "text-xs leading-5 font-medium tracking-normal" },
] as const;

export const motionTokens = {
  fast: "120ms",
  normal: "180ms",
  slow: "260ms",
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

