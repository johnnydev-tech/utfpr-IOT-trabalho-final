"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBoard = void 0;
// src/sensors/VirtualBoard.ts
const SensorManager_1 = require("./SensorManager");
const config_1 = require("../config");
/**
 * VirtualBoard simula um Arduino com johnny-five
 */
class VirtualBoard {
    constructor() {
        this.ready = false;
        this.sensorManager = new SensorManager_1.SensorManager();
        this.initializeSensors();
    }
    initializeSensors() {
        // Adicionar todos os sensores do config
        Object.entries(config_1.CONFIG.sensors).forEach(([name, config]) => {
            this.sensorManager.addSensor(name, config);
        });
    }
    async initialize() {
        console.log('[INFO] Inicializando Virtual Board...');
        // Simula inicialização do Arduino
        return new Promise((resolve) => {
            setTimeout(() => {
                this.ready = true;
                console.log('[OK] Virtual Board pronta!');
                console.log('[INFO] Sensores disponíveis:', Array.from(this.sensorManager.getAllSensors().keys()).join(', '));
                resolve();
            }, 500);
        });
    }
    isReady() {
        return this.ready;
    }
    getSensorManager() {
        return this.sensorManager;
    }
    readAllSensors() {
        if (!this.ready) {
            throw new Error('Board não está pronta');
        }
        return this.sensorManager.readAll();
    }
}
exports.VirtualBoard = VirtualBoard;
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
