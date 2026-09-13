import { useEffect, useState } from "react";
import type { Goal, Todo } from "./App";

interface GoalEditorProps {
  goal: Goal;
  onSave: (updates: Partial<Goal>) => Promise<void>;
  relatedTodos: Todo[];
}

export function GoalEditor({ goal, onSave, relatedTodos }: GoalEditorProps) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [status, setStatus] = useState(goal.status);
  const [targetDate, setTargetDate] = useState(goal.target_date ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description);
    setStatus(goal.status);
    setTargetDate(goal.target_date ?? "");
  }, [goal.id, goal.title, goal.description, goal.status, goal.target_date]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ title, description, status, target_date: targetDate || null });
    setIsSaving(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      await handleSave();
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = status === "active" ? "completed" : "active";
    setStatus(newStatus);
    await onSave({ title, description, status: newStatus, target_date: targetDate || null });
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
            checked={status === "completed"}
            onChange={handleStatusToggle}
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
            placeholder="Goal title..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f0f0f0",
              fontSize: 22,
              fontWeight: 600,
              outline: "none",
              padding: 0,
              textDecoration: status === "completed" ? "line-through" : "none",
              opacity: status === "completed" ? 0.6 : 1,
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
            <label style={{ fontSize: 12, color: "#6b6b6b" }}>Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                onSave({ title, description, status, target_date: e.target.value || null });
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
            Last updated: {new Date(goal.updated_at).toLocaleString()}
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
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          placeholder="Goal description..."
          style={{
            width: "100%",
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#f0f0f0",
            fontSize: 15,
            lineHeight: 1.7,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            textDecoration: status === "completed" ? "line-through" : "none",
            opacity: status === "completed" ? 0.6 : 1,
          }}
        />

        <div
          style={{
            borderTop: "1px solid #2e2f32",
            paddingTop: 16,
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 600,
              color: "#6b6b6b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Related Todos (Cross-Plugin)
          </h3>
          {relatedTodos.length === 0 ? (
            <div style={{ color: "#6b6b6b", fontSize: 13 }}>
              No related todos found. Todos with matching titles will appear here.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {relatedTodos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    padding: "10px 14px",
                    background: "#111214",
                    border: "1px solid #2e2f32",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                    style={{
                      cursor: "default",
                      accentColor: "#55b3ff",
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: todo.completed ? "#6b6b6b" : "#f0f0f0",
                      textDecoration: todo.completed ? "line-through" : "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {todo.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#6b6b6b",
                      flexShrink: 0,
                    }}
                  >
                    P{todo.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
