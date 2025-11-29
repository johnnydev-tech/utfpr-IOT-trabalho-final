import { Board } from 'johnny-five';
import { SensorManager } from './SensorManager';
import { CONFIG } from '../config';
import { ISensorBoard } from '../interfaces/ISensorBoard';
import { SensorValue } from '../types';

export class VirtualBoard implements ISensorBoard {
  private board: Board;
  private sensorManager: SensorManager;
  private ready: boolean = false;
  
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
