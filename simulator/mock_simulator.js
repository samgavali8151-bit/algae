/**
 * =============================================================================
 * IoT-BASED CARBON CAPTURE AND RECOVERY SYSTEM USING MICROALGAE
 * Telemetry Mock Data Simulator (Zero-Dependency Node.js Edition)
 * =============================================================================
 * Run directly with: node simulator/mock_simulator.js
 */

const https = require('https');
const http = require('http');

const DEVICE_ID = process.env.DEVICE_ID || 'algae_pbr_01';
const FIREBASE_DATABASE_URL = (process.env.FIREBASE_DATABASE_URL || 'https://final-methane-deb07-default-rtdb.firebaseio.com').replace(/\/$/, '');
const FIREBASE_AUTH_SECRET = process.env.FIREBASE_AUTH_SECRET || '';

console.log('==================================================');
console.log('  MICROALGAE IoT SIMULATOR RUNNING (NODE.JS)');
console.log(`  Target Device: ${DEVICE_ID}`);
console.log(`  RTDB Endpoint: ${FIREBASE_DATABASE_URL}`);
console.log('==================================================');

let step = 0;
let currentRelayState = false;
let phSlope = -5.70;
let phOffset = 21.34;

function sendHttpRequest(method, urlStr, data = null) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        method: method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 2500
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: body ? JSON.parse(body) : null });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      });

      req.on('error', err => resolve({ error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'timeout' });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    } catch (err) {
      resolve({ error: err.message });
    }
  });
}

async function simulateCycle() {
  step++;
  const t = Math.floor(Date.now() / 1000);

  // 1. Diurnal solar cycle (period 120 ticks)
  const dayProgress = (step % 120) / 120.0;
  const solarIntensity = Math.max(0.0, Math.sin(dayProgress * 2 * Math.PI));

  // LDR ADC (0-4095)
  const baseLdr = 150 + Math.floor(solarIntensity * 3200) + Math.floor((Math.random() * 80) - 40);
  const ldrValue = Math.max(50, Math.min(4095, baseLdr));

  let lightLevel = 'DARK';
  if (ldrValue <= 300) lightLevel = 'DARK';
  else if (ldrValue <= 1000) lightLevel = 'LOW';
  else if (ldrValue <= 2200) lightLevel = 'MEDIUM';
  else lightLevel = 'BRIGHT';

  // 2. Temperature & Humidity
  const temperature = parseFloat((22.0 + (solarIntensity * 6.5) + ((Math.random() * 0.6) - 0.3)).toFixed(1));
  const humidity = parseFloat((72.0 - (solarIntensity * 14.0) + ((Math.random() * 2.0) - 1.0)).toFixed(1));

  // 3. pH dynamics
  let phCalibrated = 7.4 + (solarIntensity * 1.1) + ((Math.random() * 0.16) - 0.08);
  if (currentRelayState) {
    phCalibrated -= 0.35; // Aeration pump buffers pH down
  }
  phCalibrated = parseFloat(Math.max(6.0, Math.min(9.5, phCalibrated)).toFixed(2));

  const phVoltage = parseFloat(((phCalibrated - phOffset) / phSlope).toFixed(3));
  let phRaw = Math.floor((phVoltage / 3.3) * 4095);
  phRaw = Math.max(0, Math.min(4095, phRaw));

  // 4. Water Level
  const waterLevel = (step % 50 !== 0) ? 'HIGH' : 'LOW';

  // 5. Remote control sync
  try {
    let ctrlUrl = `${FIREBASE_DATABASE_URL}/devices/${DEVICE_ID}/control.json`;
    if (FIREBASE_AUTH_SECRET) ctrlUrl += `?auth=${FIREBASE_AUTH_SECRET}`;
    const ctrlRes = await sendHttpRequest('GET', ctrlUrl);
    if (ctrlRes && ctrlRes.data) {
      const { relayCommand, mode } = ctrlRes.data;
      if (mode === 'auto' || mode === 'ai') {
        if (waterLevel === 'LOW' || phCalibrated > 8.4) currentRelayState = true;
        else if (phCalibrated < 7.2) currentRelayState = false;
      } else if (relayCommand === 'ON') {
        currentRelayState = true;
      } else if (relayCommand === 'OFF') {
        currentRelayState = false;
      }
    } else {
      // Local auto fallback
      if (phCalibrated > 8.3) currentRelayState = true;
      else if (phCalibrated < 7.3) currentRelayState = false;
    }
  } catch (e) {}

  const relayStatus = currentRelayState ? 'ON' : 'OFF';

  const payload = {
    temperature,
    humidity,
    ldrValue,
    lightLevel,
    phRaw,
    phVoltage,
    phCalibrated,
    waterLevel,
    relayStatus,
    timestamp: t,
    online: true
  };

  const timeStr = new Date().toTimeString().split(' ')[0];
  console.log(`[${timeStr}] Step ${String(step).padStart(4, '0')} | Temp: ${temperature}°C | Hum: ${humidity}% | Light: ${lightLevel} (${ldrValue}) | pH: ${phCalibrated} (${phVoltage}V) | Water: ${waterLevel} | Pump: ${relayStatus}`);

  // Push to Firebase RTDB
  let liveUrl = `${FIREBASE_DATABASE_URL}/devices/${DEVICE_ID}/live.json`;
  if (FIREBASE_AUTH_SECRET) liveUrl += `?auth=${FIREBASE_AUTH_SECRET}`;
  await sendHttpRequest('PUT', liveUrl, payload);
}

// Tick every 2 seconds matching ESP32 firmware
setInterval(simulateCycle, 2000);
simulateCycle();
