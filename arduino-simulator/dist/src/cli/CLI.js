"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
// src/cli/CLI.ts
const readline = __importStar(require("readline"));
class CLI {
    constructor(board) {
        this.board = board;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n> '
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.rl.on('line', (line) => {
            this.handleCommand(line.trim());
            this.rl.prompt();
        });
    }
    handleCommand(line) {
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
    setSensorValue(sensorName, valueStr) {
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
    setAutoMode() {
        const manager = this.board.getSensorManager();
        manager.setAllAutoMode();
        console.log('[OK] Modo automático ativado para todos os sensores');
    }
    showStatus() {
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
    showMenu() {
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
        }
        else {
            console.log('Modo atual: AUTOMÁTICO (todos os sensores)');
        }
        console.log('='.repeat(70));
    }
    start() {
        this.showMenu();
        this.rl.prompt();
    }
    prompt() {
        this.rl.prompt();
    }
}
exports.CLI = CLI;
