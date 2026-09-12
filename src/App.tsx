import { useMemo } from "react";
import { ActivityBar } from "@/components/Shell/ActivityBar";
import { Sidebar } from "@/components/Shell/Sidebar";
import { MainContent } from "@/components/Shell/MainContent";
import { StatusBar } from "@/components/Shell/StatusBar";
import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { CustomTitleBar } from "@/components/Shell/CustomTitleBar";
import { PluginStore } from "@/components/PluginStore/PluginStore";
import { useShellState } from "@/hooks/useShellState";
import { STORE_ITEMS } from "@/lib/plugin-store/mock-data";
import type { PluginManifest } from "@/types/plugin";

const MOCK_PLUGINS: PluginManifest[] = [
  {
    id: "journal",
    name: "Journal",
    version: "1.0.0",
    icon: "📓",
    ui: { activityBar: true, sidebarSection: "Journal" },
    permissions: ["db:read", "db:write"],
    sandboxed: true,
  },
  {
    id: "todo",
    name: "Todo List",
    version: "1.0.0",
    icon: "✅",
    ui: { activityBar: true, sidebarSection: "Todo" },
    permissions: ["db:read", "db:write"],
    sandboxed: true,
  },
  {
    id: "goals",
    name: "Goals",
    version: "1.0.0",
    icon: "🎯",
    ui: { activityBar: true, sidebarSection: "Goals" },
    permissions: ["db:read"],
    sandboxed: true,
  },
  {
    id: "plugin-store",
    name: "Plugin Store",
    version: "1.0.0",
    icon: "🧩",
    ui: { activityBar: true },
    permissions: [],
  },
];

function App() {
  const shell = useShellState(MOCK_PLUGINS);

  const activePlugin = useMemo(
    () => MOCK_PLUGINS.find((plugin) => plugin.id === shell.activePluginId) ?? null,
    [shell.activePluginId]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-text-primary">
      <CustomTitleBar />
      <div className="flex flex-1 overflow-hidden">
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
        {activePlugin?.id === "plugin-store" ? (
          <PluginStore items={STORE_ITEMS} />
        ) : (
          <MainContent activePlugin={activePlugin} />
        )}
        <StatusBar shell={shell} />
      </div>
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
