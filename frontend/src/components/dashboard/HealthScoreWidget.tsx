"use client";

import React from "react";
import { TreePine, Car, DollarSign, Activity, Leaf, TrendingUp } from "lucide-react";
import { KineticsMetrics } from "@/types";
import { getHealthColor } from "@/lib/utils";

interface HealthScoreWidgetProps {
  metrics: KineticsMetrics;
}

export function HealthScoreWidget({ metrics }: HealthScoreWidgetProps) {
  const healthColors = getHealthColor(metrics.healthScore);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-eco-500/20 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-eco-500/15 text-eco-400">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Culture Health & Carbon Fixation</h3>
              <p className="text-xs text-eco-200/60 mt-0.5">Biological kinetics modeling (Chlorella vulgaris)</p>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${healthColors.bg} ${healthColors.text} ${healthColors.border}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>Health {metrics.healthScore}/100</span>
          </div>
        </div>

        {/* Primary CO2 Capture Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-eco-950/80 via-eco-900/40 to-cyan-950/60 border border-eco-500/25 mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-eco-300/80">Daily CO₂ Sequestration Rate</span>
            <span className="text-[10px] font-mono text-cyan-300">Stoichiometry: 1.83x Biomass</span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {metrics.co2CaptureGPerDay.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-eco-400">g CO₂ / day</span>
          </div>
          <p className="text-xs text-eco-200/60 mt-1">
            Projected annual fixation: <strong className="text-white font-mono">{metrics.co2ProjectedKgPerYear.toFixed(2)} kg CO₂/year</strong>
          </p>
        </div>

        {/* Equivalents Strip */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl glass-card text-center">
            <TreePine className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
            <div className="text-base font-bold font-mono text-white">
              {metrics.treeEquivalents.toFixed(2)}
            </div>
            <div className="text-[10px] text-eco-200/60">Trees Equivalent</div>
          </div>

          <div className="p-3 rounded-xl glass-card text-center">
            <Car className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
            <div className="text-base font-bold font-mono text-white">
              {metrics.carKmOffset.toFixed(1)}
            </div>
            <div className="text-[10px] text-eco-200/60">km Car Offset / day</div>
          </div>

          <div className="p-3 rounded-xl glass-card text-center">
            <DollarSign className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <div className="text-base font-bold font-mono text-white">
              ${metrics.carbonCreditUsdYear.toFixed(2)}
            </div>
            <div className="text-[10px] text-eco-200/60">Carbon Credit / yr</div>
          </div>
        </div>
      </div>

      {/* Kinetic factors breakdown */}
      <div className="mt-4 pt-3 border-t border-eco-500/15">
        <div className="text-[11px] font-semibold text-eco-300 mb-2 flex items-center justify-between">
          <span>Photosynthetic Limiting Factors</span>
          <span className="text-eco-400 font-mono text-[10px]">μ = {metrics.specificGrowthRateMu} day⁻¹</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="p-1.5 rounded-lg bg-eco-950/40 border border-eco-500/15">
            <div className="text-eco-300/70">Light f(I)</div>
            <div className="font-mono font-bold text-white mt-0.5">{metrics.growthFactors.f_light}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-eco-950/40 border border-eco-500/15">
            <div className="text-eco-300/70">Temp f(T)</div>
            <div className="font-mono font-bold text-white mt-0.5">{metrics.growthFactors.f_temp}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-eco-950/40 border border-eco-500/15">
            <div className="text-eco-300/70">pH f(pH)</div>
            <div className="font-mono font-bold text-white mt-0.5">{metrics.growthFactors.f_ph}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-eco-950/40 border border-eco-500/15">
            <div className="text-eco-300/70">Fluid f(H2O)</div>
            <div className="font-mono font-bold text-white mt-0.5">{metrics.growthFactors.f_water}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
