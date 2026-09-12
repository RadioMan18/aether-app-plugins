import { useMemo, useState } from "react";
import type { StoreItem, StoreCategory, StoreTab } from "@/types/plugin-store";

export interface UsePluginStoreResult {
  query: string;
  setQuery: (query: string) => void;
  category: StoreCategory;
  setCategory: (category: StoreCategory) => void;
  tab: StoreTab;
  setTab: (tab: StoreTab) => void;
  filteredItems: StoreItem[];
  selectedItem: StoreItem | null;
  setSelectedItem: (item: StoreItem | null) => void;
  install: (id: string) => void;
  uninstall: (id: string) => void;
  installedIds: Set<string>;
}

export function usePluginStore(items: StoreItem[]): UsePluginStoreResult {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StoreCategory>("all");
  const [tab, setTab] = useState<StoreTab>("discover");
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(
    () => new Set(items.filter((item) => item.installed).map((item) => item.id))
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (tab === "installed" && !installedIds.has(item.id)) return false;
      if (tab === "updates" && !item.updateAvailable) return false;
      if (category !== "all" && item.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, tab, category, query, installedIds]);

  const install = (id: string) => {
    setInstalledIds((prev) => new Set([...prev, id]));
  };

  const uninstall = (id: string) => {
    setInstalledIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    tab,
    setTab,
    filteredItems,
    selectedItem,
    setSelectedItem,
    install,
    uninstall,
    installedIds,
  };
}
