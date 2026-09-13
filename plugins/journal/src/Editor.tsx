import { useEffect, useState } from "react";
import type { JournalEntry } from "../App";

interface EditorProps {
  entry: JournalEntry;
  onSave: (updates: Partial<JournalEntry>) => void;
}

export function Editor({ entry, onSave }: EditorProps) {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(entry.title);
    setContent(entry.content);
  }, [entry.id, entry.title, entry.content]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ title, content });
    setIsSaving(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      await handleSave();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#040506",
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          padding: "20px 32px 0",
          borderBottom: "1px solid #2e2f32",
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Entry title..."
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#f0f0f0",
            fontSize: 22,
            fontWeight: 600,
            outline: "none",
            padding: 0,
          }}
        />
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#6b6b6b",
          }}
        >
          Last updated: {new Date(entry.updated_at).toLocaleString()}
          {isSaving && <span style={{ marginLeft: 12, color: "#55b3ff" }}>Saving...</span>}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "20px 32px" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          placeholder="Start writing..."
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            color: "#f0f0f0",
            fontSize: 15,
            lineHeight: 1.7,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}
