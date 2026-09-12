import { useMemo } from "react";
import { ActivityBar } from "@/components/Shell/ActivityBar";
import { Sidebar } from "@/components/Shell/Sidebar";
import { MainContent } from "@/components/Shell/MainContent";
import { StatusBar } from "@/components/Shell/StatusBar";
import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { useShellState } from "@/hooks/useShellState";
import type { PluginManifest } from "@/types/plugin";

const MOCK_PLUGINS: PluginManifest[] = [
  {
    id: "journal",
    name: "Journal",
    version: "1.0.0",
    icon: "📓",
    ui: { activityBar: true, sidebarSection: "Journal" },
    permissions: ["db:read", "db:write"],
  },
  {
    id: "todo",
    name: "Todo List",
    version: "1.0.0",
    icon: "✅",
    ui: { activityBar: true, sidebarSection: "Todo" },
    permissions: ["db:read", "db:write"],
  },
  {
    id: "goals",
    name: "Goals",
    version: "1.0.0",
    icon: "🎯",
    ui: { activityBar: true, sidebarSection: "Goals" },
    permissions: ["db:read"],
  },
];

function App() {
  const shell = useShellState(MOCK_PLUGINS);

  const activePlugin = useMemo(
    () => MOCK_PLUGINS.find((plugin) => plugin.id === shell.activePluginId) ?? null,
    [shell.activePluginId]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-text-primary">
      <ActivityBar
        plugins={MOCK_PLUGINS}
        activePluginId={shell.activePluginId}
        onPluginSelect={shell.setActivePluginId}
      />
      <Sidebar
        isOpen={shell.sidebarOpen}
        isCompact={shell.isCompact}
        onToggle={shell.toggleSidebar}
        activePluginId={shell.activePluginId}
        plugins={MOCK_PLUGINS}
      />
      <MainContent activePlugin={activePlugin} />
      <StatusBar shell={shell} />
      <CommandPalette
        activePluginId={shell.activePluginId}
        sidebarOpen={shell.sidebarOpen}
        setActivePluginId={shell.setActivePluginId}
        toggleSidebar={shell.toggleSidebar}
      />
    </div>
  );
}

export default App;
