"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  statusBadge: string;
  statusColor?: "emerald" | "amber" | "cyan" | "red" | "slate";
  subDetails?: string;
  diagnostics?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  statusBadge,
  statusColor = "emerald",
  subDetails,
  diagnostics,
}: MetricCardProps) {
  const badgeClasses = {
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    slate: "bg-slate-700/30 text-slate-300 border-slate-600/40",
  }[statusColor];

  const iconColor = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    red: "text-red-400 bg-red-500/10",
    slate: "text-slate-400 bg-slate-500/10",
  }[statusColor];

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-eco-300/80">{title}</span>
          <div className={`p-2 rounded-xl ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1 mt-1">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {typeof value === "number" ? value.toFixed(1) : value}
          </span>
          {unit && <span className="text-xs font-medium text-eco-300/70">{unit}</span>}
        </div>

        {subDetails && (
          <p className="text-xs text-eco-200/60 mt-1">{subDetails}</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-eco-500/15 flex items-center justify-between text-[11px]">
        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${badgeClasses}`}>
          {statusBadge}
        </span>
        {diagnostics && (
          <span className="font-mono text-eco-400/60 text-[10px] truncate max-w-[140px]">
            {diagnostics}
          </span>
        )}
      </div>
    </div>
  );
}
