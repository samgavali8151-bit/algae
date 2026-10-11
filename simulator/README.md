# Photobioreactor Sensor Mock Simulator

This simulator generates realistic physical and biological telemetry for the microalgae photobioreactor when physical ESP32 hardware is not connected.

## Features
- **Diurnal Solar Cycle**: Realistically shifts LDR readings through `DARK` (<=300), `LOW` (<=1000), `MEDIUM` (<=2200), and `BRIGHT` (>2200).
- **Photosynthetic pH Dynamics**: pH gradually increases under illumination as microalgae absorb dissolved $\text{CO}_2$, and drops when the circulation/aeration pump operates.
- **Relay & Pump Control Listening**: Reacts to manual `ON`/`OFF` or `AUTO`/`AI` mode commands published from the web dashboard.
- **2-Second Cadence**: Matches the 2000 ms sampling rate of the ESP32 firmware.

## Option A: Run with Node.js (Zero Dependencies)
No package installation needed! Built-in Node HTTP modules are used:
```bash
node simulator/mock_simulator.js
```

## Option B: Run with Python
1. Install requirements:
   ```bash
   pip install -r simulator/requirements.txt
   ```
2. Run:
   ```bash
   python simulator/mock_simulator.py
   ```

## Environment Variables (Optional)
Create a `.env` in the simulator directory or pass environment variables:
- `DEVICE_ID`: Device identifier (defaults to `algae_pbr_01`)
- `FIREBASE_DATABASE_URL`: Your Firebase Realtime Database URL
- `FIREBASE_AUTH_SECRET`: Optional database secret if rules require authentication
