import { useState } from "react";

export default function WeightEntry({ onSave }: { onSave: (entry: { weight_value: number; unit: "lbs" | "kg" }) => void }) {
  const [value, setValue] = useState<string>("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");

  const isValid = (() => {
    const num = parseFloat(value);
    return Number.isFinite(num) && num > 0;
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
        Weight
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
            Weight
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.0"
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
        <div style={{ width: 100 }}>
          <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "lbs" | "kg")}
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
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => {
          const num = parseFloat(value);
          if (!Number.isFinite(num) || num <= 0) return;
          onSave({ weight_value: num, unit });
          setValue("");
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
        Save Weight Entry
      </button>
    </div>
  );
}
