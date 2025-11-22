// src/cli/CLI.ts
import * as readline from 'readline';
import { VirtualBoard } from '../sensors/VirtualBoard';

export class CLI {
  private rl: readline.Interface;
  private board: VirtualBoard;
  
  constructor(board: VirtualBoard) {
    this.board = board;
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
    const manager = this.board.getSensorManager();
    const sensor = manager.getSensor(sensorName);
    
    if (!sensor) {
      console.log(`[ERRO] Sensor "${sensorName}" não encontrado`);
      return;
    }
    
    if (!valueStr) {
      console.log(`[ERRO] Use: ${sensorName} <valor>`);
      return;
    }
    
    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      console.log('[ERRO] Valor inválido');
      return;
    }
    
    sensor.setManualValue(value);
    const reading = sensor.read();
    console.log(`[OK] ${sensorName} = ${reading.valor}${reading.unidade} (${reading.status}) [MANUAL]`);
  }
  
  private setAutoMode(): void {
    const manager = this.board.getSensorManager();
    manager.setAllAutoMode();
    console.log('[OK] Modo automático ativado para todos os sensores');
  }
  
  private showStatus(): void {
    const manager = this.board.getSensorManager();
    const readings = manager.readAll();
    
    console.log('\n[STATUS] Leituras atuais:');
    console.log('='.repeat(70));
    
    Object.entries(readings).forEach(([name, reading]) => {
      const sensor = manager.getSensor(name);
      const mode = sensor?.isManual() ? '[MANUAL]' : '[AUTO]';
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
    
    const manager = this.board.getSensorManager();
    const manualSensors = Array.from(manager.getAllSensors().entries())
      .filter(([_, sensor]) => sensor.isManual())
      .map(([name]) => name);
    
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
