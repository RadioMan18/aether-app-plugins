import { useMemo } from "react";
import { searchCommands as baseSearchCommands, type Command } from "@/lib/commands/registry";

export interface UseCommandsOptions {
  activePluginId?: string | null;
  sidebarOpen?: boolean;
  setActivePluginId: (pluginId: string | null) => void;
  toggleSidebar: () => void;
}

export function useCommands({
  setActivePluginId,
  toggleSidebar,
}: UseCommandsOptions): Command[] {
  return useMemo(() => {
    const commands = baseSearchCommands("");
    return commands.map((command) => {
      if (command.id === "toggle-sidebar") {
        return {
          ...command,
          action: () => toggleSidebar(),
        };
      }
      if (command.id === "switch-journal") {
        return {
          ...command,
          action: () => setActivePluginId("journal"),
        };
      }
      if (command.id === "switch-todo") {
        return {
          ...command,
          action: () => setActivePluginId("todo"),
        };
      }
      if (command.id === "switch-goals") {
        return {
          ...command,
          action: () => setActivePluginId("goals"),
        };
      }
      if (command.id === "open-plugin-store") {
        return {
          ...command,
          action: () => setActivePluginId("plugin-store"),
        };
      }
      return command;
    });
  }, [setActivePluginId, toggleSidebar]);
}
