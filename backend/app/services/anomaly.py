import time
import numpy as np
from typing import List, Dict, Any

class AnomalyDetector:
    def __init__(self):
        self.history_window = []

    def check_telemetry(self, current: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []
        now = int(time.time())

        temp = current.get("temperature", 25.0)
        ph = current.get("phCalibrated", 7.5)
        ldr = current.get("ldrValue", 1500)
        water = current.get("waterLevel", "HIGH")

        # 1. Temperature limits
        if temp < 15.0 or temp > 38.0:
            anomalies.append({
                "id": f"anom-temp-{now}",
                "type": "TEMPERATURE_EXTREME",
                "parameter": "temperature",
                "severity": "CRITICAL" if (temp < 10 or temp > 42) else "WARNING",
                "value": temp,
                "threshold": "18°C - 35°C",
                "message": f"Culture temperature {temp}°C is outside the safe biological window.",
                "recommendation": "Check cooling/heating system or sensor thermal contact.",
                "timestamp": now
            })

        # 2. pH limits
        if ph < 6.2 or ph > 9.2:
            anomalies.append({
                "id": f"anom-ph-{now}",
                "type": "PH_OUT_OF_BOUNDS",
                "parameter": "ph",
                "severity": "CRITICAL" if (ph < 5.5 or ph > 9.8) else "WARNING",
                "value": ph,
                "threshold": "6.5 - 8.8",
                "message": f"pH level {ph} threatens microalgae viability and carbon uptake.",
                "recommendation": "Activate aeration pump immediately to inject CO2 or check buffer.",
                "timestamp": now
            })

        # 3. Water level sensor alert
        if water == "LOW":
            anomalies.append({
                "id": f"anom-water-{now}",
                "type": "WATER_LEVEL_DEPLETED",
                "parameter": "waterLevel",
                "severity": "CRITICAL",
                "value": "LOW",
                "threshold": "HIGH",
                "message": "Photobioreactor fluid level is critically low. Risk of culture desiccation.",
                "recommendation": "Replenish fresh nutrient growth medium into the reactor vessel.",
                "timestamp": now
            })

        # 4. Sensor wiring / stuck detection
        if ldr == 0 or ldr >= 4095:
            anomalies.append({
                "id": f"anom-ldr-stuck-{now}",
                "type": "SENSOR_PIN_FAULT",
                "parameter": "ldrValue",
                "severity": "INFO",
                "value": ldr,
                "threshold": "1 - 4094",
                "message": "LDR ADC reading is pinned at boundary. Possible disconnected pin or saturation.",
                "recommendation": "Inspect GPIO 34 wiring and pull-down resistor.",
                "timestamp": now
            })

        return anomalies

anomaly_detector = AnomalyDetector()
