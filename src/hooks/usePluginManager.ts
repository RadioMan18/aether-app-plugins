import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  permissions: string[];
  installed_at: string;
}

export interface UsePluginManagerResult {
  installedPlugins: PluginInfo[];
  installPlugin: (id: string, name: string, version: string, permissions: string[], zipData: ArrayBuffer) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
  refreshPlugins: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function usePluginManager(): UsePluginManagerResult {
  const [installedPlugins, setInstalledPlugins] = useState<PluginInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlugins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plugins = await invoke<PluginInfo[]>("list_plugins");
      setInstalledPlugins(plugins);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPlugins();
  }, [refreshPlugins]);

  const installPlugin = async (
    id: string,
    name: string,
    version: string,
    permissions: string[],
    zipData: ArrayBuffer
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const uint8Array = new Uint8Array(zipData);
      await invoke("install_plugin", {
        id,
        name,
        version,
        permissions,
        zipData: Array.from(uint8Array),
      });
      await refreshPlugins();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallPlugin = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await invoke("uninstall_plugin", { id });
      await refreshPlugins();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    refreshPlugins,
    isLoading,
    error,
  };
}
