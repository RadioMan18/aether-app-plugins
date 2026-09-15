import { useState } from "react";

const TIME_OF_DAY = [
  { value: "out_of_bed", label: "Out of Bed" },
  { value: "before_breakfast", label: "Before Breakfast" },
  { value: "after_breakfast", label: "After Breakfast" },
  { value: "before_lunch", label: "Before Lunch" },
  { value: "after_lunch", label: "After Lunch" },
  { value: "before_dinner", label: "Before Dinner" },
  { value: "after_dinner", label: "After Dinner" },
  { value: "after_snack", label: "After Snack" },
  { value: "before_bed", label: "Before Bed" },
];

export default function GlucoseEntry({ onSave }: { onSave: (entry: { value: number; measured_at: string; time_of_day: string }) => void }) {
  const [value, setValue] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [timeOfDay, setTimeOfDay] = useState<string>("before_breakfast");

  const isValid = (() => {
    const v = parseFloat(value);
    return Number.isFinite(v) && v >= 20 && v <= 600;
  })();

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
        Glucose
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
            Value (20–600 mg/dL)
          </label>
          <input
            type="number"
            min="20"
            max="600"
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              background: "#1a1b1e",
              border: "1px solid #2e2f32",
              borderRadius: 6,
              padding: "8px 12px",
              color: "#f0f0f0",
              fontSize: 14,
              boxSizing: "border-box",
              colorScheme: "dark",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
          Time of Day
        </label>
        <select
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
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
        >
          {TIME_OF_DAY.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          if (!isValid) return;
          onSave({ value: parseFloat(value), measured_at: new Date(date).toISOString(), time_of_day: timeOfDay });
          setValue("");
          setDate(new Date().toISOString().slice(0, 16));
        }}
        disabled={!isValid}
        style={{
          background: isValid ? "#55b3ff" : "#6b6b6b",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: isValid ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        Save Glucose Entry
      </button>
    </div>
  );
}
