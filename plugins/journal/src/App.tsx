import { useEffect, useState, useRef } from "react";
import { EntryList } from "./components/EntryList";
import { Editor } from "./Editor";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const activeEntry = entries.find((e) => e.id === activeEntryId) ?? null;

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setError(null);
        const { db } = await import("../sdk/src/index.ts");
        const rows = await db.query<JournalEntry>(
          "SELECT id, title, content, created_at, updated_at FROM journal_entries ORDER BY updated_at DESC"
        );
        setEntries(rows);
        if (rows.length > 0 && !loadedRef.current) {
          loadedRef.current = true;
          setActiveEntryId(rows[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  const handleCreateEntry = async () => {
    try {
      setError(null);
      const { db } = await import("../sdk/src/index.ts");
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO journal_entries (title, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        ["Untitled Entry", "", now, now]
      );

      const rows = await db.query<JournalEntry>(
        "SELECT id, title, content, created_at, updated_at FROM journal_entries ORDER BY updated_at DESC LIMIT 1"
      );
      if (rows.length > 0) {
        setEntries((prev) => [rows[0], ...prev]);
        setActiveEntryId(rows[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleUpdateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    try {
      setError(null);
      const { db } = await import("../sdk/src/index.ts");
      const now = new Date().toISOString();
      
      if (updates.title !== undefined || updates.content !== undefined) {
        const entry = entries.find((e) => e.id === id);
        const title = updates.title ?? entry?.title ?? "Untitled Entry";
        const content = updates.content ?? entry?.content ?? "";
        
        await db.execute(
          "UPDATE journal_entries SET title = ?1, content = ?2, updated_at = ?3 WHERE id = ?4",
          [title, content, now, id]
        );

        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, ...updates, updated_at: now } : e
          )
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setError(null);
      const { db } = await import("../sdk/src/index.ts");
      await db.execute("DELETE FROM journal_entries WHERE id = ?1", [id]);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (activeEntryId === id) {
        setActiveEntryId(entries.find((e) => e.id !== id)?.id ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#040506" }}>
      {error && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            background: "#2a1515",
            border: "1px solid #5f2a2a",
            borderRadius: 8,
            color: "#ff5f5f",
            fontSize: 13,
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          width: 280,
          borderRight: "1px solid #2e2f32",
          background: "#111214",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #2e2f32",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#f0f0f0",
            }}
          >
            Journal
          </h1>
          <button
            onClick={handleCreateEntry}
            style={{
              background: "#55b3ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            New Entry
          </button>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: 24,
              color: "#6b6b6b",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Loading entries...
          </div>
        ) : (
          <EntryList
            entries={entries}
            activeEntryId={activeEntryId}
            onSelect={setActiveEntryId}
            onDelete={handleDeleteEntry}
          />
        )}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeEntry ? (
          <Editor
            key={activeEntry.id}
            entry={activeEntry}
            onSave={(updates) => handleUpdateEntry(activeEntry.id, updates)}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b6b6b",
              fontSize: 14,
            }}
          >
            Select an entry or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
