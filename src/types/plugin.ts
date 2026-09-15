export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  icon: string;
  ui?: {
    activityBar?: boolean;
    sidebarSection?: string;
    commands?: Array<{
      id: string;
      title: string;
      keybinding?: string;
    }>;
  };
  permissions?: string[];
  sandboxed?: boolean;
  builtin?: boolean;
}
