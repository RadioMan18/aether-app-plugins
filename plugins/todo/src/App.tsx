import { useEffect, useState, useRef } from "react";
import { TodoList } from "./TodoList";
import { TodoEditor } from "./TodoEditor";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const activeTodo = todos.find((t) => t.id === activeTodoId) ?? null;

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setError(null);
        const { db } = await import("../../sdk/src/index.ts");
        const rows = await db.query<Todo>(
          "SELECT id, title, completed, priority, due_date, created_at, updated_at FROM todos ORDER BY updated_at DESC"
        );
        setTodos(rows);
        if (rows.length > 0 && !loadedRef.current) {
          loadedRef.current = true;
          setActiveTodoId(rows[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  const handleCreateTodo = async () => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO todos (id, title, completed, priority, due_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [id, "New Task", false, 0, null, now, now]
      );

      const rows = await db.query<Todo>(
        "SELECT id, title, completed, priority, due_date, created_at, updated_at FROM todos ORDER BY updated_at DESC LIMIT 1"
      );
      if (rows.length > 0) {
        setTodos((prev) => [rows[0], ...prev]);
        setActiveTodoId(rows[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      const now = new Date().toISOString();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const title = updates.title ?? todo.title;
      const completed = updates.completed ?? todo.completed;
      const priority = updates.priority ?? todo.priority;
      const due_date = updates.due_date ?? todo.due_date;

      await db.execute(
        "UPDATE todos SET title = ?1, completed = ?2, priority = ?3, due_date = ?4, updated_at = ?5 WHERE id = ?6",
        [title, completed ? 1 : 0, priority, due_date, now, id]
      );

      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updates, updated_at: now } : t
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      await db.execute("DELETE FROM todos WHERE id = ?1", [id]);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      if (activeTodoId === id) {
        setActiveTodoId(todos.find((t) => t.id !== id)?.id ?? null);
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
            Todo List
          </h1>
          <button
            onClick={handleCreateTodo}
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
            New Task
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
            Loading tasks...
          </div>
        ) : (
          <TodoList
            todos={todos}
            activeTodoId={activeTodoId}
            onSelect={setActiveTodoId}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleUpdateTodo}
          />
        )}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTodo ? (
          <TodoEditor
            key={activeTodo.id}
            todo={activeTodo}
            onSave={(updates) => handleUpdateTodo(activeTodo.id, updates)}
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
            Select a task or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
