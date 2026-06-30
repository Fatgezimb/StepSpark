import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion } from "motion/react";
import {
  BarChart3Icon,
  BellIcon,
  BookOpenCheckIcon,
  ChevronRightIcon,
  CommandIcon,
  CompassIcon,
  Edit3Icon,
  FlameIcon,
  GaugeIcon,
  HomeIcon,
  ImportIcon,
  LibraryIcon,
  MenuIcon,
  NetworkIcon,
  SearchIcon,
  StarIcon,
  TargetIcon,
  ZapIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/components/ui/card";
import { Input } from "@/design-system/components/ui/input";
import { cn } from "@/design-system/lib/utils";
import { InstantRecallEngine } from "@/features/instant-recall/InstantRecallEngine";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const mainNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon },
  { id: "daily-review", label: "Daily Review", icon: BookOpenCheckIcon, badge: "23" },
  { id: "card-library", label: "Card Library", icon: LibraryIcon },
  { id: "must-not-miss", label: "Must Not Miss", icon: StarIcon },
  { id: "analytics", label: "Analytics", icon: BarChart3Icon },
];

const createNavItems: NavItem[] = [
  { id: "card-editor", label: "Card Editor", icon: Edit3Icon },
  { id: "import-text", label: "Import from Text", icon: ImportIcon },
];

const toolNavItems: NavItem[] = [
  { id: "concept-map", label: "Concept Map", icon: NetworkIcon, badge: "New" },
  { id: "nbme-challenge", label: "NBME Challenge", icon: TargetIcon, badge: "Beta" },
];

