"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Sliders,
  ShieldAlert,
  Save,
  Check,
  Clock
} from "lucide-react";
import { fetchAnomalies } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([
    {
      id: "alt-1",
      type: "PH_THRESHOLD_HIGH",
      parameter: "pH",
      severity: "WARNING",
      value: 8.65,
      threshold: "6.5 - 8.5",
      message: "Culture pH rose above 8.5. Aeration pump activated to restore dissolved CO₂.",
      timestamp: Date.now() - 1000 * 60 * 18,
      resolved: false
    },
    {
      id: "alt-2",
      type: "TEMPERATURE_OPTIMAL",
      parameter: "Temperature",
      severity: "INFO",
      value: 25.1,
      threshold: "22 - 28°C",
      message: "Reactor reached optimal photosynthetic metabolic temperature.",
      timestamp: Date.now() - 1000 * 60 * 45,
      resolved: true
    }
  ]);

  // Configurable thresholds
  const [phMin, setPhMin] = useState(6.5);
  const [phMax, setPhMax] = useState(8.5);
  const [tempMin, setTempMin] = useState(20.0);
  const [tempMax, setTempMax] = useState(32.0);
  const [darkMaxHours, setDarkMaxHours] = useState(14);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetchAnomalies("algae_pbr_01");
      if (res?.anomalies && res.anomalies.length > 0) {
        setAlerts((prev) => [...res.anomalies, ...prev]);
      }
    }
    load();
  }, []);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const handleSaveThresholds = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-eco-400" />
          Alerts, Notifications & Biological Safeguards
        </h1>
        <p className="text-xs text-eco-200/60 mt-1">
          Configure real-time monitoring thresholds and review photobioreactor safeguard logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Alerts Feed (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-eco-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-eco-500/15">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Active Alerts & History
            </h3>
            <span className="text-xs text-eco-400 font-mono">
              {alerts.filter((a) => !a.resolved).length} Unresolved
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border transition-all ${
                  alt.resolved
                    ? "bg-eco-950/40 border-eco-500/15 opacity-60"
                    : alt.severity === "CRITICAL"
                    ? "bg-red-950/40 border-red-500/40"
                    : "bg-amber-950/40 border-amber-500/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    {alt.severity === "CRITICAL" ? (
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{alt.type}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            alt.severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-xs text-eco-100 mt-1 leading-relaxed">{alt.message}</p>
                      <div className="text-[10px] text-eco-300/60 mt-1 font-mono">
                        Threshold: {alt.threshold} • Value: {alt.value}
                      </div>
                    </div>
                  </div>

                  {!alt.resolved ? (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="px-2.5 py-1 rounded-lg bg-eco-600 hover:bg-eco-500 text-white text-[10px] font-semibold shrink-0"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Configurable Safeguard Thresholds (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sliders className="w-4 h-4 text-eco-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Configurable Guardrail Limits
              </h3>
            </div>
            <p className="text-xs text-eco-200/60 mb-5">
              Set automated trigger levels for emergency aeration, email alerts, and push notifications
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-eco-300 font-medium block mb-1">
                  pH Range Safe Zone (Min - Max)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={phMin}
                    onChange={(e) => setPhMin(parseFloat(e.target.value))}
                    className="p-2 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={phMax}
                    onChange={(e) => setPhMax(parseFloat(e.target.value))}
                    className="p-2 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-eco-300 font-medium block mb-1">
                  Temperature Boundaries (°C)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={tempMin}
                    onChange={(e) => setTempMin(parseFloat(e.target.value))}
                    className="p-2 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={tempMax}
                    onChange={(e) => setTempMax(parseFloat(e.target.value))}
                    className="p-2 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-eco-300 font-medium block mb-1">
                  Maximum Darkness Exposure (Hours)
                </label>
                <input
                  type="number"
                  value={darkMaxHours}
                  onChange={(e) => setDarkMaxHours(parseInt(e.target.value))}
                  className="w-full p-2 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-eco-500/15">
            <button
              onClick={handleSaveThresholds}
              className="w-full py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 text-white font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>SAVE & APPLY THRESHOLDS</span>
            </button>

            {savedSettings && (
              <div className="mt-2 text-center text-[11px] text-emerald-400 font-semibold animate-fadeIn">
                Guardrail thresholds updated successfully.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
