import { useState } from "react";

export default function BloodPressureEntry({ onSave }: { onSave: (entry: { systolic: number; diastolic: number; pulse: number | null }) => void }) {
  const [systolic, setSystolic] = useState<string>("");
  const [diastolic, setDiastolic] = useState<string>("");
  const [pulse, setPulse] = useState<string>("");

  const isValid = (() => {
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    const p = pulse.trim() === "" ? null : parseInt(pulse, 10);
    return s >= 60 && s <= 250 && d >= 40 && d <= 150 && (p === null || p > 0);
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
        Blood Pressure
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#6b6b6b", display: "block", marginBottom: 8 }}>
            Systolic (60–250)
          </label>
          <input
            type="number"
            min="60"
            max="250"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
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
            Diastolic (40–150)
          </label>
          <input
            type="number"
            min="40"
            max="150"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
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
            Pulse (optional)
          </label>
          <input
            type="number"
            min="0"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
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
      </div>

      <button
        onClick={() => {
          if (!isValid) return;
          const p = pulse.trim() === "" ? null : parseInt(pulse, 10);
          onSave({ systolic: parseInt(systolic, 10), diastolic: parseInt(diastolic, 10), pulse: p });
          setSystolic("");
          setDiastolic("");
          setPulse("");
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
        Save Blood Pressure Entry
      </button>
    </div>
  );
}
