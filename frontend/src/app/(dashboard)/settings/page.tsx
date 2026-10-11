"use client";

import React, { useState } from "react";
import {
  Settings,
  Cpu,
  Clock,
  Shield,
  Save,
  CheckCircle,
  Users,
  HardDrive
} from "lucide-react";

export default function SettingsPage() {
  const [deviceId, setDeviceId] = useState("algae_pbr_01");
  const [loggingInterval, setLoggingInterval] = useState(2);
  const [reactorVolume, setReactorVolume] = useState(20.0);
  const [cloudSync, setCloudSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-eco-400" />
          System & Device Configuration
        </h1>
        <p className="text-xs text-eco-200/60 mt-1">
          Manage hardware identifier, logging intervals, bioreactor vessel geometry, and access roles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Settings */}
        <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Hardware & Edge Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-eco-300 font-medium block mb-1">Device Identifier</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-eco-300 font-medium block mb-1">
                Sensor Sampling Cadence (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={loggingInterval}
                onChange={(e) => setLoggingInterval(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
              />
              <span className="text-[10px] text-eco-300/60 mt-0.5 block">
                Standard firmware timing is 2000 ms.
              </span>
            </div>

            <div>
              <label className="text-eco-300 font-medium block mb-1">
                Photobioreactor Liquid Volume (Liters)
              </label>
              <input
                type="number"
                step="0.5"
                value={reactorVolume}
                onChange={(e) => setReactorVolume(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-eco-950 border border-eco-500/25 text-white font-mono"
              />
              <span className="text-[10px] text-eco-300/60 mt-0.5 block">
                Used in stoichiometric CO₂ mass calculation (1.83 × ΔX × V).
              </span>
            </div>
          </div>
        </div>

        {/* Roles & Cloud Sync */}
        <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Access Roles & Firebase Cloud Sync
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Continuous RTDB Sync</span>
                <span className="text-[11px] text-eco-200/60">Stream sensor telemetry to Firebase every 2s</span>
              </div>
              <input
                type="checkbox"
                checked={cloudSync}
                onChange={(e) => setCloudSync(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15 space-y-1">
              <span className="font-bold text-white block">Current Operator Role</span>
              <span className="text-[11px] text-eco-300 font-mono">ADMIN (Full actuation & calibration write permissions)</span>
            </div>

            <div className="p-3 rounded-xl bg-eco-900/30 border border-eco-500/15 space-y-1">
              <span className="font-bold text-white block">LCD Display State</span>
              <span className="text-[11px] text-amber-300">DISCONNECTED (Firmware serial diagnostics active)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 text-white font-bold text-xs tracking-wider transition-all flex items-center gap-2 shadow-md shadow-eco-600/30"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SYSTEM SETTINGS</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>System configuration parameters saved and applied!</span>
        </div>
      )}
    </div>
  );
}
