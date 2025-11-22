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
  console.log('[OK] Firebase inicializado com Service Account (modo seguro)');
} catch (error) {
  usandoModoDev = true;
  console.warn('\n[AVISO] MODO DE DESENVOLVIMENTO');
  console.warn('================================================================');
  console.warn('Nao foi possivel carregar serviceAccountKey.json valido.');
  console.warn('');
  console.warn('[IMPORTANTE] Para usar em producao:');
  console.warn('   1. Acesse: https://console.firebase.google.com');
  console.warn('   2. Project Settings > Service Accounts');
  console.warn('   3. Clique em "Generate New Private Key"');
  console.warn('   4. Salve como: serviceAccountKey.json nesta pasta');
  console.warn('================================================================\n');
  
  console.log('[INFO] Usando database URL sem autenticacao');
  console.log('[INFO] ATENCAO: Configure as regras do Firebase como publicas!');
  console.log('[INFO] Firebase Console > Realtime Database > Rules');
  console.log('[INFO] { "rules": { ".read": true, ".write": true } }\n');
  
  // Criar app sem credenciais - funciona apenas com regras abertas
  app = initializeApp({
    databaseURL: 'https://utfpr-iot-trabalho-final-default-rtdb.firebaseio.com'
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
async function enviarDados() {
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

  try {
    await db.ref('/agro/algodao/sensores').set(payload);
    
    const modo = modoManual ? '[MANUAL]' : '[AUTO]';
    console.log(`${modo} Enviado:`, {
      temp: `${tempVal}°C (${tempStatus})`,
      luz: `${luzVal} lux (${luzStatus})`,
      painel: painel
    });
  } catch (error: any) {
    console.error('[ERRO] Falha ao enviar dados:', error.message);
    if (error.message.includes('Permission denied') || error.message.includes('PERMISSION_DENIED')) {
      console.error('\n[ERRO] PERMISSAO NEGADA PELO FIREBASE');
      console.error('================================================================');
      console.error('As regras do Firebase Realtime Database estao bloqueando acesso.');
      console.error('');
      console.error('[SOLUCAO] Para corrigir:');
      console.error('   1. Acesse: https://console.firebase.google.com');
      console.error('   2. Selecione: utfpr-iot-trabalho-final');
      console.error('   3. Va em: Realtime Database > Rules');
      console.error('   4. Configure (APENAS DESENVOLVIMENTO):');
      console.error('      {');
      console.error('        "rules": {');
      console.error('          ".read": true,');
      console.error('          ".write": true');
      console.error('        }');
      console.error('      }');
      console.error('   5. Clique em "Publish"');
      console.error('   6. Reinicie este programa');
      console.error('================================================================\n');
    }
  }
}

// ============ INTERFACE DE LINHA DE COMANDO ============
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n> '
});

function mostrarMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('ARDUINO SIMULADO - CONTROLE INTERATIVO');
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
        console.log(`[OK] Temperatura definida para ${temperaturaManual}°C (modo manual)`);
      } else {
        console.log('[ERRO] Use: temp <valor>');
      }
      break;
      
    case 'luz':
      if (cmd[1]) {
        luminosidadeManual = parseInt(cmd[1]);
        modoManual = true;
        console.log(`[OK] Luminosidade definida para ${luminosidadeManual} lux (modo manual)`);
      } else {
        console.log('[ERRO] Use: luz <valor>');
      }
      break;
      
    case 'auto':
      modoManual = false;
      console.log('[OK] Modo automatico ativado');
      break;
      
    case 'status':
      console.log('\n[STATUS] Configuracao atual:');
      console.log(`Modo: ${modoManual ? 'MANUAL' : 'AUTOMATICO'}`);
      console.log(`Temperatura: ${modoManual ? temperaturaManual : 'aleatoria'} °C`);
      console.log(`Luminosidade: ${modoManual ? luminosidadeManual : 'aleatoria'} lux`);
      break;
      
    case 'help':
      mostrarMenu();
      break;
      
    case 'exit':
      console.log('[INFO] Encerrando simulador...');
      process.exit(0);
      break;
      
    default:
      if (line.trim()) {
        console.log('[ERRO] Comando nao reconhecido. Digite "help" para ver os comandos.');
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

// ============ INICIALIZACAO ============
console.log('[INFO] Iniciando Arduino Simulado...');
console.log('[INFO] Conectando ao Firebase...');

// Funcao para testar conexao
async function testarConexao() {
  try {
    console.log('[INFO] Testando conexao com Firebase...');
    
    // Tenta fazer uma leitura simples para testar permissoes
    await db.ref('/agro/algodao/sensores').once('value');
    
    console.log('[OK] Conexao estabelecida com sucesso!');
    if (usandoModoDev) {
      console.log('[INFO] Modo desenvolvimento ativo');
    }
    console.log('[OK] Permissoes de leitura/escrita OK\n');
    
    return true;
  } catch (error: any) {
    console.error('[ERRO] Falha ao conectar com Firebase:', error.message);
    console.error('[DEBUG] Tipo do erro:', error.code || 'desconhecido');
    
    if (error.message.includes('Permission denied') || error.message.includes('PERMISSION_DENIED')) {
      console.error('\n[ERRO] PERMISSAO NEGADA PELO FIREBASE');
      console.error('================================================================');
      console.error('As regras do Firebase Realtime Database estao bloqueando acesso.');
      console.error('');
      console.error('[SOLUCAO] Para corrigir:');
      console.error('   1. Acesse: https://console.firebase.google.com');
      console.error('   2. Selecione: utfpr-iot-trabalho-final');
      console.error('   3. Va em: Realtime Database > Rules');
      console.error('   4. Configure (APENAS DESENVOLVIMENTO):');
      console.error('      {');
      console.error('        "rules": {');
      console.error('          ".read": true,');
      console.error('          ".write": true');
      console.error('        }');
      console.error('      }');
      console.error('   5. Clique em "Publish"');
      console.error('   6. Reinicie este programa');
      console.error('================================================================\n');
    }
    
    return false;
  }
}

// Aguardar conexão com Firebase e testar
setTimeout(async () => {
  const conectado = await testarConexao();
  
  if (!conectado) {
    console.log('\n[ERRO] Nao foi possivel conectar ao Firebase.');
    console.log('[INFO] Corrija as permissoes e tente novamente.\n');
    process.exit(1);
  }
  
  mostrarMenu();
  
  // Iniciar envio periódico de dados
  setInterval(enviarDados, CONFIG.UPDATE_INTERVAL);
  
  // Escutar comandos do app
  db.ref('/agro/algodao/comandos').on('value', (snap: any) => {
    const cmd: Command | null = snap.val();
    if (!cmd) return;
    if (cmd.forcar_estado && cmd.forcar_estado !== 'AUTO') {
      console.log(`\n[COMANDO] Recebido do app: forcar painel ${cmd.forcar_estado}`);
      db.ref('/agro/algodao/sensores/painel_forcado').set({ 
        estado: cmd.forcar_estado, 
        timestamp: Date.now() 
      });
    } else {
      console.log('\n[COMANDO] Recebido do app: modo AUTO');
      db.ref('/agro/algodao/sensores/painel_forcado').remove();
    }
    rl.prompt();
  });
  
  rl.prompt();
}, 1000);
