from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from app.firebase_client import firebase_mgr

router = APIRouter(tags=["calibration"])

class CalibrationPoint(BaseModel):
    buffer: float = Field(description="Buffer standard value, e.g. 4.01, 7.00, 10.01")
    voltage: float = Field(description="Measured probe output voltage in Volts")

class PhCalibrationRequest(BaseModel):
    deviceId: str = Field(default="algae_pbr_01")
    points: List[CalibrationPoint] = Field(min_length=2, description="At least two calibration buffer points")

@router.get("/api/calibration/{device_id}")
async def get_calibration(device_id: str):
    data = firebase_mgr.get_calibration(device_id)
    return {
        "deviceId": device_id,
        "calibration": data
    }

@router.post("/api/calibration/ph")
async def calibrate_ph(req: PhCalibrationRequest):
    voltages = [p.voltage for p in req.points]
    buffers = [p.buffer for p in req.points]

    # Perform linear regression: pH = slope * voltage + offset
    # Using numpy least squares
    A = np.vstack([voltages, np.ones(len(voltages))]).T
    slope, offset = np.linalg.lstsq(A, buffers, rcond=None)[0]

    slope_val = round(float(slope), 3)
    offset_val = round(float(offset), 3)

    saved = firebase_mgr.update_calibration(
        device_id=req.deviceId,
        slope=slope_val,
        offset=offset_val,
        points=[p.model_dump() for p in req.points]
    )

    return {
        "status": "success",
        "message": f"pH calibration successful. Slope: {slope_val}, Offset: {offset_val}",
        "calibration": saved
    }
