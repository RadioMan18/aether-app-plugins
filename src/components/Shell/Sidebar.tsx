import { Input } from "@/lib/design-system/components";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[var(--sidebar-width)] flex-col border-r border-border bg-surface-1 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <Search className="h-4 w-4 shrink-0 text-text-muted" />
        <Input
          type="search"
          placeholder="Search..."
          className="h-8 border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        <div className="mb-4">
          <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Favorites
          </h3>
          <nav className="space-y-0.5">
            <SidebarItem label="Journal" icon="📓" />
            <SidebarItem label="Todo List" icon="✅" />
            <SidebarItem label="Goals" icon="🎯" />
          </nav>
        </div>

        <div className="mb-4">
          <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recent
          </h3>
          <nav className="space-y-0.5">
            <SidebarItem label="Morning Reflection" icon="📝" />
            <SidebarItem label="Q4 Planning" icon="📋" />
          </nav>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary">
      <span className="text-base">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
