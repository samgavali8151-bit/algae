/*
  =============================================================================
  IoT-BASED CARBON CAPTURE AND RECOVERY SYSTEM USING MICROALGAE
  ESP32 Production Firmware with WiFi + Firebase Realtime Database
  =============================================================================
  Features:
  - DHT11 (GPIO 4): Temperature and Humidity
  - LDR (GPIO 34): 12-bit ADC (DARK, LOW, MEDIUM, BRIGHT)
  - pH Sensor (GPIO 32): 12-bit ADC + Voltage + Dynamic Multi-point Calibration
  - Water Level Sensor (GPIO 27, INPUT_PULLUP): Digital HIGH/LOW
  - Relay Module (GPIO 25, ACTIVE LOW): Water/Air Circulation Pump
  - Firebase RTDB: Live telemetry publishing, remote control, and calibration sync
*/

#include <WiFi.h>
#include <DHT.h>
#include <time.h>

#if __has_include("config.h")
  #include "config.h"
#else
  // Default fallback credentials — Update WIFI_SSID and WIFI_PASSWORD for your network
  #define WIFI_SSID "YOUR_WIFI_SSID"
  #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
  #define FIREBASE_API_KEY "AIzaSyD4o7kzHXtOLIY2CyeAaDjUIESR2OPTVSI"
  #define FIREBASE_DATABASE_URL "https://final-methane-deb07-default-rtdb.firebaseio.com"
  #define DEVICE_ID "algae_pbr_01"
  #define USER_EMAIL ""
  #define USER_PASSWORD ""
#endif

// Firebase ESP Client library (Mobizt)
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// =========================
// HARDWARE PIN DEFINITIONS
// =========================
#define DHT_PIN 4
#define DHT_TYPE DHT11

#define LDR_PIN 34
#define PH_PIN 32
#define WATER_LEVEL_PIN 27
#define RELAY_PIN 25

// Active LOW Relay Definitions
#define RELAY_ON LOW
#define RELAY_OFF HIGH

DHT dht(DHT_PIN, DHT_TYPE);

// =========================
// FIREBASE OBJECTS
// =========================
FirebaseData fbdo;
FirebaseData streamData;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

// =========================
// STATE & CALIBRATION VARIABLES
// =========================
float phSlope = -5.70;
float phOffset = 21.34;

String currentRelayCommand = "OFF"; // "ON", "OFF", "AUTO"
String currentControlMode = "manual"; // "manual", "auto", "ai"
bool currentRelayState = false;

unsigned long lastSensorReadTime = 0;
const unsigned long SENSOR_INTERVAL_MS = 2000;

unsigned long lastControlSyncTime = 0;
const unsigned long CONTROL_SYNC_INTERVAL_MS = 3000;

// =========================
// NTP TIME HELPER
// =========================
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 0;

unsigned long getEpochTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return millis() / 1000;
  }
  time(&now);
  return now;
}

// =========================
// RELAY CONTROL HELPER
// =========================
void setRelay(bool turnOn) {
  currentRelayState = turnOn;
  digitalWrite(RELAY_PIN, turnOn ? RELAY_ON : RELAY_OFF);
}

// =========================
// SETUP
// =========================
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("  MICROALGAE IoT PROJECT - PRODUCTION FIRMWARE   ");
  Serial.println("  ESP32 TELEMETRY & CLOUD ACTUATION CONTROLLER   ");
  Serial.println("=================================================");

  // Pin modes
  pinMode(LDR_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);

  // Initialize relay in safe OFF state
  setRelay(false);

  // Initialize ADC resolution to 12-bit (0 - 4095)
  analogReadResolution(12);

  // Initialize DHT
  dht.begin();

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected! IP address: ");
    Serial.println(WiFi.localIP());

    // Configure NTP time
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

    // Initialize Firebase
    config.api_key = FIREBASE_API_KEY;
    config.database_url = FIREBASE_DATABASE_URL;

    if (String(USER_EMAIL).length() > 0 && String(USER_PASSWORD).length() > 0) {
      auth.user.email = USER_EMAIL;
      auth.user.password = USER_PASSWORD;
    } else {
      config.signer.test_mode = true;
    }

    Firebase.reconnectWiFi(true);
    Firebase.begin(&config, &auth);
    signupOK = true;
    Serial.println("[Firebase] Initialized.");
  } else {
    Serial.println("\n[WiFi] Not connected. Running in offline standalone mode.");
  }
}

