import { Board, Sensor, Thermometer } from 'johnny-five';
import { SensorManager } from './SensorManager';
import { CONFIG } from '../config';
import { ISensorBoard } from '../interfaces/ISensorBoard';
import { SensorValue } from '../types';

export class VirtualBoard implements ISensorBoard {
  private board: Board;
  private sensorManager: SensorManager;
  private ready: boolean = false;
  private j5Sensors: {
    temperatura?: Thermometer;
    luminosidade?: Sensor;
    umidade?: Sensor;
    umidade_solo?: Sensor;
    ph?: Sensor;
    pressao?: Sensor;
  } = {};
  
  constructor() {
    this.sensorManager = new SensorManager();
    this.initializeSensors();
    
    const { Firmata } = require('mock-firmata');
    
    this.board = new Board({
      io: new Firmata(),
      repl: false,
      debug: false
    });
  }
  
  private initializeSensors(): void {
    Object.entries(CONFIG.sensors).forEach(([name, config]) => {
      this.sensorManager.addSensor(name, config);
    });
  }
  
  private initializeJ5Sensors(): void {
    this.j5Sensors.temperatura = new Thermometer({
      controller: 'LM35',
      pin: 'A0',
      freq: 1000
    });
    
    this.j5Sensors.luminosidade = new Sensor({
      pin: 'A1',
      freq: 1000
    });
    
    this.j5Sensors.umidade = new Sensor({
      pin: 'A2',
      freq: 1000
    });
    
    this.j5Sensors.umidade_solo = new Sensor({
      pin: 'A3',
      freq: 1000
    });
    
    this.j5Sensors.ph = new Sensor({
      pin: 'A4',
      freq: 1000
    });
    
    this.j5Sensors.pressao = new Sensor({
      pin: 'A5',
      freq: 1000
    });
    
    this.setupSensorListeners();
  }
  
  private setupSensorListeners(): void {
    if (this.j5Sensors.temperatura) {
      this.j5Sensors.temperatura.on('change', () => {
        const tempConfig = CONFIG.sensors.temperatura;
        const rawValue = this.j5Sensors.temperatura!.celsius;
        const scaledValue = this.scaleValue(rawValue, 0, 100, tempConfig.min, tempConfig.max);
        const sensor = this.sensorManager.getSensor('temperatura');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
    
    if (this.j5Sensors.luminosidade) {
      this.j5Sensors.luminosidade.on('change', () => {
        const luzConfig = CONFIG.sensors.luminosidade;
        const rawValue = this.j5Sensors.luminosidade!.value;
        const scaledValue = this.scaleValue(rawValue, 0, 1023, luzConfig.min, luzConfig.max);
        const sensor = this.sensorManager.getSensor('luminosidade');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
    
    if (this.j5Sensors.umidade) {
      this.j5Sensors.umidade.on('change', () => {
        const umidConfig = CONFIG.sensors.umidade;
        const rawValue = this.j5Sensors.umidade!.value;
        const scaledValue = this.scaleValue(rawValue, 0, 1023, umidConfig.min, umidConfig.max);
        const sensor = this.sensorManager.getSensor('umidade');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
    
    if (this.j5Sensors.umidade_solo) {
      this.j5Sensors.umidade_solo.on('change', () => {
        const soloConfig = CONFIG.sensors.umidade_solo;
        const rawValue = this.j5Sensors.umidade_solo!.value;
        const scaledValue = this.scaleValue(rawValue, 0, 1023, soloConfig.min, soloConfig.max);
        const sensor = this.sensorManager.getSensor('umidade_solo');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
    
    if (this.j5Sensors.ph) {
      this.j5Sensors.ph.on('change', () => {
        const phConfig = CONFIG.sensors.ph;
        const rawValue = this.j5Sensors.ph!.value;
        const scaledValue = this.scaleValue(rawValue, 0, 1023, phConfig.min, phConfig.max);
        const sensor = this.sensorManager.getSensor('ph');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
    
    if (this.j5Sensors.pressao) {
      this.j5Sensors.pressao.on('change', () => {
        const pressaoConfig = CONFIG.sensors.pressao;
        const rawValue = this.j5Sensors.pressao!.value;
        const scaledValue = this.scaleValue(rawValue, 0, 1023, pressaoConfig.min, pressaoConfig.max);
        const sensor = this.sensorManager.getSensor('pressao');
        if (sensor && !sensor.isManual()) {
          sensor.setManualValue(scaledValue);
        }
      });
    }
  }
  
  private scaleValue(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    const scaled = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    const precision = outMax < 20 ? 1 : (outMax < 100 ? 1 : 0);
    return Number(scaled.toFixed(precision));
  }
  
  async initialize(): Promise<void> {
    console.log('[INFO] Inicializando Johnny-Five Board (mock-firmata)...');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!this.ready) {
          console.log('[AVISO] Johnny-Five não respondeu, usando modo simulado puro');
          this.ready = true;
          console.log('[OK] Virtual Board pronta!');
          console.log('[INFO] Sensores disponíveis:', 
            Array.from(this.sensorManager.getAllSensors().keys()).join(', '));
          resolve();
        }
      }, 3000);
      
      this.board.on('ready', () => {
        clearTimeout(timeout);
        this.ready = true;
        console.log('[OK] Johnny-Five Board pronta!');
        console.log('[INFO] Modo: Simulação (mock-firmata)');
        console.log('[INFO] Inicializando sensores Johnny-Five...');
        this.initializeJ5Sensors();
        console.log('[INFO] Sensores disponíveis:', 
          Array.from(this.sensorManager.getAllSensors().keys()).join(', '));
        resolve();
      });
      
      this.board.on('error', (error) => {
        clearTimeout(timeout);
        console.error('[ERRO] Falha ao inicializar board:', error);
        this.ready = true;
        console.log('[OK] Board em modo simulado (fallback)');
        resolve();
      });
    });
  }
  
  isReady(): boolean {
    return this.ready;
  }
  
  readAllSensors(): Record<string, SensorValue> {
    if (!this.ready) {
      throw new Error('Board não está pronta');
    }
    
    return this.sensorManager.readAll();
  }
  
  setSensorValue(sensorName: string, value: number): void {
    const sensor = this.sensorManager.getSensor(sensorName);
    if (!sensor) {
      throw new Error(`Sensor "${sensorName}" não encontrado`);
    }
    sensor.setManualValue(value);
  }
  
  setAutoMode(): void {
    this.sensorManager.setAllAutoMode();
  }
  
  hasManualSensors(): boolean {
    return Array.from(this.sensorManager.getAllSensors().values())
      .some(sensor => sensor.isManual());
  }
  
  getSensorNames(): string[] {
    return Array.from(this.sensorManager.getAllSensors().keys());
  }
  
  getSensorInfo(sensorName: string): { isManual: boolean; value: number } | null {
    const sensor = this.sensorManager.getSensor(sensorName);
    if (!sensor) {
      return null;
    }
    return {
      isManual: sensor.isManual(),
      value: sensor.getCurrentValue()
    };
  }
  
  getBoard(): Board {
    return this.board;
  }
  
  getSensorManager(): SensorManager {
    return this.sensorManager;
  }
}
