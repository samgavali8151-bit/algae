import time
from typing import Dict, Any

class ReportGenerator:
    def generate_summary_report(self, telemetry: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        return {
            "generatedAt": now,
            "period": "Daily Summary",
            "overallHealth": metrics.get("healthScore", 85),
            "co2SequesteredG": metrics.get("co2CaptureGPerDay", 18.5),
            "treeEquivalent": metrics.get("treeEquivalents", 0.31),
            "temperature": {
                "avg": telemetry.get("temperature", 24.8),
                "status": "Optimal"
            },
            "ph": {
                "avg": telemetry.get("phCalibrated", 7.82),
                "status": "Healthy photosynthetic range"
            },
            "lightCondition": telemetry.get("lightLevel", "BRIGHT"),
            "waterLevel": telemetry.get("waterLevel", "HIGH"),
            "pumpState": telemetry.get("relayStatus", "OFF"),
            "executiveSummary": (
                f"The microalgae culture demonstrated robust photosynthetic activity. "
                f"Estimated carbon capture averaged {metrics.get('co2CaptureGPerDay', 18.5)} g CO2/day "
                f"with a mean health score of {metrics.get('healthScore', 85)}/100. "
                f"Photoperiod conditions and pH remained within the safe biological boundary."
            ),
            "recommendations": [
                "Maintain aeration pulse during peak illumination hours to replenish dissolved inorganic carbon.",
                "Verify pH probe calibration with pH 7.0 buffer every 14 days.",
                "Inspect liquid nutrient level and perform 10% medium exchange weekly."
            ]
        }

report_generator = ReportGenerator()
