import * as readline from 'readline';

export interface ISensorController {
  setSensorValue(sensorName: string, value: number): void;
  setAutoMode(): void;
  getSensorInfo(sensorName: string): { isManual: boolean; value: number } | null;
  getSensorNames(): string[];
  readAllSensors(): Record<string, any>;
  hasManualSensors(): boolean;
}

export class CLI {
  private rl: readline.Interface;
  private controller: ISensorController;
  
  constructor(controller: ISensorController) {
    this.controller = controller;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n> '
    });
    
    this.setupHandlers();
  }
  
  private setupHandlers(): void {
    this.rl.on('line', (line: string) => {
      this.handleCommand(line.trim());
      this.rl.prompt();
    });
  }
  
  private handleCommand(line: string): void {
    const [cmd, ...args] = line.toLowerCase().split(' ');
    
    switch (cmd) {
      case 'temp':
      case 'temperatura':
        this.setSensorValue('temperatura', args[0]);
        break;
        
      case 'luz':
      case 'luminosidade':
        this.setSensorValue('luminosidade', args[0]);
        break;
        
      case 'umidade':
        this.setSensorValue('umidade', args[0]);
        break;
        
      case 'solo':
      case 'umidade_solo':
        this.setSensorValue('umidade_solo', args[0]);
        break;
        
      case 'ph':
        this.setSensorValue('ph', args[0]);
        break;
        
      case 'pressao':
        this.setSensorValue('pressao', args[0]);
        break;
        
      case 'auto':
        this.setAutoMode();
        break;
        
      case 'status':
        this.showStatus();
        break;
        
      case 'help':
      case 'ajuda':
        this.showMenu();
        break;
        
      case 'exit':
      case 'sair':
        console.log('[INFO] Encerrando simulador...');
        process.exit(0);
        break;
        
      default:
        if (line) {
          console.log('[ERRO] Comando não reconhecido. Digite "help" para ver os comandos.');
        }
    }
  }
  
  private setSensorValue(sensorName: string, valueStr: string): void {
    if (!valueStr) {
      console.log(`[ERRO] Use: ${sensorName} <valor>`);
      return;
    }
    
    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      console.log('[ERRO] Valor inválido');
      return;
    }
    
    try {
      this.controller.setSensorValue(sensorName, value);
      const info = this.controller.getSensorInfo(sensorName);
      
      if (info) {
        const readings = this.controller.readAllSensors();
        const reading = readings[sensorName];
        console.log(`[OK] ${sensorName} = ${reading.valor}${reading.unidade} (${reading.status}) [MANUAL]`);
      }
    } catch (error: any) {
      console.log(`[ERRO] ${error.message}`);
    }
  }
  
  private setAutoMode(): void {
    this.controller.setAutoMode();
    console.log('[OK] Modo automático ativado para todos os sensores');
  }
  
  private showStatus(): void {
    const readings = this.controller.readAllSensors();
    
    console.log('\n[STATUS] Leituras atuais:');
    console.log('='.repeat(70));
    
    Object.entries(readings).forEach(([name, reading]) => {
      const info = this.controller.getSensorInfo(name);
      const mode = info?.isManual ? '[MANUAL]' : '[AUTO]';
      const status = reading.status.padEnd(8);
      const valor = `${reading.valor}${reading.unidade}`.padEnd(12);
      
      console.log(`  ${name.padEnd(20)} ${valor} ${status} ${mode}`);
    });
    
    console.log('='.repeat(70));
  }
  
  showMenu(): void {
    console.log('\n' + '='.repeat(70));
    console.log('ARDUINO SIMULADO - CONTROLE INTERATIVO');
    console.log('='.repeat(70));
    console.log('Comandos disponíveis:');
    console.log('  temp <valor>          - Define temperatura manual (ex: temp 32)');
    console.log('  luz <valor>           - Define luminosidade manual (ex: luz 450)');
    console.log('  umidade <valor>       - Define umidade do ar (ex: umidade 65)');
    console.log('  solo <valor>          - Define umidade do solo (ex: solo 75)');
    console.log('  ph <valor>            - Define pH do solo (ex: ph 6.5)');
    console.log('  pressao <valor>       - Define pressão (ex: pressao 1013)');
    console.log('  auto                  - Volta ao modo automático (aleatório)');
    console.log('  status                - Mostra valores atuais');
    console.log('  help                  - Mostra este menu');
    console.log('  exit                  - Sai do programa');
    console.log('='.repeat(70));
    
    const sensorNames = this.controller.getSensorNames();
    const manualSensors = sensorNames.filter(name => {
      const info = this.controller.getSensorInfo(name);
      return info?.isManual;
    });
    
    if (manualSensors.length > 0) {
      console.log(`Sensores em modo MANUAL: ${manualSensors.join(', ')}`);
    } else {
      console.log('Modo atual: AUTOMÁTICO (todos os sensores)');
    }
    console.log('='.repeat(70));
  }
  
  start(): void {
    this.showMenu();
    this.rl.prompt();
  }
  
  prompt(): void {
    this.rl.prompt();
  }
}
