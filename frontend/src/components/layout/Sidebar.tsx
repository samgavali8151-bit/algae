"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  History,
  Bot,
  Bell,
  Sliders,
  Settings,
  HelpCircle,
  ShieldCheck,
  Zap
} from "lucide-react";

const navigationItems = [
  { name: "Live Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics & ML", href: "/analytics", icon: LineChart },
  { name: "History & Logs", href: "/history", icon: History },
  { name: "AI Copilot", href: "/copilot", icon: Bot, badge: "AI" },
  { name: "Alerts & Health", href: "/alerts", icon: Bell },
  { name: "pH Calibration", href: "/calibration", icon: Sliders },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-eco-500/20 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-eco-400/80">
            Navigation
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-r from-eco-600/30 to-eco-500/10 text-white border border-eco-400/40 shadow-sm shadow-eco-500/10"
                      : "text-eco-200/70 hover:text-white hover:bg-eco-900/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-eco-400" : "text-eco-400/60"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyanGlow-500/20 text-cyanGlow-300 border border-cyanGlow-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Microalgae Status Mini-Card */}
        <div className="p-3.5 rounded-xl glass-card border border-eco-500/25 bg-eco-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-eco-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Bioreactor Core
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Active</span>
          </div>
          <p className="text-[11px] text-eco-200/60 leading-relaxed">
            *Chlorella vulgaris* culture photoperiod operational. Aeration pump responsive.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-eco-500/15 text-xs text-eco-300/50 space-y-1">
        <div className="flex items-center justify-between">
          <span>Firmware</span>
          <span className="font-mono text-eco-300/80">ESP32 v1.0.4</span>
        </div>
        <div className="flex items-center justify-between">
          <span>CO₂ Model</span>
          <span className="font-mono text-eco-300/80">Monod/Haldane</span>
        </div>
      </div>
    </aside>
  );
}