// =========================
// MAIN LOOP
// =========================
void loop() {
  unsigned long currentMillis = millis();

  // Read sensors every 2000 ms
  if (currentMillis - lastSensorReadTime >= SENSOR_INTERVAL_MS) {
    lastSensorReadTime = currentMillis;

    // 1. Temperature & Humidity
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // 2. Light / LDR Classification
    int ldrValue = analogRead(LDR_PIN);
    String lightLevel;
    if (ldrValue <= 300) {
      lightLevel = "DARK";
    } else if (ldrValue <= 1000) {
      lightLevel = "LOW";
    } else if (ldrValue <= 2200) {
      lightLevel = "MEDIUM";
    } else {
      lightLevel = "BRIGHT";
    }

    // 3. pH Sensor Raw + Calibrated
    int phRaw = analogRead(PH_PIN);
    float phVoltage = (phRaw / 4095.0f) * 3.3f;
    float phCalibrated = (phSlope * phVoltage) + phOffset;
    if (phCalibrated < 0.0f) phCalibrated = 0.0f;
    if (phCalibrated > 14.0f) phCalibrated = 14.0f;

    // 4. Water Level Sensor (Digital)
    int waterState = digitalRead(WATER_LEVEL_PIN);
    String waterLevel = (waterState == HIGH) ? "HIGH" : "LOW";

    // 5. Autonomous logic if in AUTO / AI mode
    if (currentControlMode == "auto" || currentControlMode == "ai") {
      if (waterState == LOW || phCalibrated > 8.5f) {
        setRelay(true);
      } else if (phCalibrated < 7.0f) {
        setRelay(false);
      }
    } else {
      if (currentRelayCommand == "ON") {
        setRelay(true);
      } else if (currentRelayCommand == "OFF") {
        setRelay(false);
      }
    }

    String relayStatusStr = currentRelayState ? "ON" : "OFF";

    // Local serial output
    Serial.println("----------- READINGS -----------");
    if (isnan(temperature)) {
      Serial.println("Temperature: ERROR");
    } else {
      Serial.print("Temperature: ");
      Serial.print(temperature, 1);
      Serial.println(" °C");
    }

    if (isnan(humidity)) {
      Serial.println("Humidity: ERROR");
    } else {
      Serial.print("Humidity: ");
      Serial.print(humidity, 1);
      Serial.println(" %");
    }

    Serial.print("LDR Value: ");
    Serial.println(ldrValue);
    Serial.print("Light Level: ");
    Serial.println(lightLevel);

    Serial.print("pH Raw: ");
    Serial.println(phRaw);
    Serial.print("pH Voltage: ");
    Serial.print(phVoltage, 3);
    Serial.println(" V");
    Serial.print("pH Calibrated: ");
    Serial.println(phCalibrated, 2);

    Serial.print("Water Level: ");
    Serial.println(waterLevel);
    Serial.print("Relay Status: ");
    Serial.println(relayStatusStr);
    Serial.print("Control Mode: ");
    Serial.println(currentControlMode);
    Serial.println("--------------------------------\n");

    // Push to Firebase RTDB
    if (WiFi.status() == WL_CONNECTED && signupOK) {
      String liveBasePath = "/devices/" + String(DEVICE_ID) + "/live";

      FirebaseJson json;
      json.set("temperature", isnan(temperature) ? -999 : temperature);
      json.set("humidity", isnan(humidity) ? -999 : humidity);
      json.set("ldrValue", ldrValue);
      json.set("lightLevel", lightLevel);
      json.set("phRaw", phRaw);
      json.set("phVoltage", phVoltage);
      json.set("phCalibrated", phCalibrated);
      json.set("waterLevel", waterLevel);
      json.set("relayStatus", relayStatusStr);
      json.set("timestamp", (double)getEpochTime());
      json.set("online", true);

      if (!Firebase.RTDB.setJSON(&fbdo, liveBasePath.c_str(), &json)) {
        Serial.print("[Firebase Error] Set JSON failed: ");
        Serial.println(fbdo.errorReason());
      }
    }
  }

  // Periodic control and calibration check
  if (WiFi.status() == WL_CONNECTED && signupOK && (currentMillis - lastControlSyncTime >= CONTROL_SYNC_INTERVAL_MS)) {
    lastControlSyncTime = currentMillis;

    String controlPath = "/devices/" + String(DEVICE_ID) + "/control";
    if (Firebase.RTDB.getJSON(&fbdo, controlPath.c_str())) {
      FirebaseJson &ctrlJson = fbdo.jsonObject();
      FirebaseJsonData cmdData, modeData;
      if (ctrlJson.get(cmdData, "relayCommand")) {
        currentRelayCommand = cmdData.stringValue;
      }
      if (ctrlJson.get(modeData, "mode")) {
        currentControlMode = modeData.stringValue;
      }
    }

    String calPath = "/calibration/" + String(DEVICE_ID);
    if (Firebase.RTDB.getJSON(&fbdo, calPath.c_str())) {
      FirebaseJson &calJson = fbdo.jsonObject();
      FirebaseJsonData slopeData, offsetData;
      if (calJson.get(slopeData, "slope")) {
        phSlope = slopeData.floatValue;
      }
      if (calJson.get(offsetData, "offset")) {
        phOffset = offsetData.floatValue;
      }
    }
  }

  delay(10);
}
