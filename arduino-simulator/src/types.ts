// src/types.ts
export type Status = 'OK' | 'ALERTA' | 'CRITICO';
export type Painel = 'VERDE' | 'AMARELO' | 'VERMELHO';

export interface SensorValue {
  valor: number;
  status: Status;
  timestamp: number;
  unidade: string;
}

export interface Payload {
  temperatura: SensorValue;
  luminosidade: SensorValue;
  umidade: SensorValue;
  umidade_solo: SensorValue;
  ph: SensorValue;
  pressao: SensorValue;
  painel: Painel;
  timestamp: number;
}

export interface Command {
  forcar_estado: Painel | 'AUTO';
}

export interface SensorConfig {
  min: number;
  max: number;
  okMin?: number;
  okMax?: number;
  alertaMin?: number;
  alertaMax?: number;
  unidade: string;
}

export interface SimulatorConfig {
  updateInterval: number;
  sensors: {
    temperatura: SensorConfig;
    luminosidade: SensorConfig;
    umidade: SensorConfig;
    umidade_solo: SensorConfig;
    ph: SensorConfig;
    pressao: SensorConfig;
  };
}
