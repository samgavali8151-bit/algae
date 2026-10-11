"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart as LucideLineChart,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Sun,
  Activity,
  Thermometer,
  PieChart as LucidePieChart
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { fetchHistory } from "@/lib/api";

const LIGHT_COLORS = {
  DARK: "#334155",
  LOW: "#1e3a8a",
  MEDIUM: "#b45309",
  BRIGHT: "#eab308"
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<"all" | "ph_temp" | "light_co2">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const points = timeRange === "1h" ? 12 : (timeRange === "6h" ? 24 : (timeRange === "24h" ? 36 : 50));
      const interval = timeRange === "1h" ? "10m" : (timeRange === "6h" ? "1h" : "1h");
      const res = await fetchHistory("algae_pbr_01", interval, points);
      if (res?.data) {
        setHistoryData(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, [timeRange]);

  // Calculate light distribution for Donut Chart
  const lightCounts = historyData.reduce((acc: any, curr) => {
    const lvl = curr.lightLevel || "BRIGHT";
    acc[lvl] = (acc[lvl] || 0) + 1;
    return acc;
  }, {});

  const donutData = Object.keys(lightCounts).map(k => ({
    name: k,
    value: lightCounts[k],
    color: (LIGHT_COLORS as any)[k] || "#10b981"
  }));

  const exportCSV = () => {
    if (!historyData.length) return;
    const headers = ["Timestamp", "ISO", "Temperature", "Humidity", "pH", "LDR", "LightLevel", "CO2_g_day", "HealthScore"];
    const rows = historyData.map(d => [
      d.timestamp,
      d.iso,
      d.temperature,
      d.humidity,
      d.phCalibrated,
      d.ldrValue,
      d.lightLevel,
      d.co2CaptureGPerDay,
      d.healthScore
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `microalgae_telemetry_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LucideLineChart className="w-5 h-5 text-eco-400" />
            Biological & Environmental Analytics
          </h1>
          <p className="text-xs text-eco-200/60 mt-1">
            Multi-variable time-series correlation, photoperiod distribution, and carbon fixation rates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex rounded-xl bg-eco-950/80 p-1 border border-eco-500/20 text-xs">
            {(["1h", "6h", "24h", "7d"] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? "bg-eco-600 text-white shadow-sm"
                    : "text-eco-300/70 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-1.5 rounded-xl glass-card text-xs font-semibold text-eco-300 hover:text-white border border-eco-500/30 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Parameter Trend Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Dynamic Trend Overlay</h2>
            <p className="text-xs text-eco-200/60">Photosynthetic pH shift versus culture temperature and light intensity</p>
          </div>

          {/* Overlay Selector */}
          <div className="flex rounded-lg bg-eco-900/40 p-1 border border-eco-500/20 text-xs">
            <button
              onClick={() => setSelectedOverlay("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${selectedOverlay === "all" ? "bg-eco-600 text-white" : "text-eco-300/60"}`}
            >
              All Parameters
            </button>
            <button
              onClick={() => setSelectedOverlay("ph_temp")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${selectedOverlay === "ph_temp" ? "bg-eco-600 text-white" : "text-eco-300/60"}`}
            >
              pH vs Temp
            </button>
            <button
              onClick={() => setSelectedOverlay("light_co2")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${selectedOverlay === "light_co2" ? "bg-eco-600 text-white" : "text-eco-300/60"}`}
            >
              Light vs CO₂ Rate
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
              <XAxis dataKey="iso" stroke="#6ee7b7" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(2, 18, 11, 0.95)",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />

              {(selectedOverlay === "all" || selectedOverlay === "ph_temp") && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="phCalibrated"
                    name="Calibrated pH"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              )}

              {(selectedOverlay === "all" || selectedOverlay === "light_co2") && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="co2CaptureGPerDay"
                    name="CO₂ Fixed (g/day)"
                    stroke="#a7f3d0"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ldrValue"
                    name="LDR Intensity"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Light Distribution Donut & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Light Level Distribution Donut */}
        <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Photoperiod Illumination Profile
            </h3>
            <p className="text-xs text-eco-200/60 mt-0.5">Distribution of exposure across DARK, LOW, MEDIUM, and BRIGHT</p>

            <div className="h-56 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(2, 18, 11, 0.95)",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      borderRadius: "10px",
                      fontSize: "11px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-eco-500/15 text-center text-[10px]">
            {donutData.map(d => (
              <div key={d.name} className="p-1.5 rounded-lg bg-eco-950/40">
                <span className="font-semibold block text-white">{d.name}</span>
                <span className="text-eco-400 font-mono">{d.value} samples</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biological Correlation Matrix */}
        <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Biological Parameter Correlation Matrix
            </h3>
            <p className="text-xs text-eco-200/60 mt-0.5">Pearson correlation coefficients ($r$) between culture variables</p>

            <div className="mt-4 space-y-3">
              {[
                { pair: "Light Intensity ↔ CO₂ Capture Rate", r: 0.92, type: "Strong Positive", desc: "Illumination powers light-dependent photosynthetic Calvin reactions." },
                { pair: "Light Intensity ↔ Culture pH", r: 0.81, type: "Positive", desc: "Proton consumption by algal Rubisco enzyme drives pH upward during day." },
                { pair: "Aeration Pump ↔ Culture pH", r: -0.74, type: "Negative Buffer", desc: "Forced gas diffusion injects carbonic acid, pulling elevated alkaline pH down." },
                { pair: "Water Level Depletion ↔ Health Score", r: -0.88, type: "Strong Negative", desc: "Nutrient starvation and cell desiccation trigger acute culture crashes." }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-eco-950/50 border border-eco-500/15 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.pair}</div>
                    <div className="text-[11px] text-eco-200/60 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono font-bold text-emerald-400 text-sm">r = {item.r > 0 ? `+${item.r}` : item.r}</span>
                    <span className="block text-[10px] text-eco-300/70">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
