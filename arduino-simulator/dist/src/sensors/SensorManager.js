"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorManager = exports.Sensor = void 0;
class Sensor {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.manualMode = false;
        this.manualValue = (config.min + config.max) / 2;
    }
    getName() {
        return this.name;
    }
    setManualValue(value) {
        this.manualMode = true;
        this.manualValue = value;
    }
    setAutoMode() {
        this.manualMode = false;
    }
    isManual() {
        return this.manualMode;
    }
    getCurrentValue() {
        return this.manualMode ? this.manualValue : this.generateValue();
    }
    generateValue() {
        const range = this.config.max - this.config.min;
        const value = this.config.min + Math.random() * range;
        // pH tem precisão de 1 casa decimal, outros 2
        const precision = this.config.unidade === '' ? 1 :
            (this.config.unidade === 'hPa' ? 0 : 1);
        return Number(value.toFixed(precision));
    }
    read() {
        const valor = this.getCurrentValue();
        const status = this.getStatus(valor);
        return {
            valor,
            status,
            timestamp: Date.now(),
            unidade: this.config.unidade
        };
    }
    getStatus(value) {
        const { okMin, okMax, alertaMin, alertaMax } = this.config;
        // Se não tem limites definidos, sempre OK
        if (okMin === undefined || okMax === undefined) {
            return 'OK';
        }
        // Dentro da faixa OK
        if (value >= okMin && value <= okMax) {
            return 'OK';
        }
        // Fora dos limites críticos
        if (alertaMin !== undefined && alertaMax !== undefined) {
            if (value < alertaMin || value > alertaMax) {
                return 'CRITICO';
            }
        }
        // Entre OK e CRÍTICO = ALERTA
        return 'ALERTA';
    }
}
exports.Sensor = Sensor;
class SensorManager {
    constructor() {
        this.sensors = new Map();
    }
    addSensor(name, config) {
        this.sensors.set(name, new Sensor(name, config));
    }
    getSensor(name) {
        return this.sensors.get(name);
    }
    getAllSensors() {
        return this.sensors;
    }
    readAll() {
        const readings = {};
        this.sensors.forEach((sensor, name) => {
            readings[name] = sensor.read();
        });
        return readings;
    }
    setAllAutoMode() {
        this.sensors.forEach(sensor => sensor.setAutoMode());
    }
}
exports.SensorManager = SensorManager;
