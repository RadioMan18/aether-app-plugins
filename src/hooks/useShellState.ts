import { useEffect, useMemo, useState } from "react";

const COMPACT_BREAKPOINT = 800;

export interface ShellState {
  activePluginId: string | null;
  sidebarOpen: boolean;
  isCompact: boolean;
  installedPluginCount: number;
}

export interface UseShellStateResult extends ShellState {
  setActivePluginId: (pluginId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export function useShellState(plugins: { id: string }[]): UseShellStateResult {
  const [activePluginId, setActivePluginId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < COMPACT_BREAKPOINT);
      if (window.innerWidth < COMPACT_BREAKPOINT) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useMemo(() => {
    const cached: { current: boolean } = { current: sidebarOpen };
    return () => {
      cached.current = !cached.current;
      setSidebarOpen(cached.current);
    };
  }, [sidebarOpen]);

  return {
    activePluginId,
    sidebarOpen,
    isCompact,
    installedPluginCount: plugins.length,
    setActivePluginId,
    toggleSidebar,
    setSidebarOpen,
  };
}
