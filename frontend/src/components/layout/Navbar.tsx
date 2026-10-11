"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Activity, Sun, Moon, Wifi, Cpu, Layers } from "lucide-react";

interface NavbarProps {
  isOnline?: boolean;
}

export function Navbar({ isOnline = true }: NavbarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(isDark);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      setTheme("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-eco-500/20 px-4 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-eco-600 via-eco-400 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-eco-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-eco-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              MICROALGAE <span className="text-eco-400">PBR</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-eco-500/15 text-eco-300 border border-eco-500/30">IoT v1.0</span>
            </div>
            <p className="text-[11px] text-eco-300/60 hidden sm:block">Carbon Capture & Photobioreactor AI</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Hardware Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium glass-card border border-eco-500/30">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400 opacity-75' : 'bg-red-400 opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-eco-200 hidden md:inline">ESP32 Device:</span>
          <span className="text-white font-mono font-semibold">algae_pbr_01</span>
          <Wifi className="w-3.5 h-3.5 text-eco-400 ml-1" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg glass-card hover:border-eco-400/50 text-eco-300 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-600" />}
        </button>

        <Link
          href="/dashboard"
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-eco-600 to-eco-500 hover:from-eco-500 hover:to-eco-400 text-white text-xs font-semibold shadow-md shadow-eco-500/20 transition-all flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
