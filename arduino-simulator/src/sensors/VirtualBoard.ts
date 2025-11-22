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
    this.board = new Board({
      io: require('mock-firmata'),
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
      this.board.on('ready', () => {
        this.ready = true;
        console.log('[OK] Johnny-Five Board pronta!');
        console.log('[INFO] Modo: Simulação (mock-firmata)');
        console.log('[INFO] Sensores disponíveis:', 
          Array.from(this.sensorManager.getAllSensors().keys()).join(', '));
        resolve();
      });
      
      this.board.on('error', (error) => {
        console.error('[ERRO] Falha ao inicializar board:', error);
        // Fallback para modo simulado puro
        setTimeout(() => {
          this.ready = true;
          console.log('[OK] Board em modo simulado (fallback)');
          resolve();
        }, 500);
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

/**
 * Para usar com Arduino físico, remova mock-firmata do constructor:
 * 
 * constructor() {
 *   this.sensorManager = new SensorManager();
 *   this.initializeSensors();
 *   
 *   // Johnny-Five detectará automaticamente o Arduino conectado via USB
 *   this.board = new Board({
 *     repl: false,
 *     debug: false
 *   });
 * }
 * 
 * E no método ready, configure os sensores reais:
 * 
 * this.board.on('ready', () => {
 *   // DHT22 - Temperatura e Umidade (pin 2)
 *   const tempHumidity = new Thermometer({
 *     controller: 'DHT22',
 *     pin: 2,
 *     freq: 2000
 *   });
 *   
 *   tempHumidity.on('data', () => {
 *     this.sensorManager.setSensorValue('temperatura', tempHumidity.celsius);
 *     this.sensorManager.setSensorValue('umidade', tempHumidity.relativeHumidity);
 *   });
 *   
 *   // LDR - Sensor de Luminosidade (pin A0)
 *   const light = new Sensor({
 *     pin: 'A0',
 *     freq: 2000
 *   });
 *   
 *   light.on('data', () => {
 *     // Converter valor do sensor (0-1023) para lux
 *     const lux = (light.value / 1023) * 1000;
 *     this.sensorManager.setSensorValue('luminosidade', lux);
 *   });
 *   
 *   // Sensor de Umidade do Solo (pin A1)
 *   const soilMoisture = new Sensor({
 *     pin: 'A1',
 *     freq: 2000
 *   });
 *   
 *   soilMoisture.on('data', () => {
 *     // Converter para percentual
 *     const moisture = (soilMoisture.value / 1023) * 100;
 *     this.sensorManager.setSensorValue('umidade_solo', moisture);
 *   });
 *   
 *   // pH Sensor (pin A2)
 *   const ph = new Sensor({
 *     pin: 'A2',
 *     freq: 2000
 *   });
 *   
 *   ph.on('data', () => {
 *     // Converter valor para pH (0-14)
 *     const phValue = (ph.value / 1023) * 14;
 *     this.sensorManager.setSensorValue('ph', phValue);
 *   });
 *   
 *   // Barômetro BMP280 - Pressão Atmosférica (I2C)
 *   const barometer = new Barometer({
 *     controller: 'BMP280',
 *     freq: 2000
 *   });
 *   
 *   barometer.on('data', () => {
 *     this.sensorManager.setSensorValue('pressao', barometer.pressure);
 *   });
 *   
 *   this.ready = true;
 * });
 */
