/*
 * ==============================================================================
 * AquaAgent - ESP32 Smart Water Pipeline Telemetry Node
 * ==============================================================================
 * 
 * Hardware Setup:
 * - ESP32 Dev Module
 * - YF-S201 Hall-effect Flow Sensor 1 (Inflow): GPIO 18 (Interrupt)
 * - YF-S201 Hall-effect Flow Sensor 2 (Outflow): GPIO 19 (Interrupt)
 * - 0-1.2 MPa Water Pressure Transducer (0.5V - 4.5V output): GPIO 34 (ADC1_CH6)
 * - Relay 1 / Solenoid Valve 1: GPIO 22
 * - Relay 2 / Solenoid Valve 2 (Auxiliary): GPIO 23
 *
 * This sketch collects real-time flow pulse counts and calibrated analog pressure,
 * serializes a JSON payload, and posts telemetry to the AquaAgent backend API.
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// AquaAgent Backend API Endpoint
// Change IP to the workstation running the AquaAgent backend (e.g. http://192.168.1.50:8000/api/telemetry)
const char* serverEndpoint = "http://192.168.1.100:8000/api/telemetry";

// Pin Allocations
const int PIN_FLOW_IN = 18;
const int PIN_FLOW_OUT = 19;
const int PIN_PRESSURE = 34;
const int PIN_VALVE_1 = 22;
const int PIN_VALVE_2 = 23;

// Calibration Constants
// YF-S201 Flow Sensor: Pulse frequency (Hz) = 7.5 * Flow rate (L/min)
const float FLOW_CALIBRATION_FACTOR = 7.5;

// Volatile pulse counters for interrupt service routines
volatile unsigned long pulseCountIn = 0;
volatile unsigned long pulseCountOut = 0;

unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL_MS = 2000; // 2-second telemetry period

void IRAM_ATTR flowInInterrupt() {
  pulseCountIn++;
}

void IRAM_ATTR flowOutInterrupt() {
  pulseCountOut++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[AquaAgent] Initializing ESP32 Smart Pipeline Node...");

  // Configure Actuator Relay Pins (Active Low Relays)
  pinMode(PIN_VALVE_1, OUTPUT);
  pinMode(PIN_VALVE_2, OUTPUT);
  digitalWrite(PIN_VALVE_1, HIGH); // Valve Open (De-energized)
  digitalWrite(PIN_VALVE_2, HIGH);

  // Configure Flow Sensor Pins with Internal Pullups
  pinMode(PIN_FLOW_IN, INPUT_PULLUP);
  pinMode(PIN_FLOW_OUT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_IN), flowInInterrupt, RISING);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_OUT), flowOutInterrupt, RISING);

  // Configure ADC for Pressure Sensor (12-bit: 0 - 4095)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // 0 - 3.3V range

  // Connect to WiFi
  Serial.print("[AquaAgent] Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[AquaAgent] WiFi Connected successfully!");
    Serial.print("[AquaAgent] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[AquaAgent WARNING] WiFi Connection failed. Running in offline serial monitor mode.");
  }

  lastSampleTime = millis();
}

void loop() {
  unsigned long currentTime = millis();

  // Periodic Telemetry Sampling
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    // Detach interrupts momentarily for safe atomic read
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW_IN));
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW_OUT));

    unsigned long pulsesIn = pulseCountIn;
    unsigned long pulsesOut = pulseCountOut;
    pulseCountIn = 0;
    pulseCountOut = 0;

    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_IN), flowInInterrupt, RISING);
    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_OUT), flowOutInterrupt, RISING);

    float elapsedSeconds = (currentTime - lastSampleTime) / 1000.0;
    lastSampleTime = currentTime;

    // Calculate Flow Rates in L/min
    // Flow Rate (L/min) = (Pulses / elapsed_seconds) / Calibration_Factor
    float flowInLpm = (pulsesIn / elapsedSeconds) / FLOW_CALIBRATION_FACTOR;
    float flowOutLpm = (pulsesOut / elapsedSeconds) / FLOW_CALIBRATION_FACTOR;

    // Read Pressure Sensor ADC and Calibrate (0.5V-4.5V transducer mapped to 0-10 bar / 0-1 MPa)
    int rawAdc = analogRead(PIN_PRESSURE);
    float voltage = (rawAdc / 4095.0) * 3.3 * (5.0 / 3.3); // Voltage with divider compensation
    float pressureBar = ((voltage - 0.5) / 4.0) * 10.0;     // Calibrated pressure in bar
    if (pressureBar < 0.0) pressureBar = 0.0;

    // Print Telemetry to Serial Monitor
    Serial.printf("[TELEMETRY] Flow In: %.2f L/min | Flow Out: %.2f L/min | Pressure: %.2f bar | Loss: %.2f L/min\n",
                  flowInLpm, flowOutLpm, pressureBar, max(0.0f, flowInLpm - flowOutLpm));

    // Dispatch JSON to AquaAgent Backend if connected
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverEndpoint);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<256> doc;
      doc["flow_in"] = round(flowInLpm * 100.0) / 100.0;
      doc["flow_out"] = round(flowOutLpm * 100.0) / 100.0;
      doc["pressure"] = round(pressureBar * 100.0) / 100.0;
      doc["zone"] = "Zone-A";

      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[HTTP %d] Backend Response: %s\n", httpResponseCode, response.c_str());
      } else {
        Serial.printf("[HTTP ERROR] Failed to send telemetry: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }
  }

  // Small yield to allow background WiFi stack processing
  delay(50);
}
