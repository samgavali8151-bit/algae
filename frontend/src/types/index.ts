export type LightLevel = 'DARK' | 'LOW' | 'MEDIUM' | 'BRIGHT';
export type WaterLevel = 'HIGH' | 'LOW';
export type RelayState = 'ON' | 'OFF';
export type RelayCommand = 'ON' | 'OFF' | 'AUTO';
export type ControlMode = 'manual' | 'auto' | 'ai';

export interface SensorReadings {
  temperature: number;
  humidity: number;
  ldrValue: number;
  lightLevel: LightLevel;
  phRaw: number;
  phVoltage: number;
  phCalibrated: number;
  waterLevel: WaterLevel;
  relayStatus: RelayState;
  timestamp: number;
  online: boolean;
}

export interface ControlState {
  relayCommand: RelayCommand;
  mode: ControlMode;
  updatedBy?: string;
  updatedAt?: number;
}

export interface CalibrationPoint {
  buffer: number;
  voltage: number;
}

export interface CalibrationData {
  slope: number;
  offset: number;
  phPoints?: CalibrationPoint[];
  updatedAt?: number;
}

export interface KineticsMetrics {
  healthScore: number;
  specificGrowthRateMu: number;
  growthFactors: {
    f_light: number;
    f_temp: number;
    f_ph: number;
    f_water: number;
  };
  biomassDensityGPerL: number;
  biomassGrowthGPerDay: number;
  co2CaptureGPerDay: number;
  co2CaptureKgPerDay: number;
  co2ProjectedKgPerYear: number;
  treeEquivalents: number;
  carKmOffset: number;
  carbonCreditUsdYear: number;
}

export interface AnomalyItem {
  id: string;
  type: string;
  parameter: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  value: any;
  threshold: string;
  message: string;
  recommendation: string;
  timestamp: number;
}

export interface ForecastPoint {
  hourAhead: number;
  timestamp: number;
  predictedTemperature: number;
  predictedPh: number;
  predictedLdrValue: number;
  predictedLightLevel: LightLevel;
  confidence: number;
  alertRisk: 'NORMAL' | 'ELEVATED';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
