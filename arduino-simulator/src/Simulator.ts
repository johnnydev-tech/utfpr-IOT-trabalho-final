// src/Simulator.ts
import { VirtualBoard } from './sensors/VirtualBoard';
import { FirebaseClient } from './firebase/FirebaseClient';
import { CLI } from './cli/CLI';
import { Payload, Painel, Status, SensorValue } from './types';
import { CONFIG } from './config';

export class Simulator {
  private board: VirtualBoard;
  private firebase: FirebaseClient;
  private cli: CLI;
  private intervalId?: NodeJS.Timeout;
  
  constructor() {
    this.board = new VirtualBoard();
    this.firebase = new FirebaseClient();
    this.cli = new CLI(this.board);
  }
  
  async start(): Promise<void> {
    console.log('[INFO] Iniciando Arduino Simulado...');
    console.log('[INFO] Conectando ao Firebase...');
    
    // Inicializar board virtual
    await this.board.initialize();
    
    // Aguardar e testar conexão Firebase
    await this.waitAndTestConnection();
    
    // Iniciar CLI
    this.cli.start();
    
    // Iniciar envio periódico
    this.startPeriodicSending();
    
    // Escutar comandos do Firebase
    this.listenToCommands();
  }
  
  private async waitAndTestConnection(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const connected = await this.firebase.testConnection();
    
    if (!connected) {
      console.log('\n[ERRO] Não foi possível conectar ao Firebase.');
      console.log('[INFO] Corrija as permissões e tente novamente.\n');
      process.exit(1);
    }
  }
  
  private startPeriodicSending(): void {
    this.intervalId = setInterval(() => {
      this.sendData();
    }, CONFIG.updateInterval);
    
    console.log(`[INFO] Enviando dados a cada ${CONFIG.updateInterval}ms\n`);
  }
  
  private async sendData(): Promise<void> {
    try {
      const readings = this.board.readAllSensors();
      const payload = this.buildPayload(readings);
      
      await this.firebase.sendSensorData(payload);
      
      const mode = this.hasManualSensors() ? '[MANUAL]' : '[AUTO]';
      console.log(`${mode} Enviado - Painel: ${payload.painel} | ` +
        `Temp: ${readings.temperatura.valor}°C (${readings.temperatura.status}) | ` +
        `Luz: ${readings.luminosidade.valor}lux (${readings.luminosidade.status}) | ` +
        `Umid: ${readings.umidade.valor}% (${readings.umidade.status})`
      );
      
    } catch (error: any) {
      console.error('[ERRO] Falha ao enviar dados:', error.message);
    }
  }
  
  private buildPayload(readings: Record<string, SensorValue>): Payload {
    const statuses = Object.values(readings).map(r => r.status);
    const painel = this.consolidatePanel(statuses);
    
    return {
      temperatura: readings.temperatura,
      luminosidade: readings.luminosidade,
      umidade: readings.umidade,
      umidade_solo: readings.umidade_solo,
      ph: readings.ph,
      pressao: readings.pressao,
      painel,
      timestamp: Date.now()
    };
  }
  
  private consolidatePanel(statuses: Status[]): Painel {
    if (statuses.some(s => s === 'CRITICO')) return 'VERMELHO';
    if (statuses.some(s => s === 'ALERTA')) return 'AMARELO';
    return 'VERDE';
  }
  
  private hasManualSensors(): boolean {
    const manager = this.board.getSensorManager();
    return Array.from(manager.getAllSensors().values())
      .some(sensor => sensor.isManual());
  }
  
  private listenToCommands(): void {
    this.firebase.onCommand(async (cmd) => {
      if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
        console.log(`\n[COMANDO] Recebido do app: forçar painel ${cmd.forcar_estado}`);
        await this.firebase.forcePanelState(cmd.forcar_estado);
      } else {
        console.log('\n[COMANDO] Recebido do app: modo AUTO');
        await this.firebase.clearForcedPanel();
      }
      this.cli.prompt();
    });
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
