"use client";

import React, { useState } from "react";
import { Power, Sparkles, Cpu, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { sendRelayCommand } from "@/lib/api";

interface PumpControlPanelProps {
  currentStatus: "ON" | "OFF";
  onStatusChange?: (newStatus: "ON" | "OFF", mode: "manual" | "auto" | "ai") => void;
}

export function PumpControlPanel({ currentStatus, onStatusChange }: PumpControlPanelProps) {
  const [mode, setMode] = useState<"manual" | "auto" | "ai">("auto");
  const [relayState, setRelayState] = useState<"ON" | "OFF">(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleModeChange = async (newMode: "manual" | "auto" | "ai") => {
    setMode(newMode);
    setIsSubmitting(true);
    const cmd = newMode === "manual" ? relayState : "AUTO";
    await sendRelayCommand("algae_pbr_01", cmd, newMode);
    setIsSubmitting(false);
    setNotification(`Switched to ${newMode.toUpperCase()} mode`);
    setTimeout(() => setNotification(null), 3000);
    if (onStatusChange) onStatusChange(relayState, newMode);
  };

  const handleToggleManualRelay = async (turnOn: boolean) => {
    const newCmd = turnOn ? "ON" : "OFF";
    setRelayState(newCmd);
    setIsSubmitting(true);
    await sendRelayCommand("algae_pbr_01", newCmd, "manual");
    setIsSubmitting(false);
    setNotification(`Manual pump turned ${newCmd}`);
    setTimeout(() => setNotification(null), 3000);
    if (onStatusChange) onStatusChange(newCmd, "manual");
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Power className="w-4 h-4 text-eco-400" />
              Aeration & Circulation Pump
            </h3>
            <p className="text-xs text-eco-200/60 mt-0.5">Controls CO₂ gas diffusion and medium mixing (GPIO 25)</p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                relayState === "ON"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              RELAY {relayState}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-eco-950/60 border border-eco-500/20 mb-4">
          <button
            onClick={() => handleModeChange("manual")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === "manual"
                ? "bg-eco-600 text-white shadow-md shadow-eco-600/30"
                : "text-eco-300/70 hover:text-white hover:bg-eco-900/40"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>

          <button
            onClick={() => handleModeChange("auto")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === "auto"
                ? "bg-eco-600 text-white shadow-md shadow-eco-600/30"
                : "text-eco-300/70 hover:text-white hover:bg-eco-900/40"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>

          <button
            onClick={() => handleModeChange("ai")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === "ai"
                ? "bg-gradient-to-r from-eco-600 to-cyanGlow-500 text-white shadow-md shadow-cyanGlow-500/30"
                : "text-eco-300/70 hover:text-white hover:bg-eco-900/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mode</span>
          </button>
        </div>

        {/* Mode details */}
        {mode === "manual" && (
          <div className="p-3.5 rounded-xl bg-eco-900/30 border border-eco-500/20 space-y-3">
            <p className="text-xs text-eco-200/80">Direct relay override. Bypasses threshold safeguards.</p>
            <div className="flex gap-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleToggleManualRelay(true)}
                className={`flex-1 py-2 rounded-lg font-bold text-xs tracking-wider border transition-all ${
                  relayState === "ON"
                    ? "bg-emerald-500 text-black border-emerald-400 glow-emerald"
                    : "bg-eco-950 text-eco-300 border-eco-500/40 hover:bg-emerald-950/60"
                }`}
              >
                TURN ON
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleToggleManualRelay(false)}
                className={`flex-1 py-2 rounded-lg font-bold text-xs tracking-wider border transition-all ${
                  relayState === "OFF"
                    ? "bg-red-500/80 text-white border-red-400"
                    : "bg-eco-950 text-eco-300 border-eco-500/40 hover:bg-red-950/40"
                }`}
              >
                TURN OFF
              </button>
            </div>
          </div>
        )}

        {mode === "auto" && (
          <div className="p-3.5 rounded-xl bg-eco-900/20 border border-eco-500/20 text-xs text-eco-200/80 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Automated Parameter Safeguards Active
            </div>
            <p className="text-[11px] text-eco-300/70 leading-relaxed">
              Pump activates when pH exceeds 8.4 to dissolve CO₂, or if water level drops to LOW to trigger nutrient recirculation. Shuts off when pH is stabilized under 7.2.
            </p>
          </div>
        )}

        {mode === "ai" && (
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200/80 space-y-1.5">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Autonomous Predictive Circulation Active
            </div>
            <p className="text-[11px] text-cyan-200/70 leading-relaxed">
              AI monitors photosynthetically active radiation (PAR), temperature, and dissolved carbon uptake rates to calculate optimal fluid turnover without causing cellular shear stress.
            </p>
          </div>
        )}
      </div>

      {notification && (
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-eco-500/20 border border-eco-500/40 text-[11px] font-medium text-eco-200 flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <CheckCircle className="w-3.5 h-3.5 text-eco-400" />
        </div>
      )}
    </div>
  );
}
