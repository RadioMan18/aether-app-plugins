import { useEffect, useState } from "react";
import { db } from "../../sdk/src/index.ts";
import MoodSelector from "./components/MoodSelector";
import WeightEntry from "./components/WeightEntry";
import BloodPressureEntry from "./components/BloodPressureEntry";
import GlucoseEntry from "./components/GlucoseEntry";
import WellnessCharts from "./components/WellnessCharts";

export type TimeRange = "day" | "week" | "month";

export interface MoodEntry {
  id: string;
  mood: number;
  sleep_hours: number;
  energy_level: number;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  weight_value: number;
  unit: "lbs" | "kg";
  created_at: string;
  updated_at: string;
}

export interface BloodPressureEntry {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  created_at: string;
  updated_at: string;
}

export interface GlucoseEntry {
  id: string;
  value: number;
  measured_at: string;
  time_of_day: string;
  created_at: string;
  updated_at: string;
}

type Tab = "checkin" | "charts";

export default function App() {
  const [view, setView] = useState<Tab>("checkin");
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [bpEntries, setBpEntries] = useState<BloodPressureEntry[]>([]);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      setError(null);
      const [mood, weight, bp, glucose] = await Promise.all([
        db.query<MoodEntry>("SELECT id, mood, sleep_hours, energy_level, created_at, updated_at FROM mood_entries ORDER BY created_at DESC"),
        db.query<WeightEntry>("SELECT id, weight_value, unit, created_at, updated_at FROM weight_entries ORDER BY created_at DESC"),
        db.query<BloodPressureEntry>("SELECT id, systolic, diastolic, pulse, created_at, updated_at FROM blood_pressure_entries ORDER BY created_at DESC"),
        db.query<GlucoseEntry>("SELECT id, value, measured_at, time_of_day, created_at, updated_at FROM glucose_entries ORDER BY measured_at DESC"),
      ]);
      setMoodEntries(mood);
      setWeightEntries(weight);
      setBpEntries(bp);
      setGlucoseEntries(glucose);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSaveMood = async (entry: Omit<MoodEntry, "id" | "created_at" | "updated_at">) => {
    try {
      setError(null);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO mood_entries (id, mood, sleep_hours, energy_level, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [id, entry.mood, entry.sleep_hours, entry.energy_level, now, now]
      );
      await loadEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleSaveWeight = async (entry: Omit<WeightEntry, "id" | "created_at" | "updated_at">) => {
    try {
      setError(null);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO weight_entries (id, weight_value, unit, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        [id, entry.weight_value, entry.unit, now, now]
      );
      await loadEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleSaveBloodPressure = async (entry: Omit<BloodPressureEntry, "id" | "created_at" | "updated_at">) => {
    try {
      setError(null);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO blood_pressure_entries (id, systolic, diastolic, pulse, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [id, entry.systolic, entry.diastolic, entry.pulse, now, now]
      );
      await loadEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleSaveGlucose = async (entry: Omit<GlucoseEntry, "id" | "created_at" | "updated_at">) => {
    try {
      setError(null);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        "INSERT INTO glucose_entries (id, value, measured_at, time_of_day, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [id, entry.value, entry.measured_at, entry.time_of_day, now, now]
      );
      await loadEntries();
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
            Wellness
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "#6b6b6b",
            }}
          >
            Track your health
          </p>
        </div>

        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setView("checkin")}
            style={{
              background: view === "checkin" ? "#55b3ff" : "transparent",
              color: view === "checkin" ? "#fff" : "#6b6b6b",
              border: "1px solid #2e2f32",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Check-In
          </button>
          <button
            onClick={() => setView("charts")}
            style={{
              background: view === "charts" ? "#55b3ff" : "transparent",
              color: view === "charts" ? "#fff" : "#6b6b6b",
              border: "1px solid #2e2f32",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Charts
          </button>
        </div>

        {view === "charts" && (
          <div style={{ padding: "12px 20px", display: "flex", gap: 8 }}>
            {(["day", "week", "month"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? "#55b3ff" : "transparent",
                  color: timeRange === range ? "#fff" : "#6b6b6b",
                  border: "1px solid #2e2f32",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  flex: 1,
                  textTransform: "capitalize",
                }}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {isLoading ? (
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
            Loading wellness data...
          </div>
        ) : view === "checkin" ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
            <MoodSelector onSave={handleSaveMood} />
            <WeightEntry onSave={handleSaveWeight} />
            <BloodPressureEntry onSave={handleSaveBloodPressure} />
            <GlucoseEntry onSave={handleSaveGlucose} />
          </div>
        ) : (
          <WellnessCharts
            moodEntries={moodEntries}
            weightEntries={weightEntries}
            bpEntries={bpEntries}
            glucoseEntries={glucoseEntries}
            timeRange={timeRange}
          />
        )}
      </div>
    </div>
  );
}
