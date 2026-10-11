"""
=============================================================================
IoT-BASED CARBON CAPTURE AND RECOVERY SYSTEM USING MICROALGAE
Telemetry Mock Data Simulator (Python)
=============================================================================
Simulates realistic biological photobioreactor environmental dynamics:
- Diurnal solar/grow light cycles (LDR raw 0-4095 and classification)
- Photosynthetic carbon fixation pH shifts (pH rises as CO2 is converted to biomass)
- Ambient temperature variations & humidity fluctuation
- Water level fluctuations and circulation pump responses
- Pushes directly to Firebase RTDB via REST API or Firebase Admin SDK
"""

import time
import math
import random
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

DEVICE_ID = os.getenv("DEVICE_ID", "algae_pbr_01")
FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "https://microalgae-carbon-capture-default-rtdb.firebaseio.com").rstrip("/")
FIREBASE_AUTH_SECRET = os.getenv("FIREBASE_AUTH_SECRET", "")

print("==================================================")
print("  MICROALGAE IoT SIMULATOR RUNNING (PYTHON)")
print(f"  Target Device: {DEVICE_ID}")
print(f"  RTDB Endpoint: {FIREBASE_DATABASE_URL}")
print("==================================================")

step = 0
current_relay_state = False
relay_mode = "auto"
ph_slope = -5.70
ph_offset = 21.34

while True:
    try:
        step += 1
        t = time.time()
        
        # 1. Simulate diurnal solar cycle (period = 120 steps ~ 4 minutes for demo)
        day_progress = (step % 120) / 120.0
        solar_intensity = max(0.0, math.sin(day_progress * 2 * math.pi))
        
        # LDR ADC (0-4095)
        # Night: 100-280 (DARK)
        # Dawn/Dusk: 400-950 (LOW)
        # Ambient/Cloud: 1200-2100 (MEDIUM)
        # Peak grow light/sun: 2400-3800 (BRIGHT)
        base_ldr = 150 + int(solar_intensity * 3200) + random.randint(-40, 40)
        ldr_value = max(50, min(4095, base_ldr))
        
        if ldr_value <= 300:
            light_level = "DARK"
        elif ldr_value <= 1000:
            light_level = "LOW"
        elif ldr_value <= 2200:
            light_level = "MEDIUM"
        else:
            light_level = "BRIGHT"

        # 2. Temperature (22°C night, up to 29°C peak light)
        temperature = round(22.0 + (solar_intensity * 6.5) + random.uniform(-0.3, 0.3), 1)
        
        # 3. Humidity (inverse of temperature)
        humidity = round(72.0 - (solar_intensity * 14.0) + random.uniform(-1.0, 1.0), 1)

        # 4. pH dynamics:
        # Microalgae consume dissolved CO2 / carbonic acid during light, increasing pH (7.2 -> 8.5)
        # When pump runs (aeration), fresh CO2 dissolves, buffering pH down
        ph_calibrated = 7.4 + (solar_intensity * 1.1) + random.uniform(-0.08, 0.08)
        if current_relay_state:
            ph_calibrated -= 0.35  # Pump aeration replenishes dissolved CO2, decreasing pH
        ph_calibrated = round(max(6.0, min(9.5, ph_calibrated)), 2)
        
        # Calculate reverse voltage and raw ADC for sensor fidelity
        # ph = slope * voltage + offset => voltage = (ph - offset) / slope
        ph_voltage = round((ph_calibrated - ph_offset) / ph_slope, 3)
        ph_raw = int((ph_voltage / 3.3) * 4095)
        ph_raw = max(0, min(4095, ph_raw))

        # 5. Water Level
        # 95% chance HIGH, 5% occasional low water alert
        water_level = "HIGH" if (step % 50 != 0) else "LOW"

        # 6. Fetch remote control status
        try:
            ctrl_url = f"{FIREBASE_DATABASE_URL}/devices/{DEVICE_ID}/control.json"
            if FIREBASE_AUTH_SECRET:
                ctrl_url += f"?auth={FIREBASE_AUTH_SECRET}"
            resp = requests.get(ctrl_url, timeout=2)
            if resp.status_code == 200 and resp.json():
                ctrl_data = resp.json()
                relay_cmd = ctrl_data.get("relayCommand", "AUTO")
                relay_mode = ctrl_data.get("mode", "auto")
                
                if relay_mode == "auto" or relay_mode == "ai":
                    if water_level == "LOW" or ph_calibrated > 8.4:
                        current_relay_state = True
                    elif ph_calibrated < 7.2:
                        current_relay_state = False
                elif relay_cmd == "ON":
                    current_relay_state = True
                elif relay_cmd == "OFF":
                    current_relay_state = False
        except Exception:
            # Fallback auto behavior if disconnected
            if ph_calibrated > 8.3:
                current_relay_state = True
            elif ph_calibrated < 7.3:
                current_relay_state = False

        relay_status_str = "ON" if current_relay_state else "OFF"

        payload = {
            "temperature": temperature,
            "humidity": humidity,
            "ldrValue": ldr_value,
            "lightLevel": light_level,
            "phRaw": ph_raw,
            "phVoltage": ph_voltage,
            "phCalibrated": ph_calibrated,
            "waterLevel": water_level,
            "relayStatus": relay_status_str,
            "timestamp": int(t),
            "online": True
        }

        print(f"[{time.strftime('%H:%M:%S')}] Step {step:04d} | Temp: {temperature}°C | Hum: {humidity}% | Light: {light_level} ({ldr_value}) | pH: {ph_calibrated} ({ph_voltage}V) | Water: {water_level} | Pump: {relay_status_str}")

        # Push to Firebase RTDB via REST
        try:
            live_url = f"{FIREBASE_DATABASE_URL}/devices/{DEVICE_ID}/live.json"
            if FIREBASE_AUTH_SECRET:
                live_url += f"?auth={FIREBASE_AUTH_SECRET}"
            requests.put(live_url, json=payload, timeout=2)
        except Exception as err:
            pass  # Runs smoothly in disconnected demo mode

    except Exception as e:
        print(f"Error in simulator loop: {e}")

    time.sleep(2.0)
