from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.firebase_client import firebase_mgr

router = APIRouter(tags=["control"])

class RelayControlRequest(BaseModel):
    deviceId: str = Field(default="algae_pbr_01")
    relayCommand: str = Field(description="ON, OFF, or AUTO")
    mode: str = Field(default="manual", description="manual, auto, or ai")
    updatedBy: Optional[str] = "web_dashboard"

@router.post("/api/control/relay")
async def control_relay(req: RelayControlRequest):
    if req.relayCommand not in ["ON", "OFF", "AUTO"]:
        raise HTTPException(status_code=400, detail="relayCommand must be 'ON', 'OFF', or 'AUTO'")
    if req.mode not in ["manual", "auto", "ai"]:
        raise HTTPException(status_code=400, detail="mode must be 'manual', 'auto', or 'ai'")

    result = firebase_mgr.update_control(
        device_id=req.deviceId,
        relay_command=req.relayCommand,
        mode=req.mode,
        updated_by=req.updatedBy
    )
    
    return {
        "status": "success",
        "message": f"Pump command set to {req.relayCommand} (Mode: {req.mode})",
        "control": result
    }
