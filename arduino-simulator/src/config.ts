// src/config.ts
import { SimulatorConfig } from './types';

export const CONFIG: SimulatorConfig = {
  updateInterval: 5000, // 2 segundos
  
  sensors: {
    // Temperatura (°C) - Ideal para algodão: 20-30°C
    temperatura: {
      min: 15,
      max: 42,
      okMin: 20,
      okMax: 30,
      alertaMin: 18,
      alertaMax: 35,
      unidade: '°C'
    },
    
    // Luminosidade (lux) - Algodão precisa alta luminosidade
    luminosidade: {
      min: 100,
      max: 1000,
      okMin: 400,
      okMax: 800,
      alertaMin: 300,
      alertaMax: 900,
      unidade: 'lux'
    },
    
    // Umidade do ar (%) - Ideal: 50-70%
    umidade: {
      min: 30,
      max: 95,
      okMin: 50,
      okMax: 70,
      alertaMin: 40,
      alertaMax: 85,
      unidade: '%'
    },
    
    // Umidade do solo (%) - Ideal: 60-80%
    umidade_solo: {
      min: 20,
      max: 100,
      okMin: 60,
      okMax: 80,
      alertaMin: 40,
      alertaMax: 90,
      unidade: '%'
    },
    
    // pH do solo - Ideal para algodão: 5.8-8.0
    ph: {
      min: 4.0,
      max: 9.0,
      okMin: 5.8,
      okMax: 8.0,
      alertaMin: 5.0,
      alertaMax: 8.5,
      unidade: ''
    },
    
    // Pressão atmosférica (hPa) - Normal: 1013 hPa
    pressao: {
      min: 950,
      max: 1050,
      okMin: 1000,
      okMax: 1025,
      alertaMin: 980,
      alertaMax: 1040,
      unidade: 'hPa'
    }
  }
};

export const FIREBASE_CONFIG = {
  databaseURL: 'https://utfpr-iot-trabalho-final-default-rtdb.firebaseio.com',
  paths: {
    sensores: '/agro/algodao/sensores',
    comandos: '/agro/algodao/comandos'
  }
};
