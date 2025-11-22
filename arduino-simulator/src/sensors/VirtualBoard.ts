// src/sensors/VirtualBoard.ts
import { SensorManager } from './SensorManager';
import { CONFIG } from '../config';

/**
 * VirtualBoard simula um Arduino com johnny-five
 */
export class VirtualBoard {
  private sensorManager: SensorManager;
  private ready: boolean = false;
  
  constructor() {
    this.sensorManager = new SensorManager();
    this.initializeSensors();
  }
  
  private initializeSensors(): void {
    // Adicionar todos os sensores do config
    Object.entries(CONFIG.sensors).forEach(([name, config]) => {
      this.sensorManager.addSensor(name, config);
    });
  }
  
  async initialize(): Promise<void> {
    console.log('[INFO] Inicializando Virtual Board...');
    
    // Simula inicialização do Arduino
    return new Promise((resolve) => {
      setTimeout(() => {
        this.ready = true;
        console.log('[OK] Virtual Board pronta!');
        console.log('[INFO] Sensores disponíveis:', 
          Array.from(this.sensorManager.getAllSensors().keys()).join(', '));
        resolve();
      }, 500);
    });
  }
  
  isReady(): boolean {
    return this.ready;
  }
  
  getSensorManager(): SensorManager {
    return this.sensorManager;
  }
  
  readAllSensors(): Record<string, any> {
    if (!this.ready) {
      throw new Error('Board não está pronta');
    }
    
    return this.sensorManager.readAll();
  }
}

/**
 * Exemplo de como seria com johnny-five real:
 * 
 * import * as five from 'johnny-five';
 * 
 * export class RealBoard {
 *   private board: five.Board;
 *   private temperature: five.Thermometer;
 *   private light: five.Sensor;
 *   
 *   async initialize(): Promise<void> {
 *     return new Promise((resolve) => {
 *       this.board = new five.Board();
 *       
 *       this.board.on('ready', () => {
 *         // Temperatura - sensor DHT22 ou DS18B20
 *         this.temperature = new five.Thermometer({
 *           controller: 'DHT22',
 *           pin: 2
 *         });
 *         
 *         // Luminosidade - sensor LDR
 *         this.light = new five.Sensor({
 *           pin: 'A0',
 *           freq: 1000
 *         });
 *         
 *         // pH sensor
 *         this.ph = new five.Sensor({
 *           pin: 'A1',
 *           freq: 1000
 *         });
 *         
 *         resolve();
 *       });
 *     });
 *   }
 *   
 *   readTemperature(): number {
 *     return this.temperature.celsius;
 *   }
 *   
 *   readLight(): number {
 *     return this.light.value;
 *   }
 * }
 */
