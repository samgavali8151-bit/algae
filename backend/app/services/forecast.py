import time
import math
from typing import List, Dict, Any

class PredictiveForecaster:
    def generate_24h_forecast(self, current_telemetry: Dict[str, Any]) -> List[Dict[str, Any]]:
        forecasts = []
        now = int(time.time())
        current_temp = current_telemetry.get("temperature", 25.0)
        current_ph = current_telemetry.get("phCalibrated", 7.6)

        # Generate hourly predictions for the next 24 hours
        for hour in range(1, 25):
            future_timestamp = now + (hour * 3600)
            
            # Predict daylight phase based on solar diurnal progression
            # Assume 12-hour photoperiod
            solar_phase = math.sin((hour / 24.0) * 2 * math.pi)
            predicted_light = int(max(150, 1500 + (solar_phase * 1800)))
            
            light_label = "DARK"
            if predicted_light <= 300:
                light_label = "DARK"
            elif predicted_light <= 1000:
                light_label = "LOW"
            elif predicted_light <= 2200:
                light_label = "MEDIUM"
            else:
                light_label = "BRIGHT"

            # Predict temperature (warmer during day, cooler at night)
            pred_temp = round(current_temp + (solar_phase * 3.2), 1)

            # Predict pH (rising during photosynthesis as dissolved carbon is assimilated, lowering at night)
            pred_ph = round(current_ph + (solar_phase * 0.65), 2)
            pred_ph = max(6.5, min(9.0, pred_ph))

            # Confidence interval
            confidence = round(max(0.65, 0.98 - (hour * 0.012)), 2)

            forecasts.append({
                "hourAhead": hour,
                "timestamp": future_timestamp,
                "predictedTemperature": pred_temp,
                "predictedPh": pred_ph,
                "predictedLdrValue": predicted_light,
                "predictedLightLevel": light_label,
                "confidence": confidence,
                "alertRisk": "ELEVATED" if (pred_ph > 8.6 or pred_temp > 32.0) else "NORMAL"
            })

        return forecasts

forecaster = PredictiveForecaster()
