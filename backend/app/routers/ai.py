from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.firebase_client import firebase_mgr
from app.services.anomaly import anomaly_detector
from app.services.forecast import forecaster
from app.services.copilot import ai_copilot
from app.services.report_gen import report_generator
from app.services.kinetics import kinetics_engine

router = APIRouter(tags=["ai"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    deviceId: Optional[str] = "algae_pbr_01"
    history: Optional[List[ChatMessage]] = []

@router.get("/api/ai/anomalies")
async def get_anomalies(device_id: str = "algae_pbr_01"):
    live_data = firebase_mgr.get_live_data(device_id)
    anomalies = anomaly_detector.check_telemetry(live_data)
    return {
        "deviceId": device_id,
        "count": len(anomalies),
        "status": "ANOMALY_DETECTED" if anomalies else "HEALTHY",
        "anomalies": anomalies
    }

@router.get("/api/ai/forecast")
async def get_forecast(device_id: str = "algae_pbr_01"):
    live_data = firebase_mgr.get_live_data(device_id)
    predictions = forecaster.generate_24h_forecast(live_data)
    return {
        "deviceId": device_id,
        "horizon": "24h",
        "forecast": predictions
    }

@router.post("/api/ai/chat")
async def chat_with_copilot(req: ChatRequest):
    live_data = firebase_mgr.get_live_data(req.deviceId)
    response = await ai_copilot.chat(
        user_message=req.message,
        current_telemetry=live_data,
        history=[h.model_dump() for h in (req.history or [])]
    )
    return response

@router.get("/api/ai/report")
async def get_ai_report(device_id: str = "algae_pbr_01"):
    live_data = firebase_mgr.get_live_data(device_id)
    metrics = kinetics_engine.compute_metrics(
        temp=live_data.get("temperature", 24.8),
        ph=live_data.get("phCalibrated", 7.82),
        ldr_val=live_data.get("ldrValue", 2200),
        water_level=live_data.get("waterLevel", "HIGH")
    )
    report = report_generator.generate_summary_report(live_data, metrics)
    return {
        "deviceId": device_id,
        "report": report
    }
