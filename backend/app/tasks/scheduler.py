import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.firebase_client import firebase_mgr
from app.services.kinetics import kinetics_engine
from app.services.anomaly import anomaly_detector

logger = logging.getLogger("microalgae.scheduler")
scheduler = AsyncIOScheduler()

async def periodic_health_check_job():
    try:
        data = firebase_mgr.get_live_data("algae_pbr_01")
        anomalies = anomaly_detector.check_telemetry(data)
        if anomalies:
            logger.warning(f"Detected {len(anomalies)} anomalies in periodic scheduler check.")
    except Exception as e:
        logger.error(f"Error in scheduler job: {e}")

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(periodic_health_check_job, 'interval', minutes=5, id='algae_health_monitor', replace_existing=True)
        scheduler.start()
        logger.info("APScheduler background monitor started.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
