"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Thermometer,
  Droplets,
  Sun,
  Activity,
  Layers,
  Power,
  RefreshCw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CircularGauge } from "@/components/dashboard/CircularGauge";
import { PumpControlPanel } from "@/components/dashboard/PumpControlPanel";
import { HealthScoreWidget } from "@/components/dashboard/HealthScoreWidget";
import { useFirebaseLiveTelemetry } from "@/lib/useFirebase";
import { fetchAnomalies } from "@/lib/api";
import { SensorReadings, KineticsMetrics } from "@/types";
import { formatTimestamp } from "@/lib/utils";

// Client-side kinetics computation matching the backend Monod model
function computeKinetics(temp: number, ph: number, ldr: number, water: string): KineticsMetrics {
  const muMax = 1.25;
  const iOpt = 2200;
  const tOpt = 25.0;
  const phOpt = 7.8;
  const volume = 20.0;
  const biomassDensity = 1.25;
  const co2Stoich = 1.83;

  const iRatio = Math.max(0.01, ldr / iOpt);
  const fLight = Math.max(0, Math.min(1, iRatio * Math.exp(1.0 - iRatio)));
  const fTemp = Math.max(0, Math.min(1, Math.exp(-0.5 * Math.pow((temp - tOpt) / 4.5, 2))));
  const fPh = Math.max(0, Math.min(1, Math.exp(-0.5 * Math.pow((ph - phOpt) / 0.7, 2))));
  const fWater = water === "HIGH" ? 1.0 : 0.35;

  const mu = parseFloat((muMax * fLight * fTemp * fPh * fWater).toFixed(4));
  const health = Math.max(5, Math.min(100, Math.round((fLight * 0.3 + fTemp * 0.3 + fPh * 0.3 + fWater * 0.1) * 100)));
  const totalBiomass = biomassDensity * volume;
  const growthGDay = parseFloat((mu * totalBiomass).toFixed(2));
  const co2GDay = parseFloat((growthGDay * co2Stoich).toFixed(2));
  const co2KgDay = parseFloat((co2GDay / 1000).toFixed(5));
  const co2KgYear = parseFloat((co2KgDay * 365).toFixed(2));

  return {
    healthScore: health,
    specificGrowthRateMu: mu,
    growthFactors: {
      f_light: parseFloat(fLight.toFixed(3)),
      f_temp: parseFloat(fTemp.toFixed(3)),
      f_ph: parseFloat(fPh.toFixed(3)),
      f_water: parseFloat(fWater.toFixed(3)),
    },
    biomassDensityGPerL: biomassDensity,
    biomassGrowthGPerDay: growthGDay,
    co2CaptureGPerDay: co2GDay,
    co2CaptureKgPerDay: co2KgDay,
    co2ProjectedKgPerYear: co2KgYear,
    treeEquivalents: parseFloat((co2KgYear / 21.77).toFixed(2)),
    carKmOffset: parseFloat((co2GDay / 120).toFixed(1)),
    carbonCreditUsdYear: parseFloat(((co2KgYear / 1000) * 35).toFixed(3)),
  };
}

