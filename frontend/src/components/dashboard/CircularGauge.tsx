"use client";

import React from "react";

interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  optimalMin: number;
  optimalMax: number;
  color?: string;
}

export function CircularGauge({
  value,
  min,
  max,
  unit,
  label,
  optimalMin,
  optimalMax,
  color = "#10b981",
}: CircularGaugeProps) {
  const radius = 48;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  
  // Angle range: 240 degrees (leaving 120 open at bottom)
  const clampedVal = Math.max(min, Math.min(max, value));
  const percentage = (clampedVal - min) / (max - min);
  const strokeDashoffset = circumference - percentage * (circumference * 0.75);

  const isOptimal = value >= optimalMin && value <= optimalMax;
  const displayColor = isOptimal ? color : (value < optimalMin ? "#38bdf8" : "#f59e0b");

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Optimal Zone Subtle Glow */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={displayColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${displayColor}60)` }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {value.toFixed(1)}
          </span>
          <span className="text-[11px] font-medium text-eco-300/80 -mt-0.5">{unit}</span>
        </div>
      </div>

      <div className="mt-1 text-center">
        <div className="text-xs font-semibold text-white tracking-wide">{label}</div>
        <div className="text-[10px] text-eco-200/60 mt-0.5">
          Optimal: {optimalMin} - {optimalMax} {unit}
        </div>
        <span
          className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
            isOptimal
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
          }`}
        >
          {isOptimal ? "OPTIMAL" : "OUT OF RANGE"}
        </span>
      </div>
    </div>
  );
}
