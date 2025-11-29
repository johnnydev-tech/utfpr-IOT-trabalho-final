# Arquitetura do Projeto - Arduino Simulator

## 📐 Visão Geral

Este projeto foi desenvolvido com uma arquitetura **desacoplada** e **baseada em interfaces**, facilitando a substituição de implementações sem alterar a lógica principal.

## 🏗️ Estrutura da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      index.ts                            │
│              (Injeção de Dependências)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│              SensorController                             │
│           (Lógica de Negócio)                            │
└──────┬──────────────────────────────────────────┬────────┘
       │                                           │
       ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│  ISensorBoard    │                    │  IDataPublisher  │
│   (Interface)    │                    │   (Interface)    │
└────────┬─────────┘                    └────────┬─────────┘
         │                                        │
    ┌────┴────┬────────────┐          ┌──────────┴──────┬─────────────┐
    ▼         ▼            ▼          ▼                 ▼             ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│Virtual  │ │ Real   │ │  Mock  │ │  Firebase │ │   MQTT   │ │   HTTP   │
│ Board   │ │ Board  │ │ Board  │ │  Client   │ │Publisher │ │Publisher │
└─────────┘ └────────┘ └────────┘ └───────────┘ └──────────┘ └──────────┘
```

## 📁 Estrutura de Diretórios

```
src/
├── interfaces/           # Contratos abstratos
│   ├── ISensorBoard.ts      # Interface para leitura de sensores
│   └── IDataPublisher.ts    # Interface para publicação de dados
│
├── controllers/          # Lógica de orquestração
│   └── SensorController.ts  # Controller principal
│
├── sensors/              # Implementações de hardware
│   ├── VirtualBoard.ts      # Simulação atual
│   ├── SensorManager.ts     # Gerenciador de sensores virtuais
│   └── RealBoard.example.ts # Exemplo para hardware real
│
├── firebase/             # Implementações de publicação
│   └── FirebaseClient.ts    # Cliente Firebase atual
│
├── publishers/           # Outras implementações de publicação
│   └── MqttPublisher.example.ts  # Exemplo MQTT
│
├── cli/                  # Interface de linha de comando
│   └── CLI.ts               # CLI interativo
│
├── config.ts             # Configurações
└── types.ts              # Tipos TypeScript
```

## 🔌 Interfaces Principais

### ISensorBoard
Define o contrato para qualquer fonte de dados de sensores:
- `initialize()`: Inicializa a placa
- `readAllSensors()`: Lê todos os sensores
- `setSensorValue()`: Define valor manual (para testes)
- `setAutoMode()`: Modo automático
- `hasManualSensors()`: Verifica se há sensores manuais
- `getSensorNames()`: Lista sensores disponíveis
- `getSensorInfo()`: Informações de um sensor específico

### IDataPublisher
Define o contrato para qualquer serviço de publicação:
- `testConnection()`: Testa conexão
- `sendSensorData()`: Envia dados
- `onCommand()`: Escuta comandos
- `forcePanelState()`: Força estado do painel
- `clearForcedPanel()`: Remove estado forçado

## 🔄 Como Substituir Implementações

### Substituir por Hardware Real

1. **Crie a implementação**:
   ```bash
   cp src/sensors/RealBoard.example.ts src/sensors/RealBoard.ts
   ```

2. **Implemente a lógica real** em `RealBoard.ts`:
   ```typescript
   export class RealBoard implements ISensorBoard {
     // Implementar leitura real dos sensores
   }
   ```

3. **Atualize o index.ts**:
   ```typescript
   // Antes:
   import { VirtualBoard } from './src/sensors/VirtualBoard';
   const sensorBoard = new VirtualBoard();
   
   // Depois:
   import { RealBoard } from './src/sensors/RealBoard';
   const sensorBoard = new RealBoard();
   ```

4. **Pronto!** Nenhuma outra alteração necessária.

### Substituir Firebase por MQTT

1. **Crie a implementação**:
   ```bash
   cp src/publishers/MqttPublisher.example.ts src/publishers/MqttPublisher.ts
   ```

2. **Implemente a lógica MQTT** em `MqttPublisher.ts`:
   ```typescript
   export class MqttPublisher implements IDataPublisher {
     // Implementar publicação MQTT
   }
   ```

3. **Atualize o index.ts**:
   ```typescript
   // Antes:
   import { FirebaseClient } from './src/firebase/FirebaseClient';
   const dataPublisher = new FirebaseClient();
   
   // Depois:
   import { MqttPublisher } from './src/publishers/MqttPublisher';
   const dataPublisher = new MqttPublisher('mqtt://broker.example.com');
   ```

4. **Pronto!** O resto do código continua funcionando.

## 🎯 Benefícios da Arquitetura

### 1. **Desacoplamento**
- Componentes não dependem de implementações concretas
- Facilita testes unitários (mocks)
- Mudanças em uma camada não afetam outras

### 2. **Flexibilidade**
- Fácil trocar simulação por hardware real
- Fácil trocar Firebase por MQTT, HTTP, etc.
- Permite múltiplas implementações simultâneas

### 3. **Manutenibilidade**
- Código organizado e fácil de entender
- Responsabilidades bem definidas
- Fácil adicionar novas funcionalidades

### 4. **Testabilidade**
- Interfaces permitem criar mocks facilmente
- Testes isolados por camada
- Injeção de dependências facilita testes

## 📝 Exemplo de Uso

```typescript
// index.ts - Configuração principal
import { SensorController } from './src/controllers/SensorController';
import { VirtualBoard } from './src/sensors/VirtualBoard';
import { FirebaseClient } from './src/firebase/FirebaseClient';

// 1. Criar implementações
const sensorBoard = new VirtualBoard();
const dataPublisher = new FirebaseClient();

// 2. Injetar no controller
const controller = new SensorController(sensorBoard, dataPublisher);

// 3. Iniciar
controller.start();
```

## 🔧 Comandos

```bash
# Instalar dependências
npm install

# Executar
npm start

# Desenvolvimento (com watch)
npm run dev
```

## 📚 Próximos Passos

1. **Para implementar hardware real**:
   - Siga o exemplo em `RealBoard.example.ts`
   - Configure os pinos dos sensores
   - Implemente as leituras reais

2. **Para adicionar novo protocolo**:
   - Crie classe implementando `IDataPublisher`
   - Configure conexão
   - Atualize `index.ts`

3. **Para adicionar novos sensores**:
   - Atualize `config.ts`
   - Adicione leitura em `ISensorBoard`
   - Atualize tipos em `types.ts`

## 🏛️ Princípios Aplicados

- **SOLID**: Principalmente Dependency Inversion e Interface Segregation
- **Injeção de Dependências**: Todas as dependências são injetadas
- **Interface-based Design**: Programação voltada para interfaces
- **Separation of Concerns**: Cada camada tem responsabilidade clara
