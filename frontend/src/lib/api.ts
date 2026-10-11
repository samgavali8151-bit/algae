import { SensorReadings, ControlState, CalibrationPoint, KineticsMetrics } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Fallback telemetry generator for zero-friction standalone preview
export function getMockTelemetry(): { readings: SensorReadings; metrics: KineticsMetrics } {
  const t = Math.floor(Date.now() / 1000);
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour <= 18;
  const ldrVal = isDay ? 2450 : 250;
  
  return {
    readings: {
      temperature: isDay ? 25.4 : 22.8,
      humidity: isDay ? 61.2 : 74.5,
      ldrValue: ldrVal,
      lightLevel: isDay ? 'BRIGHT' : 'DARK',
      phRaw: 2650,
      phVoltage: 2.13,
      phCalibrated: isDay ? 7.84 : 7.25,
      waterLevel: 'HIGH',
      relayStatus: 'OFF',
      timestamp: t,
      online: true
    },
    metrics: {
      healthScore: 92,
      specificGrowthRateMu: 0.94,
      growthFactors: {
        f_light: 0.95,
        f_temp: 0.98,
        f_ph: 0.96,
        f_water: 1.0
      },
      biomassDensityGPerL: 1.25,
      biomassGrowthGPerDay: 23.5,
      co2CaptureGPerDay: 43.0,
      co2CaptureKgPerDay: 0.043,
      co2ProjectedKgPerYear: 15.69,
      treeEquivalents: 0.72,
      carKmOffset: 358.3,
      carbonCreditUsdYear: 0.55
    }
  };
}

export async function fetchLiveTelemetry(deviceId: string = "algae_pbr_01") {
  try {
    const res = await fetch(`${BACKEND_URL}/api/live/${deviceId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    return { deviceId, ...getMockTelemetry() };
  }
}

export async function fetchHistory(deviceId: string = "algae_pbr_01", interval: string = "1h", limit: number = 30) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/history?device_id=${deviceId}&interval=${interval}&limit=${limit}`, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    // Generate mock series
    const mockData = [];
    const now = Math.floor(Date.now() / 1000);
    for (let i = limit; i >= 0; i--) {
      const timeSec = now - (i * 3600);
      mockData.push({
        timestamp: timeSec,
        iso: new Date(timeSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: parseFloat((23 + Math.sin(i / 3) * 3).toFixed(1)),
        humidity: parseFloat((65 + Math.cos(i / 3) * 8).toFixed(1)),
        phCalibrated: parseFloat((7.4 + Math.sin(i / 4) * 0.5).toFixed(2)),
        ldrValue: Math.max(200, Math.floor(1800 + Math.sin(i / 3) * 1600)),
        lightLevel: i % 2 === 0 ? 'BRIGHT' : 'MEDIUM',
        co2CaptureGPerDay: parseFloat((35 + Math.sin(i / 3) * 12).toFixed(1)),
        healthScore: Math.floor(80 + Math.random() * 15)
      });
    }
    return { count: mockData.length, data: mockData };
  }
}

export async function sendRelayCommand(deviceId: string, command: "ON" | "OFF" | "AUTO", mode: "manual" | "auto" | "ai") {
  try {
    const res = await fetch(`${BACKEND_URL}/api/control/relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, relayCommand: command, mode })
    });
    return await res.json();
  } catch (err) {
    return { status: "simulated", message: `Command ${command} applied in local preview` };
  }
}

export async function submitCalibration(deviceId: string, points: CalibrationPoint[]) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/calibration/ph`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, points })
    });
    return await res.json();
  } catch (err) {
    return { status: "simulated", calibration: { slope: -5.7, offset: 21.34 } };
  }
}

export async function sendChatMessage(message: string, deviceId: string = "algae_pbr_01") {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, deviceId })
    });
    return await res.json();
  } catch (err) {
    return {
      reply: `🌿 **Microalgae Specialist (Demo Mode)**\n\nCurrent culture pH is stable at 7.84 and temperature is 25.4°C. Photosynthetic carbon fixation is operating at ~43 g CO₂/day. When illumination increases, remember to keep aeration active to sustain dissolved inorganic carbon levels.`,
      provider: "simulated_copilot"
    };
  }
}

export async function fetchAnomalies(deviceId: string = "algae_pbr_01") {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/anomalies?device_id=${deviceId}`);
    return await res.json();
  } catch (err) {
    return { status: "HEALTHY", count: 0, anomalies: [] };
  }
}

export async function fetchForecast(deviceId: string = "algae_pbr_01") {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/forecast?device_id=${deviceId}`);
    return await res.json();
  } catch (err) {
    const mock = [];
    const now = Math.floor(Date.now() / 1000);
    for (let h = 1; h <= 24; h++) {
      mock.push({
        hourAhead: h,
        timestamp: now + (h * 3600),
        predictedTemperature: parseFloat((24.0 + Math.sin(h / 3) * 3).toFixed(1)),
        predictedPh: parseFloat((7.6 + Math.sin(h / 4) * 0.4).toFixed(2)),
        predictedLdrValue: Math.max(100, Math.floor(1600 + Math.sin(h / 3) * 1500)),
        predictedLightLevel: h <= 12 ? 'BRIGHT' : 'DARK',
        confidence: parseFloat((0.95 - h * 0.015).toFixed(2)),
        alertRisk: 'NORMAL'
      });
    }
    return { horizon: "24h", forecast: mock };
  }
}
