import { useMemo, useEffect, useState } from "react";
import { ActivityBar } from "@/components/Shell/ActivityBar";
import { Sidebar } from "@/components/Shell/Sidebar";
import { MainContent } from "@/components/Shell/MainContent";
import { StatusBar } from "@/components/Shell/StatusBar";
import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { CustomTitleBar } from "@/components/Shell/CustomTitleBar";
import { PluginStore } from "@/components/PluginStore/PluginStore";
import { useShellState } from "@/hooks/useShellState";
import type { PluginManifest } from "@/types/plugin";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { usePluginManager } from "@/hooks/usePluginManager";

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
    permissions: ["db:read", "db:write"],
    sandboxed: true,
  },
  {
    id: "rss",
    name: "RSS Reader",
    version: "0.1.0",
    icon: "📰",
    ui: { activityBar: true, sidebarSection: "RSS" },
    permissions: ["db:read", "db:write", "network:outbound"],
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
  const { catalogItems } = usePluginManager();
  const [clipboardStreaming, setClipboardStreaming] = useState(false);

  useEffect(() => {
    const seed = async () => {
      try {
        await invoke("ensure_database");
        await invoke("seed_builtin_plugins");
        await invoke("start_clipboard_streaming");

        const unlisten = await listen("clipboard:changed", () => {
          setClipboardStreaming(true);
        });

        return unlisten;
      } catch {
        return undefined;
      }
    };

    const unlistenPromise = seed();

    return () => {
      unlistenPromise.then((unlisten) => {
        if (unlisten) unlisten();
      });
    };
  }, []);

  useEffect(() => {
    const plugin = MOCK_PLUGINS.find((plugin) => plugin.id === shell.activePluginId);
    const hasPermission = plugin?.permissions?.includes("clipboard:subscribe") ?? false;
    invoke("set_active_clipboard_plugin", {
      pluginId: hasPermission ? shell.activePluginId : null,
    }).catch(() => {
      // ignore clipboard backend errors
    });
  }, [shell.activePluginId]);

  const activePlugin = useMemo(
    () => MOCK_PLUGINS.find((plugin) => plugin.id === shell.activePluginId) ?? null,
    [shell.activePluginId]
  );

  const storeItems = catalogItems.length > 0 ? catalogItems : [];

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
          onPluginSelect={shell.setActivePluginId}
          activePluginId={shell.activePluginId}
          plugins={MOCK_PLUGINS}
        />
        {activePlugin?.id === "plugin-store" ? (
          <PluginStore items={storeItems} />
        ) : (
          <MainContent activePlugin={activePlugin} />
        )}
      </div>
      <StatusBar shell={shell} clipboardStreaming={clipboardStreaming} />
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
