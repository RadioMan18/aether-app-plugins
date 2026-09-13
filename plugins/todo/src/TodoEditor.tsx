import { useEffect, useState } from "react";
import type { Todo } from "./App";

interface TodoEditorProps {
  todo: Todo;
  onSave: (updates: Partial<Todo>) => Promise<void>;
}

export function TodoEditor({ todo, onSave }: TodoEditorProps) {
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(todo.due_date ?? "");
  const [completed, setCompleted] = useState(todo.completed);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(todo.title);
    setPriority(todo.priority);
    setDueDate(todo.due_date ?? "");
    setCompleted(todo.completed);
  }, [todo.id, todo.title, todo.priority, todo.due_date, todo.completed]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ title, priority, due_date: dueDate || null, completed });
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => {
              setCompleted(e.target.checked);
              onSave({ title, priority, due_date: dueDate || null, completed: e.target.checked });
            }}
            style={{
              width: 18,
              height: 18,
              cursor: "pointer",
              accentColor: "#55b3ff",
            }}
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Task title..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f0f0f0",
              fontSize: 22,
              fontWeight: 600,
              outline: "none",
              padding: 0,
              textDecoration: completed ? "line-through" : "none",
              opacity: completed ? 0.6 : 1,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "#6b6b6b" }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setPriority(val);
                onSave({ title, priority: val, due_date: dueDate || null, completed });
              }}
              style={{
                background: "#111214",
                border: "1px solid #2e2f32",
                color: "#f0f0f0",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 12,
                outline: "none",
              }}
            >
              <option value={0}>None</option>
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "#6b6b6b" }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                onSave({ title, priority, due_date: e.target.value || null, completed });
              }}
              style={{
                background: "#111214",
                border: "1px solid #2e2f32",
                color: "#f0f0f0",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "#6b6b6b",
            }}
          >
            Last updated: {new Date(todo.updated_at).toLocaleString()}
            {isSaving && <span style={{ marginLeft: 12, color: "#55b3ff" }}>Saving...</span>}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                marginLeft: 12,
                background: "#55b3ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: isSaving ? "default" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "20px 32px",
        }}
      >
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Task details..."
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
            textDecoration: completed ? "line-through" : "none",
            opacity: completed ? 0.6 : 1,
          }}
        />
      </div>
    </div>
  );
}
