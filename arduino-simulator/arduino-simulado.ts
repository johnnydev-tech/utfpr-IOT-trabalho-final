// arduino-simulado.ts
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const readline = require('readline');

// ============ CONFIGURAÇÕES ============
const CONFIG = {
  UPDATE_INTERVAL: 2000, // Intervalo de atualização em ms
  TEMP_MIN: 22,
  TEMP_MAX: 38,
  LUZ_MIN: 200,
  LUZ_MAX: 900,
  // Limites de temperatura
  TEMP_OK_MAX: 30,
  TEMP_ALERTA_MAX: 35,
  // Limites de luminosidade
  LUZ_OK_MIN: 400,
  LUZ_OK_MAX: 800,
  LUZ_ALERTA_MIN: 300,
  LUZ_ALERTA_MAX: 900,
};

// ============ TIPOS ============
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

// ============ INICIALIZAÇÃO DO FIREBASE ============
// Tenta carregar serviceAccountKey, se falhar usa método alternativo
let app;
let usandoModoDev = false;

try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  // Verifica se é um arquivo de exemplo (placeholder)
  if (serviceAccount.private_key.includes('YOUR_PRIVATE_KEY_HERE')) {
    throw new Error('serviceAccountKey.json contém dados de exemplo.');
  }
  
  app = initializeApp({ 
    credential: cert(serviceAccount), 
    databaseURL: 'https://utfpr-iot-trabalho-final-default-rtdb.firebaseio.com' 
  });
  console.log('✅ Firebase inicializado com Service Account (modo seguro)');
} catch (error) {
  usandoModoDev = true;
  console.warn('\n⚠️  MODO DE DESENVOLVIMENTO');
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.warn('Não foi possível carregar serviceAccountKey.json válido.');
  console.warn('O simulador enviará dados, mas você verá warnings do Firebase.');
  console.warn('');
  console.warn('📝 Para usar sem warnings (recomendado):');
  console.warn('   1. Acesse: https://console.firebase.google.com');
  console.warn('   2. Project Settings > Service Accounts');
  console.warn('   3. Clique em "Generate New Private Key"');
  console.warn('   4. Salve como: serviceAccountKey.json nesta pasta');
  console.warn('');
  console.warn('📝 Para testar rapidamente:');
  console.warn('   Configure as regras do Firebase Database como públicas');
  console.warn('   (apenas para desenvolvimento)');
  console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Modo de desenvolvimento - funciona mas gera warnings
  const { initializeApp: initApp } = require('firebase-admin/app');
  app = initApp({
    databaseURL: 'https://utfpr-iot-trabalho-final-default-rtdb.firebaseio.com',
    databaseAuthVariableOverride: null  // null = sem autenticação
  });
}

const db = getDatabase(app);

// ============ VARIÁVEIS DE CONTROLE ============
let modoManual = false;
let temperaturaManual = 25;
let luminosidadeManual = 500;

// ============ FUNÇÕES DE SIMULAÇÃO ============
function gerarTemperatura(): number {
  if (modoManual) return temperaturaManual;
  return Number((CONFIG.TEMP_MIN + Math.random() * (CONFIG.TEMP_MAX - CONFIG.TEMP_MIN)).toFixed(1));
}

function gerarLuminosidade(): number {
  if (modoManual) return luminosidadeManual;
  return Math.round(CONFIG.LUZ_MIN + Math.random() * (CONFIG.LUZ_MAX - CONFIG.LUZ_MIN));
}

function getTempStatus(v: number): Status {
  if (v < CONFIG.TEMP_OK_MAX) return 'OK';
  if (v <= CONFIG.TEMP_ALERTA_MAX) return 'ALERTA';
  return 'CRITICO';
}

function getLuzStatus(v: number): Status {
  if (v >= CONFIG.LUZ_OK_MIN && v <= CONFIG.LUZ_OK_MAX) return 'OK';
  if ((v >= CONFIG.LUZ_ALERTA_MIN && v < CONFIG.LUZ_OK_MIN) || 
      (v > CONFIG.LUZ_OK_MAX && v <= CONFIG.LUZ_ALERTA_MAX)) return 'ALERTA';
  return 'CRITICO';
}

function consolidatePanel(tempStatus: Status, luzStatus: Status): Painel {
  if (tempStatus === 'CRITICO' || luzStatus === 'CRITICO') return 'VERMELHO';
  if (tempStatus === 'ALERTA' || luzStatus === 'ALERTA') return 'AMARELO';
  return 'VERDE';
}

