"use client";

import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, off } from "firebase/database";
import { SensorReadings, ControlState } from "@/types";

/**
 * Custom hook that subscribes to the Firebase Realtime Database
 * path `/devices/{deviceId}/live` and returns a live-updating
 * SensorReadings object. Uses `onValue` for sub-second streaming.
 */
export function useFirebaseLiveTelemetry(deviceId: string = "algae_pbr_01") {
  const [readings, setReadings] = useState<SensorReadings | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!database) {
      setError("Firebase not initialized");
      return;
    }

    const liveRef = ref(database, `devices/${deviceId}/live`);

    const unsubscribe = onValue(
      liveRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setReadings(data as SensorReadings);
          setIsOnline(data.online !== false);
          setError(null);
        }
      },
      (err) => {
        console.error("Firebase RTDB listener error:", err);
        setError(err.message);
      }
    );

    return () => {
      off(liveRef);
    };
  }, [deviceId]);

  return { readings, isOnline, error };
}

/**
 * Custom hook that subscribes to `/devices/{deviceId}/control`
 * to track current relay command and operating mode.
 */
export function useFirebaseControl(deviceId: string = "algae_pbr_01") {
  const [control, setControl] = useState<ControlState>({
    relayCommand: "OFF",
    mode: "manual",
  });

  useEffect(() => {
    if (!database) return;

    const controlRef = ref(database, `devices/${deviceId}/control`);

    const unsubscribe = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setControl(data as ControlState);
      }
    });

    return () => {
      off(controlRef);
    };
  }, [deviceId]);

  /**
   * Write a new relay command and mode directly to Firebase RTDB.
   * The ESP32 firmware polls this path every 3 seconds.
   */
  const sendCommand = async (
    relayCommand: "ON" | "OFF" | "AUTO",
    mode: "manual" | "auto" | "ai"
  ) => {
    if (!database) return;
    const controlRef = ref(database, `devices/${deviceId}/control`);
    await set(controlRef, {
      relayCommand,
      mode,
      updatedBy: "web_dashboard",
      updatedAt: Math.floor(Date.now() / 1000),
    });
  };

  return { control, sendCommand };
}
