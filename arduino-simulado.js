// arduino-simulado.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import five from 'johnny-five';
import MockFirmata from 'mock-firmata';

// Inicializar Firebase Admin (use sua chave JSON)
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };
initializeApp({ credential: cert(serviceAccount), databaseURL: 'https://<SEU-PROJETO>.firebaseio.com' });
const db = getDatabase();

const board = new five.Board({ io: new MockFirmata.Firmata(), repl: false });

board.on('ready', () => {
  console.log('Arduino simulado pronto');

  const sensorTemp = new five.Sensor({ pin: 'A0', freq: 2000 });
  const sensorLuz = new five.Sensor({ pin: 'A1', freq: 2000 });

  // Simulação simples: atualizar valores manualmente a cada tick
  setInterval(() => {
    // temperatura aleatória 22 - 38
    const tempVal = Number((22 + Math.random() * 16).toFixed(1));
    // luminosidade 200 - 900
    const luzVal = Math.round(200 + Math.random() * 700);

    const tempStatus = getTempStatus(tempVal);
    const luzStatus = getLuzStatus(luzVal);

    const painel = consolidatePanel(tempStatus, luzStatus);
    const now = Date.now();

    const payload = {
      temperatura: { valor: tempVal, status: tempStatus, timestamp: now },
      luminosidade: { valor: luzVal, status: luzStatus, timestamp: now },
      painel,
      timestamp: now
    };

    db.ref('/agro/algodao/sensores').set(payload);
    console.log('Enviado:', payload);
  }, 2000);

  // Escutar comandos do app
  db.ref('/agro/algodao/comandos').on('value', (snap) => {
    const cmd = snap.val();
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

function getTempStatus(v) {
  if (v < 30) return 'OK';
  if (v <= 35) return 'ALERTA';
  return 'CRITICO';
}

function getLuzStatus(v) {
  if (v >= 400 && v <= 800) return 'OK';
  if ((v >= 300 && v < 400) || (v > 800 && v <= 900)) return 'ALERTA';
  return 'CRITICO';
}

function consolidatePanel(tempStatus, luzStatus) {
  // prioridade: CRITICO > ALERTA > OK
  if (tempStatus === 'CRITICO' || luzStatus === 'CRITICO') return 'VERMELHO';
  if (tempStatus === 'ALERTA' || luzStatus === 'ALERTA') return 'AMARELO';
  return 'VERDE';
}