// ============ FUNÇÕES DE ENVIO ============
function enviarDados() {
  const tempVal = gerarTemperatura();
  const luzVal = gerarLuminosidade();

  const tempStatus = getTempStatus(tempVal);
  const luzStatus = getLuzStatus(luzVal);
  const painel = consolidatePanel(tempStatus, luzStatus);
  const now = Date.now();

  const payload: Payload = {
    temperatura: { valor: tempVal, status: tempStatus, timestamp: now },
    luminosidade: { valor: luzVal, status: luzStatus, timestamp: now },
    painel,
    timestamp: now
  };

  db.ref('/agro/algodao/sensores').set(payload);
  
  const modo = modoManual ? '[MANUAL]' : '[AUTO]';
  console.log(`${modo} Enviado:`, {
    temp: `${tempVal}°C (${tempStatus})`,
    luz: `${luzVal} lux (${luzStatus})`,
    painel: painel
  });
}

// ============ INTERFACE DE LINHA DE COMANDO ============
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n> '
});

function mostrarMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('📟 ARDUINO SIMULADO - CONTROLE INTERATIVO');
  console.log('='.repeat(60));
  console.log('Comandos disponíveis:');
  console.log('  temp <valor>  - Define temperatura manual (ex: temp 32)');
  console.log('  luz <valor>   - Define luminosidade manual (ex: luz 450)');
  console.log('  auto          - Volta ao modo automático (aleatório)');
  console.log('  status        - Mostra valores atuais');
  console.log('  help          - Mostra este menu');
  console.log('  exit          - Sai do programa');
  console.log('='.repeat(60));
  console.log(`Modo atual: ${modoManual ? 'MANUAL' : 'AUTOMÁTICO'}`);
  if (modoManual) {
    console.log(`Temperatura: ${temperaturaManual}°C`);
    console.log(`Luminosidade: ${luminosidadeManual} lux`);
  }
  console.log('='.repeat(60));
}

rl.on('line', (line: string) => {
  const cmd = line.trim().toLowerCase().split(' ');
  
  switch(cmd[0]) {
    case 'temp':
      if (cmd[1]) {
        temperaturaManual = parseFloat(cmd[1]);
        modoManual = true;
        console.log(`✓ Temperatura definida para ${temperaturaManual}°C (modo manual)`);
      } else {
        console.log('❌ Use: temp <valor>');
      }
      break;
      
    case 'luz':
      if (cmd[1]) {
        luminosidadeManual = parseInt(cmd[1]);
        modoManual = true;
        console.log(`✓ Luminosidade definida para ${luminosidadeManual} lux (modo manual)`);
      } else {
        console.log('❌ Use: luz <valor>');
      }
      break;
      
    case 'auto':
      modoManual = false;
      console.log('✓ Modo automático ativado');
      break;
      
    case 'status':
      console.log('\n📊 Status atual:');
      console.log(`Modo: ${modoManual ? 'MANUAL' : 'AUTOMÁTICO'}`);
      console.log(`Temperatura: ${modoManual ? temperaturaManual : 'aleatória'} °C`);
      console.log(`Luminosidade: ${modoManual ? luminosidadeManual : 'aleatória'} lux`);
      break;
      
    case 'help':
      mostrarMenu();
      break;
      
    case 'exit':
      console.log('👋 Encerrando simulador...');
      process.exit(0);
      break;
      
    default:
      if (line.trim()) {
        console.log('❌ Comando não reconhecido. Digite "help" para ver os comandos.');
      }
  }
  
  rl.prompt();
});

// ============ SUPRIMIR WARNINGS DO FIREBASE EM MODO DEV ============
if (usandoModoDev) {
  // Captura e filtra logs do Firebase em modo desenvolvimento
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    // Filtra apenas warnings específicos do Firebase sobre credenciais em modo dev
    if (message.includes('@firebase/database') && 
        message.includes('invalid-credential') &&
        message.includes('metadata.google.internal')) {
      // Suprime esses warnings específicos em modo dev
      return;
    }
    originalWarn.apply(console, args);
  };
}

// ============ INICIALIZAÇÃO ============
console.log('🚀 Iniciando Arduino Simulado...');
console.log('📡 Conectando ao Firebase...');

// Aguardar conexão com Firebase
setTimeout(() => {
  console.log('✓ Conectado ao Firebase!');
  if (usandoModoDev) {
    console.log('ℹ️  Warnings do Firebase foram suprimidos em modo desenvolvimento\n');
  }
  mostrarMenu();

  
  // Iniciar envio periódico de dados
  setInterval(enviarDados, CONFIG.UPDATE_INTERVAL);
  
  // Escutar comandos do app
  db.ref('/agro/algodao/comandos').on('value', (snap: any) => {
    const cmd: Command | null = snap.val();
    if (!cmd) return;
    if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
      console.log(`\n📥 Comando recebido do app: forçar painel ${cmd.forcar_estado}`);
      db.ref('/agro/algodao/sensores/painel_forcado').set({ 
        estado: cmd.forcar_estado, 
        timestamp: Date.now() 
      });
    } else {
      console.log('\n📥 Comando recebido do app: modo AUTO');
      db.ref('/agro/algodao/sensores/painel_forcado').remove();
    }
    rl.prompt();
  });
  
  rl.prompt();
}, 1000);
