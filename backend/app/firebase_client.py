import os
import time
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("microalgae.firebase")

# In-memory store for fallback mode
_mock_store: Dict[str, Any] = {
    "live": {
        "temperature": 24.8,
        "humidity": 62.0,
        "ldrValue": 2450,
        "lightLevel": "BRIGHT",
        "phRaw": 2680,
        "phVoltage": 2.16,
        "phCalibrated": 7.82,
        "waterLevel": "HIGH",
        "relayStatus": "OFF",
        "timestamp": int(time.time()),
        "online": True
    },
    "control": {
        "relayCommand": "OFF",
        "mode": "auto",
        "updatedBy": "system"
    },
    "calibration": {
        "slope": -5.70,
        "offset": 21.34,
        "phPoints": [
            {"buffer": 4.01, "voltage": 3.04},
            {"buffer": 7.00, "voltage": 2.51},
            {"buffer": 10.01, "voltage": 1.98}
        ],
        "updatedAt": int(time.time())
    },
    "history": []
}

class FirebaseManager:
    def __init__(self):
        self.initialized = False
        self.rtdb = None
        self.firestore = None
        self._init_firebase()

    def _init_firebase(self):
        try:
            import firebase_admin
            from firebase_admin import credentials, db, firestore
            from app.config import settings

            if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_KEY):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
                firebase_admin.initialize_app(cred, {
                    'databaseURL': settings.FIREBASE_DATABASE_URL
                })
                self.rtdb = db
                self.firestore = firestore.client()
                self.initialized = True
                logger.info("Firebase Admin SDK successfully initialized with service account.")
            else:
                logger.warning(
                    f"Service account file '{settings.FIREBASE_SERVICE_ACCOUNT_KEY}' not found. "
                    "Running in simulated resilient mode."
                )
        except Exception as e:
            logger.warning(f"Could not initialize Firebase Admin SDK: {e}. Using resilient local store.")

    def get_live_data(self, device_id: str) -> Dict[str, Any]:
        if self.initialized and self.rtdb:
            try:
                ref = self.rtdb.reference(f"devices/{device_id}/live")
                data = ref.get()
                if data:
                    return data
            except Exception as e:
                logger.error(f"Error reading RTDB: {e}")
        else:
            # Direct REST fallback to RTDB
            try:
                import urllib.request
                from app.config import settings
                url = f"{settings.FIREBASE_DATABASE_URL.rstrip('/')}/devices/{device_id}/live.json"
                req = urllib.request.Request(url, headers={'User-Agent': 'FastAPI/1.0'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        raw = json.loads(resp.read().decode('utf-8'))
                        if raw:
                            return raw
            except Exception as e:
                logger.debug(f"REST read error: {e}")
        
        # Fallback to local store
        data = _mock_store["live"].copy()
        data["timestamp"] = int(time.time())
        return data

    def update_control(self, device_id: str, relay_command: str, mode: str, updated_by: str = "web_user") -> Dict[str, Any]:
        ctrl = {
            "relayCommand": relay_command,
            "mode": mode,
            "updatedBy": updated_by,
            "updatedAt": int(time.time())
        }
        if self.initialized and self.rtdb:
            try:
                ref = self.rtdb.reference(f"devices/{device_id}/control")
                ref.update(ctrl)
            except Exception as e:
                logger.error(f"Error updating RTDB control: {e}")
        else:
            # REST write
            try:
                import urllib.request
                from app.config import settings
                url = f"{settings.FIREBASE_DATABASE_URL.rstrip('/')}/devices/{device_id}/control.json"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(ctrl).encode('utf-8'),
                    headers={'Content-Type': 'application/json'},
                    method='PATCH'
                )
                urllib.request.urlopen(req, timeout=3)
            except Exception as e:
                logger.debug(f"REST control write error: {e}")
        
        _mock_store["control"].update(ctrl)
        if relay_command in ["ON", "OFF"]:
            _mock_store["live"]["relayStatus"] = relay_command
        return ctrl

    def get_calibration(self, device_id: str) -> Dict[str, Any]:
        if self.initialized and self.rtdb:
            try:
                ref = self.rtdb.reference(f"calibration/{device_id}")
                data = ref.get()
                if data:
                    return data
            except Exception as e:
                logger.error(f"Error reading calibration: {e}")
        else:
            try:
                import urllib.request
                from app.config import settings
                url = f"{settings.FIREBASE_DATABASE_URL.rstrip('/')}/calibration/{device_id}.json"
                req = urllib.request.Request(url, headers={'User-Agent': 'FastAPI/1.0'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        raw = json.loads(resp.read().decode('utf-8'))
                        if raw:
                            return raw
            except Exception as e:
                logger.debug(f"REST calibration read error: {e}")

        return _mock_store["calibration"]

    def update_calibration(self, device_id: str, slope: float, offset: float, points: list = None) -> Dict[str, Any]:
        cal = {
            "slope": slope,
            "offset": offset,
            "phPoints": points or [],
            "updatedAt": int(time.time())
        }
        if self.initialized and self.rtdb:
            try:
                ref = self.rtdb.reference(f"calibration/{device_id}")
                ref.set(cal)
            except Exception as e:
                logger.error(f"Error updating calibration in RTDB: {e}")
        else:
            try:
                import urllib.request
                from app.config import settings
                url = f"{settings.FIREBASE_DATABASE_URL.rstrip('/')}/calibration/{device_id}.json"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(cal).encode('utf-8'),
                    headers={'Content-Type': 'application/json'},
                    method='PUT'
                )
                urllib.request.urlopen(req, timeout=3)
            except Exception as e:
                logger.debug(f"REST calibration write error: {e}")

        _mock_store["calibration"].update(cal)
        return cal

firebase_mgr = FirebaseManager()
