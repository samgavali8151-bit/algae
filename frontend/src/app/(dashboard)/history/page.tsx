"use client";

import React, { useState, useEffect } from "react";
import {
  History as LucideHistory,
  Search,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Printer
} from "lucide-react";
import { fetchHistory } from "@/lib/api";
import { formatTimestamp, formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [filterLight, setFilterLight] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function load() {
      const res = await fetchHistory("algae_pbr_01", "1h", 60);
      if (res?.data) {
        setData(res.data);
      }
    }
    load();
  }, []);

  const filtered = data.filter((item) => {
    const matchesLight = filterLight === "ALL" || item.lightLevel === filterLight;
    const matchesSearch =
      searchTerm === "" ||
      item.iso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lightLevel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLight && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LucideHistory className="w-5 h-5 text-eco-400" />
            Historical Logs & Records
          </h1>
          <p className="text-xs text-eco-200/60 mt-1">
            Time-wise sensor logs, calibration events, and daily carbon sequestration summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={printReport}
            className="px-3.5 py-1.5 rounded-xl glass-card text-xs font-semibold text-eco-300 hover:text-white flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-eco-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timestamp or condition..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-eco-950/60 border border-eco-500/20 text-xs text-white placeholder-eco-300/40 focus:outline-none focus:border-eco-400/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-eco-400" />
          <span className="text-xs text-eco-300/80">Light Filter:</span>
          <select
            value={filterLight}
            onChange={(e) => {
              setFilterLight(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-eco-950/60 border border-eco-500/20 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="DARK">DARK</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="BRIGHT">BRIGHT</option>
          </select>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-eco-500/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-eco-500/20 bg-eco-950/80 text-eco-300/80 uppercase font-semibold text-[10px] tracking-wider">
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Temp (°C)</th>
                <th className="p-3.5">Humidity (%)</th>
                <th className="p-3.5">Calibrated pH</th>
                <th className="p-3.5">LDR Value</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">CO₂ Fixed (g/day)</th>
                <th className="p-3.5">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-500/10">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-eco-900/20 transition-colors font-mono">
                    <td className="p-3.5 text-eco-200">{row.iso}</td>
                    <td className="p-3.5 text-white font-bold">{row.temperature}</td>
                    <td className="p-3.5 text-cyan-300">{row.humidity}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{row.phCalibrated}</td>
                    <td className="p-3.5 text-eco-300">{row.ldrValue}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-eco-900/60 border border-eco-500/30 text-eco-200">
                        {row.lightLevel}
                      </span>
                    </td>
                    <td className="p-3.5 text-teal-300">{row.co2CaptureGPerDay}</td>
                    <td className="p-3.5">
                      <span className="font-sans font-bold text-emerald-400">
                        {row.healthScore}/100
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-eco-300/60 font-sans">
                    No matching telemetry logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-eco-500/15 flex items-center justify-between text-xs text-eco-300/80 bg-eco-950/40">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg glass-card hover:bg-eco-900/40 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg glass-card hover:bg-eco-900/40 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
