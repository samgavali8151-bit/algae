"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { fetchLiveTelemetry } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    async function check() {
      const data = await fetchLiveTelemetry("algae_pbr_01");
      if (data?.readings) {
        setIsOnline(data.readings.online !== false);
      }
    }
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-eco-950 flex flex-col">
      <Navbar isOnline={isOnline} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
