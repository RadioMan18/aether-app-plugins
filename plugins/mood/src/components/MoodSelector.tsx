import { useState } from "react";

const MOODS = [
  { value: 1, label: "😞", text: "Very Low" },
  { value: 2, label: "😕", text: "Low" },
  { value: 3, label: "😐", text: "Neutral" },
  { value: 4, label: "🙂", text: "Good" },
  { value: 5, label: "😄", text: "Great" },
];

export default function MoodSelector({ onSave }: { onSave: (entry: { mood: number; sleep_hours: number; energy_level: number }) => void }) {
  const [mood, setMood] = useState<number>(3);
  const [sleep, setSleep] = useState<string>("7");
  const [energy, setEnergy] = useState<number>(3);

  return (
    <div
      style={{
        background: "#111214",
        border: "1px solid #2e2f32",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          fontWeight: 600,
          color: "#f0f0f0",
        }}
      >
        Mood & Energy
      </h2>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
          Mood
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              style={{
                background: mood === m.value ? "#55b3ff" : "#1a1b1e",
                border: "1px solid #2e2f32",
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
              title={m.text}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
          Sleep Hours
        </label>
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          style={{
            width: "100%",
            background: "#1a1b1e",
            border: "1px solid #2e2f32",
            borderRadius: 6,
            padding: "8px 12px",
            color: "#f0f0f0",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
          Energy Level
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setEnergy(level)}
              style={{
                background: energy === level ? "#55b3ff" : "#1a1b1e",
                border: "1px solid #2e2f32",
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 14,
                color: "#f0f0f0",
                minWidth: 40,
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave({ mood, sleep_hours: parseFloat(sleep) || 0, energy_level: energy })}
        style={{
          background: "#55b3ff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Save Mood Entry
      </button>
    </div>
  );
}
