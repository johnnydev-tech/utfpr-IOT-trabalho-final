// index.ts - Novo ponto de entrada
import { Simulator } from './src/Simulator';

const simulator = new Simulator();

simulator.start().catch((error) => {
  console.error('[ERRO FATAL]', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[INFO] Recebido SIGINT, encerrando...');
  simulator.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[INFO] Recebido SIGTERM, encerrando...');
  simulator.stop();
  process.exit(0);
});
