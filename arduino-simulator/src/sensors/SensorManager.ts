import { SensorConfig, SensorValue, Status } from '../types';

export class Sensor {
  private manualMode: boolean = false;
  private manualValue: number;
  
  constructor(
    private name: string,
    private config: SensorConfig
  ) {
    this.manualValue = (config.min + config.max) / 2;
  }
  
  getName(): string {
    return this.name;
  }
  
  setManualValue(value: number): void {
    this.manualMode = true;
    this.manualValue = value;
  }
  
  setAutoMode(): void {
    this.manualMode = false;
  }
  
  isManual(): boolean {
    return this.manualMode;
  }
  
  getCurrentValue(): number {
    return this.manualMode ? this.manualValue : this.generateValue();
  }
  
  private generateValue(): number {
    const range = this.config.max - this.config.min;
    const value = this.config.min + Math.random() * range;
    
    const precision = this.config.unidade === '' ? 1 : 
                     (this.config.unidade === 'hPa' ? 0 : 1);
    
    return Number(value.toFixed(precision));
  }
  
  read(): SensorValue {
    const valor = this.getCurrentValue();
    const status = this.getStatus(valor);
    
    return {
      valor,
      status,
      timestamp: Date.now(),
      unidade: this.config.unidade
    };
  }
  
  private getStatus(value: number): Status {
    const { okMin, okMax, alertaMin, alertaMax } = this.config;
    
    if (okMin === undefined || okMax === undefined) {
      return 'OK';
    }
    
    if (value >= okMin && value <= okMax) {
      return 'OK';
    }
    
    if (alertaMin !== undefined && alertaMax !== undefined) {
      if (value < alertaMin || value > alertaMax) {
        return 'CRITICO';
      }
    }
    
    return 'ALERTA';
  }
}

export class SensorManager {
  private sensors: Map<string, Sensor> = new Map();
  
  addSensor(name: string, config: SensorConfig): void {
    this.sensors.set(name, new Sensor(name, config));
  }
  
  getSensor(name: string): Sensor | undefined {
    return this.sensors.get(name);
  }
  
  getAllSensors(): Map<string, Sensor> {
    return this.sensors;
  }
  
  readAll(): Record<string, SensorValue> {
    const readings: Record<string, SensorValue> = {};
    
    this.sensors.forEach((sensor, name) => {
      readings[name] = sensor.read();
    });
    
    return readings;
  }
  
  setAllAutoMode(): void {
    this.sensors.forEach(sensor => sensor.setAutoMode());
  }
}
