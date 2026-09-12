export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  keybinding?: string;
  category: "navigation" | "action" | "plugin" | "settings";
  action: () => void;
}

export const CORE_COMMANDS: Command[] = [
  {
    id: "toggle-sidebar",
    title: "Toggle Sidebar",
    subtitle: "Show or hide the sidebar",
    icon: "◀",
    keybinding: "Cmd/Ctrl+B",
    category: "navigation",
    action: () => {
      console.log("toggle-sidebar");
    },
  },
  {
    id: "switch-journal",
    title: "Go to Journal",
    subtitle: "Switch to Journal plugin",
    icon: "📓",
    keybinding: "Cmd/Ctrl+1",
    category: "navigation",
    action: () => {
      console.log("switch-journal");
    },
  },
  {
    id: "switch-todo",
    title: "Go to Todo List",
    subtitle: "Switch to Todo List plugin",
    icon: "✅",
    keybinding: "Cmd/Ctrl+2",
    category: "navigation",
    action: () => {
      console.log("switch-todo");
    },
  },
  {
    id: "switch-goals",
    title: "Go to Goals",
    subtitle: "Switch to Goals plugin",
    icon: "🎯",
    keybinding: "Cmd/Ctrl+3",
    category: "navigation",
    action: () => {
      console.log("switch-goals");
    },
  },
  {
    id: "new-journal-entry",
    title: "New Journal Entry",
    subtitle: "Create a new journal entry",
    icon: "📝",
    keybinding: "Cmd/Ctrl+Shift+N",
    category: "action",
    action: () => {
      console.log("new-journal-entry");
    },
  },
  {
    id: "add-todo",
    title: "Add Todo",
    subtitle: "Create a new todo item",
    icon: "➕",
    keybinding: "Cmd/Ctrl+N",
    category: "action",
    action: () => {
      console.log("add-todo");
    },
  },
  {
    id: "open-settings",
    title: "Open Settings",
    subtitle: "Open application settings",
    icon: "⚙️",
    keybinding: "Cmd/Ctrl+,",
    category: "settings",
    action: () => {
      console.log("open-settings");
    },
  },
  {
    id: "open-plugin-store",
    title: "Open Plugin Store",
    subtitle: "Browse and install plugins",
    icon: "🧩",
    category: "navigation",
    action: () => {
      console.log("open-plugin-store");
    },
  },
];

export function searchCommands(query: string): Command[] {
  if (!query.trim()) {
    return CORE_COMMANDS;
  }

  const lowerQuery = query.toLowerCase();
  return CORE_COMMANDS.filter(
    (command) =>
      command.title.toLowerCase().includes(lowerQuery) ||
      command.subtitle?.toLowerCase().includes(lowerQuery) ||
      command.category.toLowerCase().includes(lowerQuery)
  );
}
