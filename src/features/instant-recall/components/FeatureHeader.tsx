import { DownloadIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";

export function FeatureHeader({
  onExport,
  onNew,
}: {
  onExport: () => void;
  onNew: () => void;
}) {
  return (
    <section className="exam-banner order-1 rounded-xl p-5 sm:p-6">
      <div className="relative z-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <Badge className="border-white/30 bg-white/12 text-white" variant="outline">Instant Recall Cards</Badge>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl">
          Build recognition-first memory cards.
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-white/82">
          Create, search, tag, filter, import, export, and preview Instant Recall Cards. Seed cards are draft examples and require review before production use.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="border-white/25 bg-white/12 text-white hover:bg-white/20" variant="outline" onClick={onExport}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onNew}>
            <PlusIcon data-icon="inline-start" />
            New card
          </Button>
        </div>
      </div>
    </section>
  );
}
