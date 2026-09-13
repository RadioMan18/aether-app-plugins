import type { Todo } from "./App";

interface TodoListProps {
  todos: Todo[];
  activeTodoId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, updates: Partial<Todo>) => void;
}

export function TodoList({ todos, activeTodoId, onSelect, onDelete, onToggleComplete }: TodoListProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {todos.length === 0 ? (
        <div
          style={{
            padding: 24,
            color: "#6b6b6b",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          No tasks yet. Create your first task.
        </div>
      ) : (
        todos.map((todo) => {
          const isActive = todo.id === activeTodoId;
          const preview = todo.title || "Untitled Task";
          const date = new Date(todo.updated_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={todo.id}
              onClick={() => onSelect(todo.id)}
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #2e2f32",
                cursor: "pointer",
                background: isActive ? "#1b1c1e" : "transparent",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleComplete(todo.id, { completed: e.target.checked });
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: 3,
                  cursor: "pointer",
                  accentColor: "#55b3ff",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? "#f0f0f0" : "#a0a0a0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: todo.completed ? "line-through" : "none",
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  {preview}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginTop: 2,
                  }}
                >
                  {date}
                  {todo.priority > 0 && (
                    <span style={{ marginLeft: 8, color: "#ffb84d" }}>
                      P{todo.priority}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(todo.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b6b6b",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "2px 4px",
                  flexShrink: 0,
                }}
                aria-label="Delete task"
              >
                ×
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
