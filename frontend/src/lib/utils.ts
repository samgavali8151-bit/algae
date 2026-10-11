import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestampSec: number): string {
  if (!timestampSec) return "N/A";
  const date = new Date(timestampSec * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestampSec: number): string {
  if (!timestampSec) return "N/A";
  const date = new Date(timestampSec * 1000);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getHealthColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 80) {
    return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
  } else if (score >= 60) {
    return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" };
  } else {
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" };
  }
}

export function getLightBadgeClass(level: string): string {
  switch (level) {
    case 'DARK':
      return 'bg-slate-800 text-slate-300 border-slate-700';
    case 'LOW':
      return 'bg-blue-900/60 text-blue-300 border-blue-700';
    case 'MEDIUM':
      return 'bg-amber-900/60 text-amber-300 border-amber-600';
    case 'BRIGHT':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 animate-pulse-subtle';
    default:
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  }
}
