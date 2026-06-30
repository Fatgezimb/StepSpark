import { Badge } from "@/design-system/components/ui/badge";
import type { RecallStatus } from "../schema";
import { formatOption } from "./format";

export function StatusBadge({ status }: { status: RecallStatus }) {
  const variant = status === "reviewed" ? "success" : status === "needs-review" ? "warning" : "secondary";

  return <Badge variant={variant}>{formatOption(status)}</Badge>;
}