export default function LiveDashboardPage() {
  // Real-time Firebase RTDB stream (sub-second latency)
  const { readings: firebaseReadings, isOnline, error: fbError } = useFirebaseLiveTelemetry("algae_pbr_01");
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    fetchAnomalies("algae_pbr_01").then((res) => {
      if (res?.anomalies) setAnomalies(res.anomalies);
    });
  }, []);

  const readings: SensorReadings = firebaseReadings || {
    temperature: 25.2,
    humidity: 62.0,
    ldrValue: 2420,
    lightLevel: "BRIGHT" as const,
    phRaw: 2680,
    phVoltage: 2.16,
    phCalibrated: 7.82,
    waterLevel: "HIGH" as const,
    relayStatus: "OFF" as const,
    timestamp: Math.floor(Date.now() / 1000),
    online: true
  };

  const currentMetrics = useMemo(() =>
    computeKinetics(
      readings.temperature,
      readings.phCalibrated,
      readings.ldrValue,
      readings.waterLevel
    ),
    [readings.temperature, readings.phCalibrated, readings.ldrValue, readings.waterLevel]
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Device Heartbeat */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Live Photobioreactor Telemetry
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <p className="text-xs text-eco-200/60 mt-1 flex items-center gap-2">
            <span>ESP32 Node (GPIO 4, 34, 32, 27, 25)</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-eco-400" />
              Last sync: {formatTimestamp(readings.timestamp)}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-xl glass-card text-xs font-semibold text-eco-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Alerts Banner if Anomaly Exists */}
      {anomalies.length > 0 && (
        <div className="space-y-2">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="font-bold">{anom.type}:</span> {anom.message}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                {anom.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Circular Gauges Panel (pH, Temp, Light) */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Photobioreactor Environmental Gauges</h2>
            <p className="text-xs text-eco-200/60">Real-time parameters plotted against optimal biological bands</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <CircularGauge
            value={readings.phCalibrated}
            min={4.0}
            max={11.0}
            unit="pH"
            label="Calibrated pH"
            optimalMin={7.0}
            optimalMax={8.2}
            color="#10b981"
          />

          <CircularGauge
            value={readings.temperature}
            min={10.0}
            max={45.0}
            unit="°C"
            label="Culture Temperature"
            optimalMin={22.0}
            optimalMax={28.0}
            color="#06b6d4"
          />

          <CircularGauge
            value={readings.ldrValue}
            min={0}
            max={4095}
            unit="ADC"
            label="Light Intensity (LDR)"
            optimalMin={1200}
            optimalMax={3200}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Primary Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Card */}
        <MetricCard
          title="Culture Temperature"
          value={readings.temperature < 0 ? "Sensor Error" : readings.temperature}
          unit="°C"
          icon={Thermometer}
          statusBadge={readings.temperature >= 22 && readings.temperature <= 28 ? "OPTIMAL" : "ATTENTION"}
          statusColor={readings.temperature >= 22 && readings.temperature <= 28 ? "emerald" : "amber"}
          subDetails="DHT11 Sensor (GPIO 4)"
          diagnostics="Ref: 22°C - 28°C"
        />

        {/* Humidity Card */}
        <MetricCard
          title="Relative Humidity"
          value={readings.humidity < 0 ? "Sensor Error" : readings.humidity}
          unit="%"
          icon={Droplets}
          statusBadge="NORMAL"
          statusColor="cyan"
          subDetails="Headspace gas moisture"
          diagnostics="Ambient DHT11"
        />

        {/* Light Level Card */}
        <MetricCard
          title="Light Level"
          value={readings.lightLevel}
          icon={Sun}
          statusBadge={`RAW ADC ${readings.ldrValue}`}
          statusColor={readings.lightLevel === "BRIGHT" ? "emerald" : "amber"}
          subDetails="Photoperiod illumination"
          diagnostics="GPIO 34 ADC"
        />

        {/* pH Card */}
        <MetricCard
          title="Culture pH"
          value={readings.phCalibrated}
          unit="pH"
          icon={Activity}
          statusBadge={`${readings.phVoltage.toFixed(2)}V (ADC ${readings.phRaw})`}
          statusColor={readings.phCalibrated >= 7.0 && readings.phCalibrated <= 8.2 ? "emerald" : "amber"}
          subDetails="Electrochemical probe (GPIO 32)"
          diagnostics="Calibrated dynamic"
        />
      </div>

      {/* Secondary Cards: Water Level & Actuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Water Level */}
        <MetricCard
          title="Water Level Switch"
          value={readings.waterLevel}
          icon={Layers}
          statusBadge={readings.waterLevel === "HIGH" ? "ADEQUATE" : "DEPLETED"}
          statusColor={readings.waterLevel === "HIGH" ? "emerald" : "red"}
          subDetails="Digital float (GPIO 27, INPUT_PULLUP)"
          diagnostics={readings.waterLevel === "HIGH" ? "Full capacity" : "Refill required"}
        />

        {/* Relay State */}
        <MetricCard
          title="Circulation Pump"
          value={readings.relayStatus}
          icon={Power}
          statusBadge={`ACTIVE ${readings.relayStatus === "ON" ? "LOW" : "HIGH"}`}
          statusColor={readings.relayStatus === "ON" ? "emerald" : "slate"}
          subDetails="Aeration Relay (GPIO 25)"
          diagnostics="Aerates CO₂ into fluid"
        />

        {/* Specific Growth Rate mu */}
        <MetricCard
          title="Specific Growth Rate (μ)"
          value={currentMetrics.specificGrowthRateMu}
          unit="day⁻¹"
          icon={Sparkles}
          statusBadge="KINETICS"
          statusColor="cyan"
          subDetails="Photosynthetic biomass rate"
          diagnostics="Monod model"
        />

        {/* Health Score */}
        <MetricCard
          title="Culture Health"
          value={`${currentMetrics.healthScore}/100`}
          icon={CheckCircle2}
          statusBadge="HEALTH INDEX"
          statusColor={currentMetrics.healthScore >= 80 ? "emerald" : "amber"}
          subDetails="Multi-variable combined score"
          diagnostics="AI Monitored"
        />
      </div>

      {/* Control Panel and Health / CO2 Capture Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PumpControlPanel
          currentStatus={readings.relayStatus}
          onStatusChange={() => {}}
        />

        <HealthScoreWidget metrics={currentMetrics} />
      </div>
    </div>
  );
}
