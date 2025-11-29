import { SensorValue } from '../types';

export interface ISensorBoard {
  initialize(): Promise<void>;
  isReady(): boolean;
  readAllSensors(): Record<string, SensorValue>;
  setSensorValue(sensorName: string, value: number): void;
  setAutoMode(): void;
  hasManualSensors(): boolean;
  getSensorNames(): string[];
  getSensorInfo(sensorName: string): { isManual: boolean; value: number } | null;
}
