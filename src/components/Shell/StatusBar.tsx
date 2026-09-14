import { Lock, Cloud, Puzzle, Monitor, Clipboard } from "lucide-react";
import type { ShellState } from "@/hooks/useShellState";

interface StatusBarProps {
  shell: ShellState;
  clipboardStreaming: boolean;
}

export function StatusBar({ shell, clipboardStreaming }: StatusBarProps) {
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
          {shell.installedPluginCount} plugins
        </span>
        {clipboardStreaming && (
          <span className="flex items-center gap-1.5 text-success">
            <Clipboard className="h-3.5 w-3.5" />
            Clipboard streaming active
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {shell.isCompact && (
          <span className="flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5" />
            Compact
          </span>
        )}
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
