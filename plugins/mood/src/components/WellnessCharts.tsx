import { useMemo } from "react";
import type { MoodEntry, WeightEntry, BloodPressureEntry, GlucoseEntry, TimeRange } from "../App";

function filterByRange<T extends { created_at?: string; measured_at?: string }>(
  entries: T[],
  range: TimeRange,
): T[] {
  const now = Date.now();
  const ms =
    range === "day" ? 24 * 60 * 60 * 1000 : range === "week" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const cutoff = now - ms;
  return entries.filter((entry) => {
    const ts = new Date((entry.created_at || entry.measured_at || "").replace("Z", "")).getTime();
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

function SimpleLineChart({
  data,
  color,
  label,
  formatValue,
}: {
  data: { x: number; y: number }[];
  color: string;
  label: string;
  formatValue: (v: number) => string;
}) {
  if (data.length < 2) {
    return (
      <div
        style={{
          padding: 24,
          color: "#6b6b6b",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        {data.length === 0 ? `No ${label.toLowerCase()} data for this period.` : "Need at least 2 data points to render a chart."}
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const ys = data.map((d) => d.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = maxY - minY || 1;

  const points = data
    .map((d, i) => {
      const x = padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
      const y = padding.top + chartH - ((d.y - minY) / yRange) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const lastX = padding.left + (data.length === 1 ? chartW / 2 : chartW);
  const lastY = padding.top + chartH - ((last.y - minY) / yRange) * chartH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="#2e2f32" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="#2e2f32" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={lastX} cy={lastY} r="4" fill={color} />
      <text x={padding.left} y={padding.top - 6} fill="#6b6b6b" fontSize="12">
        {formatValue(maxY)}
      </text>
      <text x={padding.left} y={padding.top + chartH + 16} fill="#6b6b6b" fontSize="12">
        {formatValue(minY)}
      </text>
      <text x={lastX + 8} y={lastY + 4} fill={color} fontSize="12">
        {formatValue(last.y)}
      </text>
    </svg>
  );
}

export default function WellnessCharts({
  moodEntries,
  weightEntries,
  bpEntries,
  glucoseEntries,
  timeRange,
}: {
  moodEntries: MoodEntry[];
  weightEntries: WeightEntry[];
  bpEntries: BloodPressureEntry[];
  glucoseEntries: GlucoseEntry[];
  timeRange: TimeRange;
}) {
  const moodData = useMemo(
    () =>
      filterByRange(moodEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.mood }))
        .sort((a, b) => a.x - b.x),
    [moodEntries, timeRange],
  );

  const sleepData = useMemo(
    () =>
      filterByRange(moodEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.sleep_hours }))
        .sort((a, b) => a.x - b.x),
    [moodEntries, timeRange],
  );

  const energyData = useMemo(
    () =>
      filterByRange(moodEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.energy_level }))
        .sort((a, b) => a.x - b.x),
    [moodEntries, timeRange],
  );

  const weightData = useMemo(
    () =>
      filterByRange(weightEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.weight_value }))
        .sort((a, b) => a.x - b.x),
    [weightEntries, timeRange],
  );

  const systolicData = useMemo(
    () =>
      filterByRange(bpEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.systolic }))
        .sort((a, b) => a.x - b.x),
    [bpEntries, timeRange],
  );

  const diastolicData = useMemo(
    () =>
      filterByRange(bpEntries, timeRange)
        .map((e) => ({ x: new Date(e.created_at).getTime(), y: e.diastolic }))
        .sort((a, b) => a.x - b.x),
    [bpEntries, timeRange],
  );

  const glucoseData = useMemo(
    () =>
      filterByRange(glucoseEntries, timeRange)
        .map((e) => ({ x: new Date(e.measured_at).getTime(), y: e.value }))
        .sort((a, b) => a.x - b.x),
    [glucoseEntries, timeRange],
  );

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Mood</h3>
        <SimpleLineChart data={moodData} color="#55b3ff" label="Mood" formatValue={(v) => v.toFixed(1)} />
      </section>

      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Sleep Hours</h3>
        <SimpleLineChart data={sleepData} color="#a78bfa" label="Sleep" formatValue={(v) => `${v.toFixed(1)}h`} />
      </section>

      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Energy Level</h3>
        <SimpleLineChart data={energyData} color="#4ade80" label="Energy" formatValue={(v) => v.toFixed(1)} />
      </section>

      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Weight</h3>
        <SimpleLineChart data={weightData} color="#facc15" label="Weight" formatValue={(v) => `${v.toFixed(1)}`} />
      </section>

      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Blood Pressure</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b6b6b", marginBottom: 8 }}>Systolic</div>
            <SimpleLineChart data={systolicData} color="#ff5f5f" label="Systolic" formatValue={(v) => `${v.toFixed(0)}`} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b6b6b", marginBottom: 8 }}>Diastolic</div>
            <SimpleLineChart data={diastolicData} color="#55b3ff" label="Diastolic" formatValue={(v) => `${v.toFixed(0)}`} />
          </div>
        </div>
      </section>

      <section
        style={{
          background: "#111214",
          border: "1px solid #2e2f32",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f0f0f0" }}>Glucose</h3>
        <SimpleLineChart data={glucoseData} color="#4ade80" label="Glucose" formatValue={(v) => `${v.toFixed(0)} mg/dL`} />
      </section>
    </div>
  );
}
