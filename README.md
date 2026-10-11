# IoT-Based Carbon Capture and Recovery System Using Microalgae

An automated, intelligent closed-loop photobioreactor platform for biological carbon dioxide ($\text{CO}_2$) sequestration using *Chlorella vulgaris* microalgae. The platform combines ESP32 microcontroller edge telemetry, Firebase Realtime Database and Cloud Firestore, a high-performance Python FastAPI backend for biological kinetics and AI models, and a Next.js 14 web dashboard.

---

## 1. System Architecture

```text
┌─────────────────┐         WiFi / SSL         ┌─────────────────────────────┐
│  ESP32 Edge     │ ─────────────────────────> │  Firebase Realtime Database │
│  - DHT11 (GPIO4)│                            │  - /devices/{id}/live       │
│  - LDR (GPIO34) │ <───────────────────────── │  - /devices/{id}/control    │
│  - pH (GPIO32)  │    Relay Command (GPIO25)  └──────────────┬──────────────┘
│  - Water (GPIO27│                                           │
└─────────────────┘                                           │
         ▲                                                    │ Live Stream
         │ (or simulated)                                     │ & Control
┌─────────────────┐                                           ▼
│ Mock Simulator  │                            ┌─────────────────────────────┐
│ (Node.js/Python)│                            │ Next.js 14 Web Dashboard    │
└─────────────────┘                            │ - Live Gauges & Controls    │
                                               │ - Multi-Parameter Analytics │
┌─────────────────┐      REST / WebSocket      │ - pH Calibration Wizard     │
│ FastAPI Backend │ <────────────────────────> │ - AI Copilot & Digital Twin │
│ - Monod Kinetics│                            └─────────────────────────────┘
│ - Anomaly Detect│
│ - 24h Forecast  │
└─────────────────┘
```

---

## 2. Hardware Wiring Matrix

| Component | ESP32 GPIO | Mode / Config | Function |
|---|---|---|---|
| **DHT11 Sensor** | GPIO 4 | Digital Read | Ambient temperature (°C) & humidity (%) |
| **LDR Photoresistor** | GPIO 34 | Analog ADC (12-bit, 0–4095) | Measures photon flux (DARK, LOW, MEDIUM, BRIGHT) |
| **Analog pH Probe** | GPIO 32 | Analog ADC (12-bit, 0–4095) | Measures hydronium voltage with linear calibration |
| **Float Water Switch**| GPIO 27 | Digital `INPUT_PULLUP` | Detects liquid nutrient medium depletion (HIGH/LOW)|
| **1-Ch Relay Module**| GPIO 25 | Digital Output (`ACTIVE LOW`) | Actuates aeration & circulation pump (`LOW=ON`, `HIGH=OFF`)|

---

## 3. Directory Layout

```text
d:/Algae/
├── Algae.ino                    # Production ESP32 firmware (root for Arduino IDE)
├── firmware/
│   └── Algae/
│       ├── Algae.ino            # ESP32 firmware copy
│       └── config.h.example     # WiFi & Firebase credentials template
├── backend/
│   ├── app/                     # FastAPI application
│   │   ├── main.py              # Entrypoint & CORS
│   │   ├── config.py            # Settings & environment variables
│   │   ├── firebase_client.py   # Firebase Admin SDK & fallback store
│   │   ├── routers/             # Telemetry, control, calibration, co2, ai routers
│   │   ├── services/            # Kinetics, anomaly, forecast, copilot, report services
│   │   └── tasks/               # APScheduler background workers
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── src/                     # Next.js 14 App Router
│   │   ├── app/                 # Landing page, dashboard, analytics, copilot, etc.
│   │   ├── components/          # Reusable SVG gauges, cards, charts, sidebar
│   │   ├── lib/                 # Firebase SDK, API clients, helpers
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
├── simulator/
│   ├── mock_simulator.js        # Zero-dependency Node.js mock simulator
│   ├── mock_simulator.py        # Python mock simulator
│   ├── requirements.txt
│   └── README.md
├── firebase/
│   ├── database.rules.json      # Realtime Database security rules
│   ├── firestore.rules          # Firestore security rules
│   └── README.md                # Firebase console setup walkthrough
└── README.md
```

---

## 4. Quickstart Guide (Step-by-Step)

### Step 1: Start the Frontend Dashboard
The frontend includes built-in mock telemetry so you can preview and test immediately:
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 2: Run the Mock Telemetry Simulator (No Hardware Required)
You can stream simulated biological photoperiod and pH cycles in real time:
- **Using Node.js (Zero Dependencies)**:
  ```bash
  node simulator/mock_simulator.js
  ```
- **Or using Python**:
  ```bash
  pip install -r simulator/requirements.txt
  python simulator/mock_simulator.py
  ```

### Step 3: Run the FastAPI Backend (Optional / ML Services)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### Step 4: Flash the Physical ESP32 (When Ready)
1. Open `d:/Algae/Algae.ino` in the **Arduino IDE**.
2. Install the following libraries via the Arduino Library Manager:
   - `DHT sensor library` by Adafruit
   - `Firebase ESP Client` by Mobizt
3. Rename `firmware/Algae/config.h.example` to `firmware/Algae/config.h` (or update credentials in `Algae.ino`).
4. Select board: **ESP32 Dev Module**.
5. Connect your ESP32 via USB and click **Upload**.

---

## 5. Biological Kinetics & Carbon Math

Photosynthetic sequestration in the platform follows the stoichiometric mass balance of *Chlorella vulgaris*:
$$\text{CO}_2 \text{ Sequestered (g/day)} = 1.83 \times \mu \times X \times V_{\text{reactor}}$$
Where:
- $\mu$: Specific growth rate modulated by Steele's photoinhibition curve, Arrhenius temperature bell curve, and pH buffer limits.
- $X$: Algal biomass density ($\approx 1.25\text{ g/L}$).
- $V_{\text{reactor}}$: Liquid volume ($20.0\text{ L}$).
- $1.83$: Stoichiometric constant ($1.83\text{ kg } \text{CO}_2$ fixed per $1\text{ kg}$ dry biomass produced).

---

## 6. Deployment Guide

- **Frontend (Vercel)**: Push `frontend/` to GitHub and import into Vercel. Set the environment variables from `frontend/.env.example`.
- **Backend (Render / Railway / Cloud Run)**: Deploy `backend/` as a Python web service running `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Firebase**: Apply security rules from `firebase/database.rules.json` and `firebase/firestore.rules`.
