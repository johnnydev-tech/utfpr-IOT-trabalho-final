import { initializeApp, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import * as path from 'path';
import * as fs from 'fs';
import { Payload, Command, Painel } from '../types';
import { FIREBASE_CONFIG } from '../config';
import { IDataPublisher } from '../interfaces/IDataPublisher';

export class FirebaseClient implements IDataPublisher {
  private app: App;
  private db: Database;
  private usandoModoDev: boolean = false;
  
  constructor() {
    this.app = this.initializeFirebase();
    this.db = getDatabase(this.app);
  }
  
  private initializeFirebase(): App {
    try {
      const projectRoot = path.resolve(__dirname, '..', '..');
      const serviceAccountPath = path.join(projectRoot, 'serviceAccountKey.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Arquivo não encontrado: ${serviceAccountPath}`);
      }
      
      const serviceAccount = require(serviceAccountPath);
      
      if (!serviceAccount.private_key || serviceAccount.private_key.includes('YOUR_PRIVATE_KEY_HERE')) {
        throw new Error('serviceAccountKey.json contém dados inválidos ou de exemplo.');
      }
      
      if (!serviceAccount.client_email || !serviceAccount.project_id) {
        throw new Error('serviceAccountKey.json está incompleto (faltam client_email ou project_id).');
      }
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: FIREBASE_CONFIG.databaseURL
      });
      
      console.log('[OK] Firebase inicializado com Service Account (modo seguro)');
      console.log(`[INFO] Projeto: ${serviceAccount.project_id}`);
      console.log(`[INFO] Service Account: ${serviceAccount.client_email}`);
      return app;
      
    } catch (error: any) {
      this.usandoModoDev = true;
      console.error('[ERRO] Falha ao carregar credenciais:', error.message);
      this.printDevModeWarning();
      
      return initializeApp({
        databaseURL: FIREBASE_CONFIG.databaseURL
      });
    }
  }
  
  private printDevModeWarning(): void {
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
  
  async testConnection(): Promise<boolean> {
    try {
      console.log('[INFO] Testando conexão com Firebase...');
      
      await this.db.ref(FIREBASE_CONFIG.paths.sensores).once('value');
      
      console.log('[OK] Conexão estabelecida com sucesso!');
      if (this.usandoModoDev) {
        console.log('[INFO] Modo desenvolvimento ativo');
      }
      console.log('[OK] Permissões de leitura/escrita OK\n');
      
      return true;
      
    } catch (error: any) {
      console.error('[ERRO] Falha ao conectar com Firebase:', error.message);
      
      if (error.message.includes('Permission denied') || 
          error.message.includes('PERMISSION_DENIED')) {
        this.printPermissionError();
      }
      
      return false;
    }
  }
  
  private printPermissionError(): void {
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
  
  async sendSensorData(payload: Payload): Promise<void> {
    try {
      await this.db.ref(FIREBASE_CONFIG.paths.sensores).set(payload);
    } catch (error: any) {
      console.error('[ERRO] Falha ao enviar dados:', error.message);
      
      if (error.message.includes('Permission denied')) {
        this.printPermissionError();
      }
      
      throw error;
    }
  }
  
  onCommand(callback: (command: Command) => void): void {
    this.db.ref(FIREBASE_CONFIG.paths.comandos).on('value', (snap: any) => {
      const cmd: Command | null = snap.val();
      if (cmd) {
        callback(cmd);
      }
    });
  }
  
  async forcePanelState(estado: Painel): Promise<void> {
    await this.db.ref(`${FIREBASE_CONFIG.paths.sensores}/painel_forcado`).set({
      estado,
      timestamp: Date.now()
    });
  }
  
  async clearForcedPanel(): Promise<void> {
    await this.db.ref(`${FIREBASE_CONFIG.paths.sensores}/painel_forcado`).remove();
  }
}
