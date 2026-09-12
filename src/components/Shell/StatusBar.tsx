import { Lock, Cloud, Puzzle, Info } from "lucide-react";

export function StatusBar() {
  return (
    <footer className="flex h-[var(--status-bar-height)] w-full items-center justify-between border-t border-border bg-surface-1 px-4 text-xs text-text-muted">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-success" />
          Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5 text-text-muted" />
          Synced
        </span>
        <span className="flex items-center gap-1.5">
          <Puzzle className="h-3.5 w-3.5" />
          3 plugins
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          v1.0.0
        </span>
      </div>
    </footer>
  );
}
