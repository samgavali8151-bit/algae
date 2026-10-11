"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Sliders,
  TrendingUp,
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  Info
} from "lucide-react";
import { sendChatMessage, fetchLiveTelemetry } from "@/lib/api";
import { ChatMessage } from "@/types";

export default function AICopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "👋 Welcome! I am your **AI Bioreactor Copilot**, continuously analyzing the *Chlorella vulgaris* culture photoperiod, pH equilibrium, and carbon fixation kinetics.\n\nHow can I assist your photobioreactor run today?",
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Digital Twin Simulator State
  const [simTemp, setSimTemp] = useState(25.0);
  const [simPh, setSimPh] = useState(7.8);
  const [simLdr, setSimLdr] = useState(2400);

  // Biological What-If Model Calculation
  const iRatio = simLdr / 2200.0;
  const fLight = Math.max(0.0, Math.min(1.0, iRatio * Math.exp(1.0 - iRatio)));
  const fTemp = Math.max(0.0, Math.min(1.0, Math.exp(-0.5 * Math.pow((simTemp - 25.0) / 4.5, 2))));
  const fPh = Math.max(0.0, Math.min(1.0, Math.exp(-0.5 * Math.pow((simPh - 7.8) / 0.7, 2))));
  const simMu = (1.25 * fLight * fTemp * fPh).toFixed(3);
  const simCo2Day = (parseFloat(simMu) * 1.25 * 20.0 * 1.83).toFixed(1);
  const simHealth = Math.min(100, Math.round((fLight * 0.35 + fTemp * 0.35 + fPh * 0.3) * 100));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (msgText?: string) => {
    const text = msgText || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!msgText) setInputMessage("");
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text, "algae_pbr_01");
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions = [
    "Is my culture healthy right now?",
    "Why does the pH rise during the day?",
    "How much CO₂ did we capture today?",
    "Should I turn on the pump now?"
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel rounded-2xl p-5 border border-eco-500/20">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Photobioreactor AI Copilot & Digital Twin
        </h1>
        <p className="text-xs text-eco-200/60 mt-1">
          Grounded LLM dialogue engine coupled with in-silico what-if growth kinetics simulation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col h-[650px] border border-eco-500/20">
          <div className="flex items-center justify-between pb-3 border-b border-eco-500/15 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">Live Bioreactor Specialization Model</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-eco-500/20 text-eco-300 border border-eco-500/30">
              Grounded Telemetry
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-eco-600 text-white shadow-md shadow-eco-600/20"
                      : "bg-eco-900/60 text-eco-100 border border-eco-500/25"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-eco-900/40 rounded-2xl p-3 text-xs text-eco-300/80 flex items-center space-x-1.5 border border-eco-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Analyzing kinetics & telemetry...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="pt-3 pb-2 flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-eco-950/80 text-eco-300 hover:text-white border border-eco-500/20 hover:border-eco-400/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask the AI copilot about your algae culture..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-eco-950/80 border border-eco-500/20 text-xs text-white placeholder-eco-300/40 focus:outline-none focus:border-cyan-400/60"
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-eco-600 to-cyanGlow-500 hover:from-eco-500 hover:to-cyanGlow-400 text-white transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Digital Twin What-If Simulator (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Digital Twin / What-If Simulator
              </h3>
            </div>
            <p className="text-xs text-eco-200/60 mb-5">
              Simulate prospective environmental changes and forecast photosynthetic yields before altering physical bioreactor parameters.
            </p>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-eco-300">Culture Temperature</span>
                  <span className="font-mono font-bold text-white">{simTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="0.5"
                  value={simTemp}
                  onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-eco-300">Culture pH</span>
                  <span className="font-mono font-bold text-white">{simPh}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={simPh}
                  onChange={(e) => setSimPh(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-eco-300">Photon Flux (LDR ADC)</span>
                  <span className="font-mono font-bold text-white">{simLdr} ADC</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3800"
                  step="50"
                  value={simLdr}
                  onChange={(e) => setSimLdr(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated Outcomes */}
            <div className="mt-6 p-4 rounded-xl bg-eco-950/80 border border-eco-500/25 space-y-3">
              <div className="text-xs font-semibold text-eco-300 uppercase tracking-wider">
                Predicted Yield Under What-If State
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-eco-900/40">
                  <span className="text-[10px] text-eco-300/70 block">Growth Rate μ</span>
                  <span className="text-lg font-bold font-mono text-cyan-300">{simMu} day⁻¹</span>
                </div>

                <div className="p-2.5 rounded-lg bg-eco-900/40">
                  <span className="text-[10px] text-eco-300/70 block">CO₂ Capture Rate</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{simCo2Day} g/day</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-eco-300">Projected Health Score:</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  {simHealth} / 100
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-eco-500/15 text-[11px] text-eco-300/60 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-eco-400 shrink-0 mt-0.5" />
            <span>
              Kinetic computations utilize Steele photoinhibition curves and cardinal Arrhenius thermal boundaries.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
