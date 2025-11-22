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
exports.FirebaseClient = void 0;
// src/firebase/FirebaseClient.ts
const app_1 = require("firebase-admin/app");
const database_1 = require("firebase-admin/database");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("../config");
class FirebaseClient {
    constructor() {
        this.usandoModoDev = false;
        this.app = this.initializeFirebase();
        this.db = (0, database_1.getDatabase)(this.app);
    }
    initializeFirebase() {
        try {
            // Buscar serviceAccountKey.json na raiz do projeto
            const projectRoot = path.resolve(__dirname, '..', '..');
            const serviceAccountPath = path.join(projectRoot, 'serviceAccountKey.json');
            // Verificar se o arquivo existe
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Arquivo não encontrado: ${serviceAccountPath}`);
            }
            const serviceAccount = require(serviceAccountPath);
            // Validar conteúdo
            if (!serviceAccount.private_key || serviceAccount.private_key.includes('YOUR_PRIVATE_KEY_HERE')) {
                throw new Error('serviceAccountKey.json contém dados inválidos ou de exemplo.');
            }
            if (!serviceAccount.client_email || !serviceAccount.project_id) {
                throw new Error('serviceAccountKey.json está incompleto (faltam client_email ou project_id).');
            }
            const app = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccount),
                databaseURL: config_1.FIREBASE_CONFIG.databaseURL
            });
            console.log('[OK] Firebase inicializado com Service Account (modo seguro)');
            console.log(`[INFO] Projeto: ${serviceAccount.project_id}`);
            console.log(`[INFO] Service Account: ${serviceAccount.client_email}`);
            return app;
        }
        catch (error) {
            this.usandoModoDev = true;
            console.error('[ERRO] Falha ao carregar credenciais:', error.message);
            this.printDevModeWarning();
            return (0, app_1.initializeApp)({
                databaseURL: config_1.FIREBASE_CONFIG.databaseURL
            });
        }
    }
    printDevModeWarning() {
        console.warn('\n[AVISO] MODO DE DESENVOLVIMENTO');
        console.warn('================================================================');
        console.warn('Não foi possível carregar serviceAccountKey.json válido.');
        console.warn('');
        console.warn('[IMPORTANTE] Para usar em produção:');
        console.warn('   1. Acesse: https://console.firebase.google.com');
        console.warn('   2. Project Settings > Service Accounts');
        console.warn('   3. Clique em "Generate New Private Key"');
        console.warn('   4. Salve como: serviceAccountKey.json nesta pasta');
        console.warn('================================================================\n');
        console.log('[INFO] Usando database URL sem autenticação');
        console.log('[INFO] ATENÇÃO: Configure as regras do Firebase como públicas!');
        console.log('[INFO] Firebase Console > Realtime Database > Rules');
        console.log('[INFO] { "rules": { ".read": true, ".write": true } }\n');
    }
    async testConnection() {
        try {
            console.log('[INFO] Testando conexão com Firebase...');
            await this.db.ref(config_1.FIREBASE_CONFIG.paths.sensores).once('value');
            console.log('[OK] Conexão estabelecida com sucesso!');
            if (this.usandoModoDev) {
                console.log('[INFO] Modo desenvolvimento ativo');
            }
            console.log('[OK] Permissões de leitura/escrita OK\n');
            return true;
        }
        catch (error) {
            console.error('[ERRO] Falha ao conectar com Firebase:', error.message);
            if (error.message.includes('Permission denied') ||
                error.message.includes('PERMISSION_DENIED')) {
                this.printPermissionError();
            }
            return false;
        }
    }
    printPermissionError() {
        console.error('\n[ERRO] PERMISSÃO NEGADA PELO FIREBASE');
        console.error('================================================================');
        console.error('As regras do Firebase Realtime Database estão bloqueando acesso.');
        console.error('');
        console.error('[SOLUÇÃO] Para corrigir:');
        console.error('   1. Acesse: https://console.firebase.google.com');
        console.error('   2. Selecione: utfpr-iot-trabalho-final');
        console.error('   3. Vá em: Realtime Database > Rules');
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
    async sendSensorData(payload) {
        try {
            await this.db.ref(config_1.FIREBASE_CONFIG.paths.sensores).set(payload);
        }
        catch (error) {
            console.error('[ERRO] Falha ao enviar dados:', error.message);
            if (error.message.includes('Permission denied')) {
                this.printPermissionError();
            }
            throw error;
        }
    }
    onCommand(callback) {
        this.db.ref(config_1.FIREBASE_CONFIG.paths.comandos).on('value', (snap) => {
            const cmd = snap.val();
            if (cmd) {
                callback(cmd);
            }
        });
    }
    async forcePanelState(estado) {
        await this.db.ref(`${config_1.FIREBASE_CONFIG.paths.sensores}/painel_forcado`).set({
            estado,
            timestamp: Date.now()
        });
    }
    async clearForcedPanel() {
        await this.db.ref(`${config_1.FIREBASE_CONFIG.paths.sensores}/painel_forcado`).remove();
    }
}
exports.FirebaseClient = FirebaseClient;
