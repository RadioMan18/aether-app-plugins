import type { JournalEntry } from "../App";

interface EntryListProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EntryList({ entries, activeEntryId, onSelect, onDelete }: EntryListProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {entries.length === 0 ? (
        <div
          style={{
            padding: 24,
            color: "#6b6b6b",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          No entries yet. Create your first journal entry.
        </div>
      ) : (
        entries.map((entry) => {
          const isActive = entry.id === activeEntryId;
          const preview = entry.content.slice(0, 80) || "Empty entry";
          const date = new Date(entry.updated_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #2e2f32",
                cursor: "pointer",
                background: isActive ? "#1b1c1e" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? "#f0f0f0" : "#a0a0a0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {entry.title || "Untitled Entry"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6b6b6b",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    padding: "2px 4px",
                  }}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b6b6b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 2,
                }}
              >
                {preview}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b6b6b",
                }}
              >
                {date}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
