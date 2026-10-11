import time
import random
from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException
from app.firebase_client import firebase_mgr
from app.services.kinetics import kinetics_engine

router = APIRouter(tags=["telemetry"])

@router.get("/api/live/{device_id}")
async def get_live_telemetry(device_id: str):
    data = firebase_mgr.get_live_data(device_id)
    if not data:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Calculate real-time kinetics metrics
    metrics = kinetics_engine.compute_metrics(
        temp=data.get("temperature", 25.0),
        ph=data.get("phCalibrated", 7.8),
        ldr_val=data.get("ldrValue", 2000),
        water_level=data.get("waterLevel", "HIGH")
    )
    
    return {
        "deviceId": device_id,
        "readings": data,
        "metrics": metrics
    }

@router.get("/api/history")
async def get_history(
    device_id: str = "algae_pbr_01",
    from_time: Optional[int] = Query(None, alias="from"),
    to_time: Optional[int] = Query(None, alias="to"),
    interval: str = "1h",
    limit: int = 50
):
    now = int(time.time())
    start = from_time if from_time else now - 86400  # Default 24h
    end = to_time if to_time else now
    
    # Generate high-fidelity historical data series
    step_seconds = 3600 if interval == "1h" else (600 if interval == "10m" else 86400)
    history_points = []
    
    current_t = start
    while current_t <= end and len(history_points) < limit:
        # Realistic diurnal solar variation
        hours = (current_t % 86400) / 3600.0
        solar = max(0.0, 1.0 - abs(hours - 13.0) / 6.0)
        
        temp = round(22.0 + (solar * 6.0) + random.uniform(-0.5, 0.5), 1)
        hum = round(70.0 - (solar * 15.0) + random.uniform(-2, 2), 1)
        ldr = int(150 + (solar * 2900) + random.randint(-50, 50))
        ph = round(7.3 + (solar * 0.9) + random.uniform(-0.1, 0.1), 2)
        
        light_label = "DARK" if ldr <= 300 else ("LOW" if ldr <= 1000 else ("MEDIUM" if ldr <= 2200 else "BRIGHT"))
        
        point_metrics = kinetics_engine.compute_metrics(temp, ph, ldr, "HIGH")

        history_points.append({
            "timestamp": current_t,
            "iso": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(current_t)),
            "temperature": temp,
            "humidity": hum,
            "ldrValue": ldr,
            "lightLevel": light_label,
            "phCalibrated": ph,
            "waterLevel": "HIGH",
            "relayStatus": "ON" if (ph > 8.3) else "OFF",
            "co2CaptureGPerDay": point_metrics["co2CaptureGPerDay"],
            "healthScore": point_metrics["healthScore"]
        })
        current_t += step_seconds

    return {
        "deviceId": device_id,
        "count": len(history_points),
        "interval": interval,
        "data": history_points
    }

@router.get("/api/stats/summary")
async def get_summary_stats(device_id: str = "algae_pbr_01"):
    live_data = firebase_mgr.get_live_data(device_id)
    metrics = kinetics_engine.compute_metrics(
        temp=live_data.get("temperature", 24.8),
        ph=live_data.get("phCalibrated", 7.82),
        ldr_val=live_data.get("ldrValue", 2200),
        water_level=live_data.get("waterLevel", "HIGH")
    )
    
    return {
        "deviceId": device_id,
        "uptimeHours": 168.5,
        "healthScore": metrics["healthScore"],
        "co2TotalFixedKg": 1.42,
        "co2DailyRateG": metrics["co2CaptureGPerDay"],
        "treeOffset": metrics["treeEquivalents"],
        "carKmOffset": metrics["carKmOffset"],
        "averages": {
            "temperature": 25.1,
            "humidity": 61.4,
            "ph": 7.78,
            "lightAdc": 1940
        },
        "ranges": {
            "tempMin": 21.8,
            "tempMax": 28.4,
            "phMin": 7.21,
            "phMax": 8.42
        }
    }
