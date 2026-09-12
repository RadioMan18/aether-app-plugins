import { useState } from "react";
import { ActivityBar } from "@/components/Shell/ActivityBar";
import { Sidebar } from "@/components/Shell/Sidebar";
import { MainContent } from "@/components/Shell/MainContent";
import { StatusBar } from "@/components/Shell/StatusBar";
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
  const [activePluginId, setActivePluginId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-text-primary">
      <ActivityBar
        plugins={MOCK_PLUGINS}
        activePluginId={activePluginId}
        onPluginSelect={setActivePluginId}
      />
      <Sidebar />
      <MainContent />
      <StatusBar />
    </div>
  );
}

export default App;
