import { ISensorBoard } from '../interfaces/ISensorBoard';
import { IDataPublisher } from '../interfaces/IDataPublisher';
import { CLI } from '../cli/CLI';
import { Payload, Painel, Status, SensorValue } from '../types';
import { CONFIG } from '../config';

export class SensorController {
  private intervalId?: NodeJS.Timeout;
  private cli: CLI;
  
  constructor(
    private sensorBoard: ISensorBoard,
    private dataPublisher: IDataPublisher
  ) {
    this.cli = new CLI(this);
  }
  
  async start(): Promise<void> {
    console.log('[INFO] Iniciando Controlador de Sensores...');
    console.log('[INFO] Conectando ao serviço de publicação...');
    
    // Inicializar placa de sensores
    await this.sensorBoard.initialize();
    
    // Aguardar e testar conexão com publicador
    await this.waitAndTestConnection();
    
    // Iniciar CLI
    this.cli.start();
    
    // Iniciar envio periódico
    this.startPeriodicSending();
    
    // Escutar comandos
    this.listenToCommands();
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  setSensorValue(sensorName: string, value: number): void {
    this.sensorBoard.setSensorValue(sensorName, value);
  }
  
  setAutoMode(): void {
    this.sensorBoard.setAutoMode();
  }
  
  getSensorInfo(sensorName: string): { isManual: boolean; value: number } | null {
    return this.sensorBoard.getSensorInfo(sensorName);
  }
  
  getSensorNames(): string[] {
    return this.sensorBoard.getSensorNames();
  }
  
  readAllSensors(): Record<string, SensorValue> {
    return this.sensorBoard.readAllSensors();
  }
  
  hasManualSensors(): boolean {
    return this.sensorBoard.hasManualSensors();
  }
  
  promptCLI(): void {
    this.cli.prompt();
  }
  
  private async waitAndTestConnection(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const connected = await this.dataPublisher.testConnection();
    
    if (!connected) {
      console.log('\n[ERRO] Não foi possível conectar ao serviço de publicação.');
      console.log('[INFO] Corrija as configurações e tente novamente.\n');
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
      const readings = this.sensorBoard.readAllSensors();
      const payload = this.buildPayload(readings);
      
      await this.dataPublisher.sendSensorData(payload);
      
      const mode = this.hasManualSensors() ? '[MANUAL]' : '[AUTO]';
      console.log(`${mode} Enviado - Painel: ${payload.painel}`);
      console.log(`  Temp: ${readings.temperatura.valor}°C (${readings.temperatura.status}) | ` +
        `Luz: ${readings.luminosidade.valor}lux (${readings.luminosidade.status}) | ` +
        `Umid: ${readings.umidade.valor}% (${readings.umidade.status})`);
      console.log(`  Solo: ${readings.umidade_solo.valor}% (${readings.umidade_solo.status}) | ` +
        `pH: ${readings.ph.valor} (${readings.ph.status}) | ` +
        `Pressão: ${readings.pressao.valor}hPa (${readings.pressao.status})`);
      
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
  
  private listenToCommands(): void {
    this.dataPublisher.onCommand(async (cmd) => {
      if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
        console.log(`\n[COMANDO] Recebido: forçar painel ${cmd.forcar_estado}`);
        await this.dataPublisher.forcePanelState(cmd.forcar_estado);
      } else {
        console.log('\n[COMANDO] Recebido: modo AUTO');
        await this.dataPublisher.clearForcedPanel();
      }
      this.cli.prompt();
    });
  }
}
