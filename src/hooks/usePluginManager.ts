import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { StoreCategory } from "@/types/plugin-store";

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  permissions: string[];
  installed_at: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  category: StoreCategory;
  rating: number;
  downloads: number;
  author: string;
  permissions: string[];
  installed: boolean;
  updateAvailable: boolean;
  downloadUrl: string;
  checksum: string;
  changelog?: string;
}

const CATALOG_URL = "https://raw.githubusercontent.com/RadioMan18/aether-app-plugins/main/catalog.json";
const CACHE_KEY = "aether-plugin-cache";
const CACHE_TTL_MS = 5 * 60 * 1000;

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(hash);
  return "sha256:" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface CachedCatalog {
  items: StoreItem[];
  fetchedAt: number;
}

export interface UsePluginManagerResult {
  catalogItems: StoreItem[];
  installedPlugins: PluginInfo[];
  installPlugin: (item: StoreItem) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
  refreshPlugins: () => Promise<void>;
  refreshCatalog: () => Promise<StoreItem[]>;
  isLoading: boolean;
  error: string | null;
}

export function usePluginManager(): UsePluginManagerResult {
  const [catalogItems, setCatalogItems] = useState<StoreItem[]>([]);
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

  const fetchCatalog = useCallback(async (): Promise<StoreItem[]> => {
    setError(null);
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CachedCatalog = JSON.parse(cached);
          if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
            return parsed.items;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      const response = await fetch(CATALOG_URL);
      if (!response.ok) {
        throw new Error(`Catalog fetch failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const items: StoreItem[] = data.plugins ?? [];
      localStorage.setItem(CACHE_KEY, JSON.stringify({ items, fetchedAt: Date.now() }));
      return items;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CachedCatalog = JSON.parse(cached);
          return parsed.items;
        } catch {
          return [];
        }
      }
      return [];
    }
  }, []);

  const refreshCatalog = useCallback(async (): Promise<StoreItem[]> => {
    setIsLoading(true);
    try {
      const items = await fetchCatalog();
      const installedMap = new Map(installedPlugins.map((p) => [p.id, p]));
      const merged = items.map((item) => {
        const installed = installedMap.get(item.id);
        let updateAvailable = false;
        if (installed) {
          updateAvailable = semverCompare(item.version, installed.version) > 0;
        }
        return { ...item, installed: !!installed, updateAvailable };
      });
      setCatalogItems(merged);
      return merged;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCatalog, installedPlugins]);

  const installPlugin = async (item: StoreItem) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(item.downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();

      if (item.checksum) {
        const actual = await sha256(buffer);
        if (actual !== item.checksum) {
          throw new Error(`Checksum mismatch: expected ${item.checksum}, got ${actual}`);
        }
      }

      const uint8Array = new Uint8Array(buffer);
      await invoke("install_plugin", {
        id: item.id,
        name: item.name,
        version: item.version,
        permissions: item.permissions,
        zipData: Array.from(uint8Array),
        checksum: item.checksum || null,
      });
      await refreshPlugins();
      await refreshCatalog();
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
      await refreshCatalog();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPlugins();
  }, [refreshPlugins]);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  return {
    catalogItems,
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    refreshPlugins,
    refreshCatalog,
    isLoading,
    error,
  };
}
