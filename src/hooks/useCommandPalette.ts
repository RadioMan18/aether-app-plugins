import { useEffect, useMemo, useRef, useState } from "react";
import { useCommands } from "@/hooks/useCommands";
import type { Command } from "@/lib/commands/registry";

export interface UseCommandPaletteOptions {
  activePluginId: string | null;
  sidebarOpen: boolean;
  setActivePluginId: (pluginId: string | null) => void;
  toggleSidebar: () => void;
}

export interface UseCommandPaletteResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: Command[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  executeSelected: () => void;
  executeByIndex: (index: number) => void;
}

export function useCommandPalette({
  activePluginId,
  sidebarOpen,
  setActivePluginId,
  toggleSidebar,
}: UseCommandPaletteOptions): UseCommandPaletteResult {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useCommands({ activePluginId, sidebarOpen, setActivePluginId, toggleSidebar });

  const results = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) {
      return commands;
    }
    return commands.filter(
      (command) =>
        command.title.toLowerCase().includes(lowerQuery) ||
        command.subtitle?.toLowerCase().includes(lowerQuery) ||
        command.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      }
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const executeSelected = () => {
    if (results[selectedIndex]) {
      results[selectedIndex].action();
      setIsOpen(false);
      setQuery("");
    }
  };

  const executeByIndex = (index: number) => {
    if (results[index]) {
      results[index].action();
      setIsOpen(false);
      setQuery("");
    }
  };

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => {
      setIsOpen(false);
      setQuery("");
    },
    toggle: () => setIsOpen((prev) => !prev),
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    executeSelected,
    executeByIndex,
  };
}
