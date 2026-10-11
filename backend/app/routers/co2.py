from fastapi import APIRouter, Query
from typing import Optional
from app.firebase_client import firebase_mgr
from app.services.kinetics import kinetics_engine

router = APIRouter(tags=["co2"])

@router.get("/api/co2/estimate")
async def estimate_co2(
    device_id: str = "algae_pbr_01",
    temp: Optional[float] = None,
    ph: Optional[float] = None,
    ldr: Optional[float] = None,
    water_level: Optional[str] = None,
    biomass_density: Optional[float] = 1.2
):
    live_data = firebase_mgr.get_live_data(device_id)
    
    # Use provided query parameters or fallback to live sensor state
    t_val = temp if temp is not None else live_data.get("temperature", 24.8)
    p_val = ph if ph is not None else live_data.get("phCalibrated", 7.82)
    l_val = ldr if ldr is not None else live_data.get("ldrValue", 2200)
    w_val = water_level if water_level is not None else live_data.get("waterLevel", "HIGH")

    metrics = kinetics_engine.compute_metrics(
        temp=t_val,
        ph=p_val,
        ldr_val=l_val,
        water_level=w_val,
        biomass_density_g_l=biomass_density
    )

    return {
        "deviceId": device_id,
        "inputConditions": {
            "temperature": t_val,
            "ph": p_val,
            "ldrValue": l_val,
            "waterLevel": w_val,
            "biomassDensityGPerL": biomass_density
        },
        "kinetics": metrics
    }
