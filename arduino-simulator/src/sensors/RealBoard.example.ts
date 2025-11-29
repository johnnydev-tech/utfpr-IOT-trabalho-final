// src/sensors/RealBoard.example.ts
import { ISensorBoard } from '../interfaces/ISensorBoard';
import { SensorValue, Status } from '../types';

/**
 * EXEMPLO de implementação real de hardware Arduino
 * 
 * Para usar:
 * 1. Renomeie para RealBoard.ts
 * 2. Implemente a lógica real de leitura dos sensores
 * 3. No index.ts, substitua VirtualBoard por RealBoard
 * 
 * Não precisa mudar mais nada no código!
 */
export class RealBoard implements ISensorBoard {
  private ready: boolean = false;
  private sensorData: Map<string, number> = new Map();
  
  async initialize(): Promise<void> {
    console.log('[INFO] Inicializando hardware Arduino real...');
    
    // TODO: Implementar inicialização do Arduino real
    // Exemplo: conectar com johnny-five usando serialport real
    // const board = new Board({ port: '/dev/ttyUSB0' });
    // await new Promise(resolve => board.on('ready', resolve));
    
    this.ready = true;
    console.log('[OK] Hardware real inicializado!');
  }
  
  isReady(): boolean {
    return this.ready;
  }
  
  readAllSensors(): Record<string, SensorValue> {
    if (!this.ready) {
      throw new Error('Board não está pronta');
    }
    
    // TODO: Implementar leitura real dos sensores
    // Exemplo com johnny-five:
    // const temp = new Temperature({ controller: "LM35", pin: "A0" });
    // const light = new Sensor({ pin: "A1" });
    // etc...
    
    return {
      temperatura: this.readTemperature(),
      luminosidade: this.readLight(),
      umidade: this.readHumidity(),
      umidade_solo: this.readSoilMoisture(),
      ph: this.readPH(),
      pressao: this.readPressure()
    };
  }
  
  setSensorValue(sensorName: string, value: number): void {
    // Em hardware real, isso pode ser ignorado ou usado para calibração
    console.log(`[AVISO] setSensorValue não aplicável em hardware real`);
  }
  
  setAutoMode(): void {
    // Em hardware real, sempre está em modo auto
    console.log('[INFO] Hardware real sempre opera em modo automático');
  }
  
  hasManualSensors(): boolean {
    return false; // Hardware real não tem modo manual
  }
  
  getSensorNames(): string[] {
    return ['temperatura', 'luminosidade', 'umidade', 'umidade_solo', 'ph', 'pressao'];
  }
  
  getSensorInfo(sensorName: string): { isManual: boolean; value: number } | null {
    const data = this.sensorData.get(sensorName);
    if (data === undefined) return null;
    
    return {
      isManual: false,
      value: data
    };
  }
  
  // Métodos privados de leitura - IMPLEMENTAR COM HARDWARE REAL
  
  private readTemperature(): SensorValue {
    // TODO: Ler sensor real (ex: LM35, DHT22)
    const valor = 25.0; // placeholder
    return {
      valor,
      status: this.getTemperatureStatus(valor),
      timestamp: Date.now(),
      unidade: '°C'
    };
  }
  
  private readLight(): SensorValue {
    // TODO: Ler sensor real (ex: LDR, BH1750)
    const valor = 500;
    return {
      valor,
      status: this.getLightStatus(valor),
      timestamp: Date.now(),
      unidade: 'lux'
    };
  }
  
  private readHumidity(): SensorValue {
    // TODO: Ler sensor real (ex: DHT22)
    const valor = 60;
    return {
      valor,
      status: this.getHumidityStatus(valor),
      timestamp: Date.now(),
      unidade: '%'
    };
  }
  
  private readSoilMoisture(): SensorValue {
    // TODO: Ler sensor real (ex: Capacitive Soil Moisture)
    const valor = 70;
    return {
      valor,
      status: this.getSoilMoistureStatus(valor),
      timestamp: Date.now(),
      unidade: '%'
    };
  }
  
  private readPH(): SensorValue {
    // TODO: Ler sensor real (ex: PH-4502C)
    const valor = 6.8;
    return {
      valor,
      status: this.getPHStatus(valor),
      timestamp: Date.now(),
      unidade: ''
    };
  }
  
  private readPressure(): SensorValue {
    // TODO: Ler sensor real (ex: BMP280)
    const valor = 1013;
    return {
      valor,
      status: this.getPressureStatus(valor),
      timestamp: Date.now(),
      unidade: 'hPa'
    };
  }
  
  // Métodos de status (podem ser movidos para utils)
  
  private getTemperatureStatus(value: number): Status {
    if (value < 18 || value > 35) return 'CRITICO';
    if (value < 20 || value > 30) return 'ALERTA';
    return 'OK';
  }
  
  private getLightStatus(value: number): Status {
    if (value < 300 || value > 900) return 'CRITICO';
    if (value < 400 || value > 800) return 'ALERTA';
    return 'OK';
  }
  
  private getHumidityStatus(value: number): Status {
    if (value < 40 || value > 85) return 'CRITICO';
    if (value < 50 || value > 70) return 'ALERTA';
    return 'OK';
  }
  
  private getSoilMoistureStatus(value: number): Status {
    if (value < 40 || value > 90) return 'CRITICO';
    if (value < 60 || value > 80) return 'ALERTA';
    return 'OK';
  }
  
  private getPHStatus(value: number): Status {
    if (value < 5.0 || value > 8.5) return 'CRITICO';
    if (value < 5.8 || value > 8.0) return 'ALERTA';
    return 'OK';
  }
  
  private getPressureStatus(value: number): Status {
    if (value < 980 || value > 1040) return 'CRITICO';
    if (value < 1000 || value > 1025) return 'ALERTA';
    return 'OK';
  }
}
