import { SensorController } from './src/controllers/SensorController';
import { VirtualBoard } from './src/sensors/VirtualBoard';
import { FirebaseClient } from './src/firebase/FirebaseClient';

const sensorBoard = new VirtualBoard();
const dataPublisher = new FirebaseClient();
const controller = new SensorController(sensorBoard, dataPublisher);

controller.start().catch((error) => {
  console.error('[ERRO FATAL]', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n[INFO] Recebido SIGINT, encerrando...');
  controller.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[INFO] Recebido SIGTERM, encerrando...');
  controller.stop();
  process.exit(0);
});
