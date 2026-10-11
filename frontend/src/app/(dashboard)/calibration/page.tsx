"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckCircle,
  Activity,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { fetchLiveTelemetry, submitCalibration } from "@/lib/api";

export default function CalibrationPage() {
  const [liveVoltage, setLiveVoltage] = useState(2.51);
  const [step, setStep] = useState(1);
  const [point4, setPoint4] = useState({ buffer: 4.01, voltage: 3.04 });
  const [point7, setPoint7] = useState({ buffer: 7.00, voltage: 2.51 });
  const [point10, setPoint10] = useState({ buffer: 10.01, voltage: 1.98 });
  const [calculatedSlope, setCalculatedSlope] = useState<number | null>(-5.70);
  const [calculatedOffset, setCalculatedOffset] = useState<number | null>(21.34);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchLiveTelemetry("algae_pbr_01");
      if (data?.readings?.phVoltage) {
        setLiveVoltage(data.readings.phVoltage);
      }
    }
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, []);

  const calculateCalibration = async () => {
    const points = [point4, point7, point10];
    const n = points.length;
    let sumV = 0, sumPh = 0, sumVPh = 0, sumV2 = 0;
    for (const p of points) {
      sumV += p.voltage;
      sumPh += p.buffer;
      sumVPh += p.voltage * p.buffer;
      sumV2 += p.voltage * p.voltage;
    }
    const slope = (n * sumVPh - sumV * sumPh) / (n * sumV2 - sumV * sumV);
    const offset = (sumPh - slope * sumV) / n;

    const slopeVal = parseFloat(slope.toFixed(3));
    const offsetVal = parseFloat(offset.toFixed(3));
    setCalculatedSlope(slopeVal);
    setCalculatedOffset(offsetVal);

    await submitCalibration("algae_pbr_01", points);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-eco-400" />
          Multi-Point Electrochemical pH Calibration Wizard
        </h1>
        <p className="text-xs text-eco-200/60 mt-1">
          Calibrate raw analog voltage from GPIO 32 against standard buffer standards (pH 4.01, 7.00, and 10.01)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Step-by-Step Wizard (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-eco-500/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-eco-500/15">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Step {step} of 3: Standard Calibration Sequence
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              Live Probe: {liveVoltage.toFixed(3)} V
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { s: 1, name: "Buffer pH 7.00 (Zero Offset)" },
              { s: 2, name: "Buffer pH 4.01 (Acidic)" },
              { s: 3, name: "Buffer pH 10.01 (Alkaline)" }
            ].map((st) => (
              <button
                key={st.s}
                onClick={() => setStep(st.s)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  step === st.s
                    ? "bg-eco-600 text-white border-eco-400 shadow-md"
                    : "glass-card text-eco-300/70 hover:text-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-eco-300">Step {st.s}</div>
                <div className="text-xs font-semibold truncate">{st.name}</div>
              </button>
            ))}
          </div>

          {/* Step 1 Content */}
          {step === 1 && (
            <div className="space-y-4 p-4 rounded-xl bg-eco-950/60 border border-eco-500/20">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Neutral Buffer Calibration (pH 7.00)
              </h4>
              <p className="text-xs text-eco-200/70 leading-relaxed">
                Rinse the glass pH electrode with distilled water, blot dry gently with a lint-free tissue, and immerse in standard <strong>pH 7.00 buffer solution</strong>. Stir gently and allow 30 seconds for voltage stabilization.
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-eco-900/40">
                <span className="text-xs text-eco-300">Captured Voltage:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={point7.voltage}
                    onChange={(e) => setPoint7({ ...point7, voltage: parseFloat(e.target.value) })}
                    className="w-24 px-2.5 py-1 rounded-lg bg-eco-950 border border-eco-500/40 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => setPoint7({ ...point7, voltage: parseFloat(liveVoltage.toFixed(3)) })}
                    className="px-2.5 py-1 rounded-lg bg-eco-600 text-[11px] font-semibold text-white"
                  >
                    Capture Live
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="space-y-4 p-4 rounded-xl bg-eco-950/60 border border-eco-500/20">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Acidic Buffer Calibration (pH 4.01)
              </h4>
              <p className="text-xs text-eco-200/70 leading-relaxed">
                Rinse the electrode thoroughly and submerge in standard <strong>pH 4.01 buffer solution</strong>. Acidic solutions induce higher relative cell voltage across the glass membrane.
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-eco-900/40">
                <span className="text-xs text-eco-300">Captured Voltage:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={point4.voltage}
                    onChange={(e) => setPoint4({ ...point4, voltage: parseFloat(e.target.value) })}
                    className="w-24 px-2.5 py-1 rounded-lg bg-eco-950 border border-eco-500/40 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => setPoint4({ ...point4, voltage: parseFloat(liveVoltage.toFixed(3)) })}
                    className="px-2.5 py-1 rounded-lg bg-eco-600 text-[11px] font-semibold text-white"
                  >
                    Capture Live
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Content */}
          {step === 3 && (
            <div className="space-y-4 p-4 rounded-xl bg-eco-950/60 border border-eco-500/20">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Alkaline Buffer Calibration (pH 10.01)
              </h4>
              <p className="text-xs text-eco-200/70 leading-relaxed">
                Rinse and submerge in standard <strong>pH 10.01 buffer solution</strong>. This provides full 3-point regression span to accurately capture microalgae daytime alkaline photosynthetic peaks.
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-eco-900/40">
                <span className="text-xs text-eco-300">Captured Voltage:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={point10.voltage}
                    onChange={(e) => setPoint10({ ...point10, voltage: parseFloat(e.target.value) })}
                    className="w-24 px-2.5 py-1 rounded-lg bg-eco-950 border border-eco-500/40 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => setPoint10({ ...point10, voltage: parseFloat(liveVoltage.toFixed(3)) })}
                    className="px-2.5 py-1 rounded-lg bg-eco-600 text-[11px] font-semibold text-white"
                  >
                    Capture Live
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Execute Calibration Button */}
          <button
            onClick={calculateCalibration}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs tracking-wider shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>CALCULATE & SYNC CALIBRATION CONSTANTS</span>
          </button>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Calibration constants pushed to Firebase & ESP32 controller!</span>
            </div>
          )}
        </div>

        {/* Right: Derived Calibration Equation (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">
              Active Regression Model
            </h3>
            <p className="text-xs text-eco-200/60 mb-5">Linear conversion applied to ESP32 raw voltage readings</p>

            <div className="p-4 rounded-xl bg-eco-950/80 border border-eco-500/25 space-y-4">
              <div className="text-center py-2">
                <span className="text-[11px] text-eco-300/70 block uppercase tracking-wider">Calibration Formula</span>
                <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">
                  pH = ({calculatedSlope} × V) + {calculatedOffset}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-eco-900/40">
                  <span className="text-[10px] text-eco-300/70 block">Slope (m)</span>
                  <span className="font-mono font-bold text-white text-base">{calculatedSlope}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-eco-900/40">
                  <span className="text-[10px] text-eco-300/70 block">Offset (c)</span>
                  <span className="font-mono font-bold text-white text-base">{calculatedOffset}</span>
                </div>
              </div>
            </div>

            {/* Verification Test */}
            <div className="mt-5 space-y-2">
              <div className="text-xs font-semibold text-white">Live Verification</div>
              <div className="p-3 rounded-xl bg-eco-900/20 border border-eco-500/15 flex items-center justify-between text-xs">
                <span className="text-eco-300">Measured Probe Voltage:</span>
                <span className="font-mono text-white font-bold">{liveVoltage.toFixed(3)} V</span>
              </div>
              <div className="p-3 rounded-xl bg-eco-900/20 border border-eco-500/15 flex items-center justify-between text-xs">
                <span className="text-eco-300">Calibrated Output pH:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {calculatedSlope && calculatedOffset
                    ? (calculatedSlope * liveVoltage + calculatedOffset).toFixed(2)
                    : "7.80"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-eco-500/15 text-[11px] text-eco-300/60 leading-relaxed">
            Standard Nernstian slope response is ~ -59.16 mV per pH unit at 25°C.
          </div>
        </div>
      </div>
    </div>
  );
}
