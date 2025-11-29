import { Payload, Command, Painel } from '../types';

export interface IDataPublisher {
  testConnection(): Promise<boolean>;
  sendSensorData(payload: Payload): Promise<void>;
  onCommand(callback: (command: Command) => void): void;
  forcePanelState(estado: Painel): Promise<void>;
  clearForcedPanel(): Promise<void>;
}
