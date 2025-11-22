"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulator = void 0;
// src/Simulator.ts
const VirtualBoard_1 = require("./sensors/VirtualBoard");
const FirebaseClient_1 = require("./firebase/FirebaseClient");
const CLI_1 = require("./cli/CLI");
const config_1 = require("./config");
class Simulator {
    constructor() {
        this.board = new VirtualBoard_1.VirtualBoard();
        this.firebase = new FirebaseClient_1.FirebaseClient();
        this.cli = new CLI_1.CLI(this.board);
    }
    async start() {
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
    async waitAndTestConnection() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const connected = await this.firebase.testConnection();
        if (!connected) {
            console.log('\n[ERRO] Não foi possível conectar ao Firebase.');
            console.log('[INFO] Corrija as permissões e tente novamente.\n');
            process.exit(1);
        }
    }
    startPeriodicSending() {
        this.intervalId = setInterval(() => {
            this.sendData();
        }, config_1.CONFIG.updateInterval);
        console.log(`[INFO] Enviando dados a cada ${config_1.CONFIG.updateInterval}ms\n`);
    }
    async sendData() {
        try {
            const readings = this.board.readAllSensors();
            const payload = this.buildPayload(readings);
            await this.firebase.sendSensorData(payload);
            const mode = this.hasManualSensors() ? '[MANUAL]' : '[AUTO]';
            console.log(`${mode} Enviado - Painel: ${payload.painel} | ` +
                `Temp: ${readings.temperatura.valor}°C (${readings.temperatura.status}) | ` +
                `Luz: ${readings.luminosidade.valor}lux (${readings.luminosidade.status}) | ` +
                `Umid: ${readings.umidade.valor}% (${readings.umidade.status})`);
        }
        catch (error) {
            console.error('[ERRO] Falha ao enviar dados:', error.message);
        }
    }
    buildPayload(readings) {
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
    consolidatePanel(statuses) {
        if (statuses.some(s => s === 'CRITICO'))
            return 'VERMELHO';
        if (statuses.some(s => s === 'ALERTA'))
            return 'AMARELO';
        return 'VERDE';
    }
    hasManualSensors() {
        const manager = this.board.getSensorManager();
        return Array.from(manager.getAllSensors().values())
            .some(sensor => sensor.isManual());
    }
    listenToCommands() {
        this.firebase.onCommand(async (cmd) => {
            if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
                console.log(`\n[COMANDO] Recebido do app: forçar painel ${cmd.forcar_estado}`);
                await this.firebase.forcePanelState(cmd.forcar_estado);
            }
            else {
                console.log('\n[COMANDO] Recebido do app: modo AUTO');
                await this.firebase.clearForcedPanel();
            }
            this.cli.prompt();
        });
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
exports.Simulator = Simulator;
