// arduino-simulado.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase, DataSnapshot } from 'firebase-admin/database';
import { Board, Sensor } from 'johnny-five';
const Firmata = require('mock-firmata');

// Definição de tipos
type Status = 'OK' | 'ALERTA' | 'CRITICO';
type Painel = 'VERDE' | 'AMARELO' | 'VERMELHO';
interface SensorValue {
  valor: number;
  status: Status;
  timestamp: number;
}
interface Payload {
  temperatura: SensorValue;
  luminosidade: SensorValue;
  painel: Painel;
  timestamp: number;
}
interface Command {
  forcar_estado: Painel | 'AUTO';
}

// Inicializar Firebase Admin (use sua chave JSON)
import * as serviceAccount from './serviceAccountKey.json';
initializeApp({ credential: cert(serviceAccount as any), databaseURL: 'https://utfpr-iot-trabalho-final.firebaseio.com' });
const db = getDatabase();

const board = new Board({ io: new Firmata(), repl: false });

board.on('ready', () => {
  console.log('Arduino simulado pronto');

  const sensorTemp = new Sensor({ pin: 'A0', freq: 2000 });
  const sensorLuz = new Sensor({ pin: 'A1', freq: 2000 });

  // Simulação simples: atualizar valores manualmente a cada tick
  setInterval(() => {
    // temperatura aleatória 22 - 38
    const tempVal: number = Number((22 + Math.random() * 16).toFixed(1));
    // luminosidade 200 - 900
    const luzVal: number = Math.round(200 + Math.random() * 700);

    const tempStatus: Status = getTempStatus(tempVal);
    const luzStatus: Status = getLuzStatus(luzVal);

    const painel: Painel = consolidatePanel(tempStatus, luzStatus);
    const now: number = Date.now();

    const payload: Payload = {
      temperatura: { valor: tempVal, status: tempStatus, timestamp: now },
      luminosidade: { valor: luzVal, status: luzStatus, timestamp: now },
      painel,
      timestamp: now
    };

    db.ref('/agro/algodao/sensores').set(payload);
    console.log('Enviado:', payload);
  }, 2000);

  // Escutar comandos do app
  db.ref('/agro/algodao/comandos').on('value', (snap: DataSnapshot) => {
    const cmd: Command | null = snap.val();
    if (!cmd) return;
    if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
      console.log('Comando recebido: forcar', cmd.forcar_estado);
      // implementar lógica de forçar painel — por simplicidade apenas logamos
      // Você pode setar um campo /agro/algodao/sensores/painel_forcado
      db.ref('/agro/algodao/sensores/painel_forcado').set({ estado: cmd.forcar_estado, timestamp: Date.now() });
    } else {
      console.log('Modo AUTO');
      db.ref('/agro/algodao/sensores/painel_forcado').remove();
    }
  });
});

function getTempStatus(v: number): Status {
  if (v < 30) return 'OK';
  if (v <= 35) return 'ALERTA';
  return 'CRITICO';
}

function getLuzStatus(v: number): Status {
  if (v >= 400 && v <= 800) return 'OK';
  if ((v >= 300 && v < 400) || (v > 800 && v <= 900)) return 'ALERTA';
  return 'CRITICO';
}

function consolidatePanel(tempStatus: Status, luzStatus: Status): Painel {
  // prioridade: CRITICO > ALERTA > OK
  if (tempStatus === 'CRITICO' || luzStatus === 'CRITICO') return 'VERMELHO';
  if (tempStatus === 'ALERTA' || luzStatus === 'ALERTA') return 'AMARELO';
  return 'VERDE';
}
