// src/sensors/VirtualBoard.ts
import { Board } from 'johnny-five';
import { SensorManager } from './SensorManager';
import { CONFIG } from '../config';

/**
 * VirtualBoard usa johnny-five com mock-firmata para simular Arduino
 */
export class VirtualBoard {
  private board: Board;
  private sensorManager: SensorManager;
  private ready: boolean = false;
  
  constructor() {
    this.sensorManager = new SensorManager();
    this.initializeSensors();
    
    // Inicializa Johnny-Five com mock-firmata (simulação)
    const { Firmata } = require('mock-firmata');
    
    this.board = new Board({
      io: new Firmata(),
      repl: false,
      debug: false
    });
  }
  
  private initializeSensors(): void {
    // Adicionar todos os sensores do config
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
  
  getSensorManager(): SensorManager {
    return this.sensorManager;
  }
  
  readAllSensors(): Record<string, any> {
    if (!this.ready) {
      throw new Error('Board não está pronta');
    }
    
    return this.sensorManager.readAll();
  }
  
  getBoard(): Board {
    return this.board;
  }
}
