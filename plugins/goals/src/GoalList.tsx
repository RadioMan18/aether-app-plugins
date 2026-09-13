import type { Goal } from "./App";

interface GoalListProps {
  goals: Goal[];
  activeGoalId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GoalList({ goals, activeGoalId, onSelect, onDelete }: GoalListProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {goals.length === 0 ? (
        <div
          style={{
            padding: 24,
            color: "#6b6b6b",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          No goals yet. Create your first goal.
        </div>
      ) : (
        goals.map((goal) => {
          const isActive = goal.id === activeGoalId;
          const preview = goal.title || "Untitled Goal";
          const date = new Date(goal.updated_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={goal.id}
              onClick={() => onSelect(goal.id)}
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? "#f0f0f0" : "#a0a0a0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: goal.status === "completed" ? "line-through" : "none",
                    opacity: goal.status === "completed" ? 0.6 : 1,
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
                  <span style={{ marginLeft: 8, color: goal.status === "active" ? "#55b3ff" : "#4ade80" }}>
                    {goal.status === "active" ? "Active" : "Completed"}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(goal.id);
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
                aria-label="Delete goal"
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
