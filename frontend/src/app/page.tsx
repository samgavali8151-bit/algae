"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Activity,
  Cpu,
  Database,
  CloudRain,
  Flame,
  Sun,
  ShieldCheck,
  Bot,
  Zap,
  Radio,
  FileText,
  ChevronRight,
  TrendingUp,
  Layers,
  Thermometer,
  Droplets,
  Gauge
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { fetchLiveTelemetry } from "@/lib/api";

export default function LandingPage() {
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchLiveTelemetry("algae_pbr_01");
      setLiveData(data);
    }
    load();
  }, []);

  const readings = liveData?.readings || {
    temperature: 25.4,
    humidity: 61.2,
    ldrValue: 2450,
    lightLevel: "BRIGHT",
    phCalibrated: 7.84,
    waterLevel: "HIGH",
    relayStatus: "OFF",
  };

  const metrics = liveData?.metrics || {
    healthScore: 92,
    co2CaptureGPerDay: 43.0,
    treeEquivalents: 0.72,
  };

  return (
    <div className="min-h-screen bg-eco-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* ==========================================
            HERO SECTION
           ========================================== */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-eco-600/20 via-cyanGlow-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-eco-500/30 text-xs font-semibold text-eco-300 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Bio-Engineered Carbon Sequestration Platform</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
              IoT-Based Carbon Capture & Recovery System Using{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Microalgae
              </span>
            </h1>

            {/* Tagline */}
            <p className="mt-6 text-base sm:text-xl text-eco-200/70 max-w-3xl mx-auto leading-relaxed">
              A closed-loop automated photobioreactor that maximizes photosynthesis kinetics with ESP32 telemetry, real-time Firebase cloud actuation, and predictive AI biological models.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Launch Live Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-card hover:bg-eco-900/40 text-eco-200 font-semibold text-sm border border-eco-500/30 transition-all"
              >
                Explore Architecture
              </a>
            </div>

            {/* Live Stats Strip */}
            <div className="mt-16 max-w-4xl mx-auto glass-panel rounded-2xl p-4 sm:p-6 border border-eco-500/25">
              <div className="flex items-center justify-between mb-3 text-xs text-eco-300">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Live Edge Telemetry Stream (ESP32)
                </span>
                <span className="font-mono text-eco-400/80">algae_pbr_01</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15">
                  <div className="text-[11px] text-eco-300/70">Temperature</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {readings.temperature.toFixed(1)} °C
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15">
                  <div className="text-[11px] text-eco-300/70">Calibrated pH</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    {readings.phCalibrated.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15">
                  <div className="text-[11px] text-eco-300/70">Light Condition</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                    {readings.lightLevel}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-eco-950/60 border border-eco-500/15">
                  <div className="text-[11px] text-eco-300/70">CO₂ Capture Rate</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                    {metrics.co2CaptureGPerDay.toFixed(1)} g/day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            PROBLEM & SOLUTION
           ========================================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-eco-500/15 bg-eco-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-eco-400 mb-2">Climate Imperative</h2>
              <h3 className="text-3xl font-extrabold text-white">Why Microalgae Outperforms Terrestrial Plants</h3>
              <p className="mt-4 text-sm text-eco-200/70">
                Microalgae (such as *Chlorella vulgaris*) capture atmospheric carbon dioxide up to <strong>10 to 50 times more efficiently</strong> than terrestrial forests due to their unicellular photosynthetic structure and year-round continuous growth cycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel rounded-2xl p-6 border border-eco-500/20">
                <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mb-5">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">The Atmospheric Crisis</h4>
                <p className="text-xs text-eco-200/70 leading-relaxed">
                  Over 37 billion metric tonnes of anthropogenic CO₂ are emitted annually, driving rapid ocean acidification and irreversible climatic shifts that demand immediate scalable biorecovery.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 border border-eco-500/20">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">1.83x Bio-Fixation Ratio</h4>
                <p className="text-xs text-eco-200/70 leading-relaxed">
                  Every 1 kg of dry microalgae biomass produced sequesters approximately 1.83 kg of atmospheric CO₂ via the Calvin cycle, simultaneously producing dense proteins and biofuel precursors.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6 border border-eco-500/20">
                <div className="w-12 h-12 rounded-xl bg-cyanGlow-500/15 text-cyanGlow-300 flex items-center justify-center mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Autonomous Environmental Loop</h4>
                <p className="text-xs text-eco-200/70 leading-relaxed">
                  Algal cultures crash if pH spikes or illumination exceeds saturation. Our IoT and AI loop maintains optical density, temperature, and CO₂ saturation in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            HOW IT WORKS STEP-BY-STEP
           ========================================== */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-eco-400 mb-2">End-to-End Pipeline</h2>
              <h3 className="text-3xl font-extrabold text-white">How the Closed-Loop System Operates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { step: "01", title: "Sensors", desc: "DHT11, LDR, pH probe, and water level monitor culture metrics", icon: Thermometer },
                { step: "02", title: "ESP32", desc: "12-bit ADC samples every 2s with WiFi telemetry transmission", icon: Cpu },
                { step: "03", title: "Firebase", desc: "Realtime Database & Firestore sync live reads and commands", icon: Database },
                { step: "04", title: "AI Analytics", desc: "FastAPI calculates Monod kinetics, anomalies & forecasts", icon: Bot },
                { step: "05", title: "Dashboard", desc: "Next.js UI renders live gauges, calibration, and charts", icon: Activity },
                { step: "06", title: "Actuator", desc: "Relay (GPIO 25) controls circulation pump to regulate CO₂", icon: Zap },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="glass-card rounded-2xl p-4 border border-eco-500/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-eco-400">{item.step}</span>
                        <div className="p-1.5 rounded-lg bg-eco-500/10 text-eco-300">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-[11px] text-eco-200/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==========================================
            HARDWARE SHOWCASE
           ========================================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-eco-900/20 border-t border-eco-500/15">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-eco-400 mb-2">Hardware Specifications</h2>
              <h3 className="text-3xl font-extrabold text-white">Full Physical Bill of Materials</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "ESP32 NodeMCU", pin: "Main Controller", desc: "Dual-core Xtensa 32-bit MCU with integrated 2.4GHz WiFi & Bluetooth. 12-bit ADC (0-4095)." },
                { title: "DHT11 Digital Sensor", pin: "GPIO 4", desc: "Captures ambient ambient temperature (0-50°C) and relative humidity (20-90% RH)." },
                { title: "LDR Light Intensity", pin: "GPIO 34", desc: "Light-dependent resistor measuring photon flux density; categorised as DARK, LOW, MEDIUM, BRIGHT." },
                { title: "Analog pH Sensor Probe", pin: "GPIO 32", desc: "Glass electrode measuring hydronium concentration (0-3.3V) with multi-point linear calibration." },
                { title: "Water Level Float Sensor", pin: "GPIO 27", desc: "Digital switch with internal pull-up resistor (INPUT_PULLUP) ensuring culture medium stays topped." },
                { title: "Relay Module (Active LOW)", pin: "GPIO 25", desc: "Controls the aeration pump. Active LOW (LOW=ON, HIGH=OFF) to maintain safety upon power-up." },
              ].map((card, idx) => (
                <div key={idx} className="glass-panel rounded-2xl p-5 border border-eco-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{card.title}</h4>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-eco-500/20 text-eco-300 border border-eco-500/30">
                      {card.pin}
                    </span>
                  </div>
                  <p className="text-xs text-eco-200/70 leading-relaxed mt-2">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            CTA BANNER
           ========================================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border border-eco-400/30 relative z-10 glow-emerald">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Monitor Your Microalgae Photobioreactor?
            </h3>
            <p className="mt-4 text-sm sm:text-base text-eco-200/80 max-w-2xl mx-auto">
              Inspect real-time telemetry, toggle the circulation pump, run the pH calibration wizard, or converse with the AI Copilot.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl transition-all"
              >
                Launch Dashboard Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-eco-500/15 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-eco-300/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>IoT-Based Carbon Capture and Recovery System Using Microalgae © 2026</div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-eco-300 transition-colors">Dashboard</Link>
            <Link href="/analytics" className="hover:text-eco-300 transition-colors">Analytics</Link>
            <Link href="/copilot" className="hover:text-eco-300 transition-colors">AI Copilot</Link>
            <Link href="/calibration" className="hover:text-eco-300 transition-colors">Calibration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