const commandItems = [
  "Instant Recall Card",
  "Daily Review Queue",
  "Card Library",
  "Must Not Miss",
  "Analytics",
  "Card Editor",
  "Import from Text",
  "Concept Map",
  "NBME Challenge",
  "Keyboard Shortcuts",
];

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const commandRef = useRef<HTMLInputElement>(null);

  const filteredCommandItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commandItems.slice(0, 5);
    }

    return commandItems.filter((item) => item.toLowerCase().includes(normalizedQuery));
  }, [query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        commandRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="spark-app min-h-screen text-foreground dark">
      <div
        className={cn(
          "grid min-h-screen grid-cols-1 transition-[grid-template-columns] duration-200 ease-standard lg:grid-cols-[17rem_minmax(0,1fr)]",
          sidebarCollapsed && "lg:grid-cols-[5rem_minmax(0,1fr)]",
        )}
      >
        <Sidebar
          activeNav={activeNav}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((current) => !current)}
          onNavigate={setActiveNav}
        />
        <div className="flex min-w-0 flex-col">
          <TopCommandBar
            query={query}
            commandRef={commandRef}
            commandItems={filteredCommandItems}
            onQueryChange={setQuery}
          />
          <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 lg:px-5">
            <div className="mx-auto flex w-full max-w-[103rem] flex-col gap-3">
              <MobileNavigation activeNav={activeNav} onNavigate={setActiveNav} />
              <InstantRecallEngine />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  activeNav,
  collapsed,
  onCollapse,
  onNavigate,
}: {
  activeNav: string;
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <aside className="spark-sidebar hidden min-h-screen border-r border-white/10 lg:flex lg:flex-col">
      <div className={cn("flex h-16 items-center border-b border-white/10 px-4", collapsed ? "justify-center" : "justify-between")}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/14 text-violet-300 shadow-card">
            <ZapIcon className="size-5" aria-hidden="true" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-lg font-bold leading-6 text-white">StepSpark</div>
              <div className="truncate text-xs font-medium uppercase tracking-normal text-sky-300">USMLE Step 1</div>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={onCollapse} aria-label="Collapse sidebar">
            <MenuIcon />
          </Button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-auto p-3" aria-label="Primary navigation">
        <NavGroup label="Main" items={mainNavItems} activeNav={activeNav} collapsed={collapsed} onNavigate={onNavigate} />
        <NavGroup label="Create" items={createNavItems} activeNav={activeNav} collapsed={collapsed} onNavigate={onNavigate} />
        <NavGroup label="Tools" items={toolNavItems} activeNav={activeNav} collapsed={collapsed} onNavigate={onNavigate} />
        <ProgressWidget collapsed={collapsed} />
      </nav>

      <div className={cn("border-t border-white/10 p-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={onCollapse} aria-label="Expand sidebar">
            <MenuIcon />
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2 text-slate-400">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Shell preferences planned" disabled>
              <GaugeIcon />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Learning compass planned" disabled>
              <CompassIcon />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10 hover:text-white" onClick={onCollapse} aria-label="Collapse sidebar">
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  activeNav,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  activeNav: string;
  collapsed: boolean;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {!collapsed ? <div className="px-2 text-[0.68rem] font-semibold uppercase tracking-normal text-slate-500">{label}</div> : null}
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-current={activeNav === item.id ? "page" : undefined}
          onClick={() => onNavigate(item.id)}
          title={collapsed ? item.label : undefined}
          className={cn(
            "group flex h-9 items-center rounded-lg px-2 text-sm font-medium text-slate-300 transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25",
            collapsed ? "justify-center" : "justify-between gap-3",
            activeNav === item.id
              ? "bg-white/10 text-white shadow-sm"
              : "hover:bg-white/[0.065] hover:text-white",
          )}
        >
          <span className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </span>
          {!collapsed && item.badge ? (
            <span className="rounded-md bg-rose-500/80 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-white">
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function ProgressWidget({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="mt-auto flex justify-center">
        <div className="size-10 rounded-full border-4 border-emerald-400 border-b-amber-400 border-l-rose-400" title="Today progress 76%" />
      </div>
    );
  }

  return (
    <Card className="mt-auto border-white/10 bg-white/[0.045] text-slate-200 shadow-none">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-normal text-slate-400">Today's Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
        <div className="flex items-center gap-3">
          <div className="grid size-16 place-items-center rounded-full border-[6px] border-emerald-400 border-b-amber-400 border-l-rose-400 text-sm font-bold text-white">
            76%
          </div>
          <div className="grid flex-1 gap-1 text-xs">
            <MetricRow dot="bg-violet-400" label="Reviewed" value="18" />
            <MetricRow dot="bg-emerald-400" label="Correct" value="14" />
            <MetricRow dot="bg-amber-400" label="Avg Time" value="28s" />
          </div>
        </div>
        <div className="border-t border-white/10 pt-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">Spaced Rep Icon Key</div>
          <div className="grid gap-1.5 text-xs text-slate-300">
            <LegendRow dot="bg-rose-500" label="Red" detail="Due < 1 day" />
            <LegendRow dot="bg-amber-400" label="Yellow" detail="Due < 3 days" />
            <LegendRow dot="bg-emerald-400" label="Green" detail="Due < 7 days" />
            <LegendRow dot="bg-slate-500" label="Gray" detail="Mastered" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-slate-300">
        <span className={cn("size-2 rounded-full", dot)} />
        {label}
      </span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function LegendRow({ dot, label, detail }: { dot: string; label: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", dot)} />
        {label}
      </span>
      <span className="text-slate-500">{detail}</span>
    </div>
  );
}

function TopCommandBar({
  query,
  commandRef,
  commandItems,
  onQueryChange,
}: {
  query: string;
  commandRef: RefObject<HTMLInputElement | null>;
  commandItems: string[];
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="spark-topbar sticky top-0 z-30 border-b border-white/10">
      <div className="flex min-h-16 flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:px-5">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/14 text-violet-300">
              <ZapIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-base font-bold leading-5 text-white">StepSpark</div>
              <div className="text-xs font-medium uppercase text-sky-300">USMLE Step 1</div>
            </div>
          </div>
          <Badge className="border-violet-400/25 bg-violet-500/15 text-violet-100" variant="outline">Preview</Badge>
        </div>

        <div className="relative w-full max-w-[28rem] lg:ms-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            ref={commandRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-10 border-white/10 bg-black/30 ps-9 pe-16 text-slate-100 shadow-inner placeholder:text-slate-500"
            placeholder="Search cards, concepts, tags..."
            aria-label="Search cards, concepts, tags"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-slate-400 sm:flex">
            <CommandIcon className="size-3" aria-hidden="true" />
            K
          </div>
          {query ? <CommandResults items={commandItems} query={query} /> : null}
        </div>

        <div className="ms-auto flex items-center gap-2 text-sm">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200 sm:flex">
            <FlameIcon className="size-4 text-orange-400" aria-hidden="true" />
            <span className="font-semibold">Streak 12</span>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Notifications planned" disabled>
            <BellIcon />
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1 pe-2 ps-1">
            <div className="grid size-8 place-items-center rounded-full bg-slate-700 text-xs font-bold text-white">ZS</div>
            <ChevronRightIcon className="size-3 text-slate-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
}

function CommandResults({ items, query }: { items: string[]; query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="spark-panel absolute left-0 right-0 top-12 z-40 rounded-xl p-2 shadow-popover"
      role="listbox"
      aria-label="Command search results"
    >
      <div className="px-2 pb-1 text-xs text-slate-500">Results for "{query}"</div>
      {items.length ? (
        items.map((item) => (
          <button
            key={item}
            type="button"
            disabled
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 opacity-80"
          >
            <span>{item}</span>
            <ChevronRightIcon className="size-4 text-slate-600" aria-hidden="true" />
          </button>
        ))
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-500">No command surface found.</div>
      )}
    </motion.div>
  );
}

function MobileNavigation({ activeNav, onNavigate }: { activeNav: string; onNavigate: (id: string) => void }) {
  const mobileItems = [...mainNavItems.slice(0, 3), createNavItems[0]].filter((item): item is NavItem => Boolean(item));

  return (
    <nav className="grid grid-cols-4 gap-2 lg:hidden" aria-label="Mobile navigation">
      {mobileItems.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-current={activeNav === item.id ? "page" : undefined}
          onClick={() => onNavigate(item.id)}
          className={cn(
            "spark-panel flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-400/25",
            activeNav === item.id ? "text-white" : "text-slate-400",
          )}
        >
          <item.icon className="size-4" aria-hidden="true" />
          <span className="max-w-full truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export { App };
