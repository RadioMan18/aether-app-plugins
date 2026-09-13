import { useEffect, useState, useRef } from "react";
import { GoalList } from "./GoalList";
import { GoalEditor } from "./GoalEditor";

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  due_date: string | null;
  updated_at: string;
}

export function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [relatedTodos, setRelatedTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const activeGoal = goals.find((g) => g.id === activeGoalId) ?? null;

  const loadGoals = async () => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      const rows = await db.query<Goal>(
        "SELECT id, title, description, status, target_date, created_at, updated_at FROM goals ORDER BY updated_at DESC"
      );
      setGoals(rows);
      if (rows.length > 0 && !loadedRef.current) {
        loadedRef.current = true;
        setActiveGoalId(rows[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedTodos = async (goalTitle: string) => {
    try {
      const { db } = await import("../../sdk/src/index.ts");
      const rows = await db.query<Todo>(
        "SELECT id, title, completed, priority, due_date, updated_at FROM todos WHERE title LIKE ?1 ORDER BY updated_at DESC LIMIT 5",
        [`%${goalTitle}%`]
      );
      setRelatedTodos(rows);
    } catch {
      setRelatedTodos([]);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (activeGoal?.title) {
      loadRelatedTodos(activeGoal.title);
    }
  }, [activeGoal?.id, activeGoal?.title]);

  const handleCreateGoal = async () => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO goals (id, title, description, status, target_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [id, "New Goal", "", "active", null, now, now]
      );

      const rows = await db.query<Goal>(
        "SELECT id, title, description, status, target_date, created_at, updated_at FROM goals ORDER BY updated_at DESC LIMIT 1"
      );
      if (rows.length > 0) {
        setGoals((prev) => [rows[0], ...prev]);
        setActiveGoalId(rows[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      const now = new Date().toISOString();
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      const title = updates.title ?? goal.title;
      const description = updates.description ?? goal.description;
      const status = updates.status ?? goal.status;
      const target_date = updates.target_date ?? goal.target_date;

      await db.execute(
        "UPDATE goals SET title = ?1, description = ?2, status = ?3, target_date = ?4, updated_at = ?5 WHERE id = ?6",
        [title, description, status, target_date, now, id]
      );

      setGoals((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, ...updates, updated_at: now } : g
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      setError(null);
      const { db } = await import("../../sdk/src/index.ts");
      await db.execute("DELETE FROM goals WHERE id = ?1", [id]);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (activeGoalId === id) {
        setActiveGoalId(goals.find((g) => g.id !== id)?.id ?? null);
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
            Goals
          </h1>
          <button
            onClick={handleCreateGoal}
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
            New Goal
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
            Loading goals...
          </div>
        ) : (
          <GoalList
            goals={goals}
            activeGoalId={activeGoalId}
            onSelect={setActiveGoalId}
            onDelete={handleDeleteGoal}
          />
        )}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeGoal ? (
          <GoalEditor
            key={activeGoal.id}
            goal={activeGoal}
            onSave={(updates) => handleUpdateGoal(activeGoal.id, updates)}
            relatedTodos={relatedTodos}
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
            Select a goal or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
