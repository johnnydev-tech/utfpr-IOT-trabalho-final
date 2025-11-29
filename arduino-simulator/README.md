# Arduino Simulator - Arquitetura Desacoplada

## 📐 Arquitetura

O simulador foi desenvolvido com **arquitetura baseada em interfaces** e **injeção de dependências**, permitindo **fácil substituição** da simulação por hardware real.

```
arduino-simulator/
├── index.ts                    # Ponto de entrada (DI)
├── ARCHITECTURE.md             # Documentação detalhada da arquitetura
├── src/
│   ├── types.ts               # Definições de tipos TypeScript
│   ├── config.ts              # Configurações centralizadas
│   ├── interfaces/            # 🔌 Contratos abstratos
│   │   ├── ISensorBoard.ts        # Interface para leitura de sensores
│   │   └── IDataPublisher.ts      # Interface para publicação de dados
│   ├── controllers/           # 🎮 Lógica de orquestração
│   │   └── SensorController.ts    # Controller principal
│   ├── sensors/               # 🌡️ Implementações de hardware
│   │   ├── VirtualBoard.ts        # Simulação (implementa ISensorBoard)
│   │   ├── SensorManager.ts       # Gerenciador de sensores virtuais
│   │   └── RealBoard.example.ts   # Exemplo para hardware real
│   ├── firebase/              # ☁️ Implementações de publicação
│   │   └── FirebaseClient.ts      # Firebase (implementa IDataPublisher)
│   ├── publishers/            # 📡 Outras implementações
│   │   └── MqttPublisher.example.ts  # Exemplo MQTT
│   └── cli/
│       └── CLI.ts             # Interface de linha de comando
```

> 📖 **Leia [ARCHITECTURE.md](./ARCHITECTURE.md)** para documentação completa da arquitetura

## 🎯 Princípios de Design

### 1. **Desacoplamento via Interfaces**
```typescript
// Interface define o contrato
interface ISensorBoard {
  readAllSensors(): Record<string, SensorValue>;
}

// Implementações podem ser trocadas facilmente
class VirtualBoard implements ISensorBoard { ... }
class RealBoard implements ISensorBoard { ... }
```

### 2. **Injeção de Dependências**
```typescript
// index.ts - Configuração em um único lugar
const sensorBoard = new VirtualBoard();      // Ou: new RealBoard()
const dataPublisher = new FirebaseClient();  // Ou: new MqttPublisher()

const controller = new SensorController(sensorBoard, dataPublisher);
```

### 3. **Separação de Responsabilidades**
- **ISensorBoard**: Interface para leitura de sensores (Virtual ou Real)
- **IDataPublisher**: Interface para publicação de dados (Firebase, MQTT, HTTP, etc.)
- **SensorController**: Orquestra sensores e publicação
- **CLI**: Interface do usuário
- **Config**: Configurações centralizadas

### 4. **SOLID Principles**
- ✅ Single Responsibility
- ✅ Open/Closed (extensível via interfaces)
- ✅ Liskov Substitution (implementações intercambiáveis)
- ✅ Interface Segregation
- ✅ Dependency Inversion (depende de abstrações)

## 🌡️ Novos Sensores

Agora o simulador suporta **6 sensores** específicos para agricultura de algodão:

### Sensores Atmosféricos

1. **Temperatura** (°C)
   - Faixa: 15-42°C
   - OK: 20-30°C
   - Alerta: 18-35°C
   - Crítico: < 18°C ou > 35°C

2. **Luminosidade** (lux)
   - Faixa: 100-1000 lux
   - OK: 400-800 lux
   - Alerta: 300-900 lux

3. **Umidade do Ar** (%)
   - Faixa: 30-95%
   - OK: 50-70%
   - Alerta: 40-85%

4. **Pressão Atmosférica** (hPa)
   - Faixa: 950-1050 hPa
   - OK: 1000-1025 hPa
   - Alerta: 980-1040 hPa

### Sensores do Solo

5. **Umidade do Solo** (%)
   - Faixa: 20-100%
   - OK: 60-80%
   - Alerta: 40-90%

6. **pH do Solo**
   - Faixa: 4.0-9.0
   - OK: 5.8-8.0 (ideal para algodão)
   - Alerta: 5.0-8.5

## 🎮 Comandos CLI Atualizados

```bash
# Sensores atmosféricos
temp <valor>          # Define temperatura (ex: temp 28)
luz <valor>           # Define luminosidade (ex: luz 650)
umidade <valor>       # Define umidade do ar (ex: umidade 65)
pressao <valor>       # Define pressão (ex: pressao 1013)

# Sensores do solo
solo <valor>          # Define umidade do solo (ex: solo 75)
ph <valor>            # Define pH do solo (ex: ph 6.5)

# Controles gerais
auto                  # Volta todos ao modo automático
status                # Mostra todas as leituras atuais
help                  # Mostra este menu
exit                  # Sai do programa
```

## 🚀 Como Usar

### Executar com a Nova Arquitetura

```bash
cd arduino-simulator
npm install
npm run dev
```

O arquivo `package.json` já está configurado com:
```json
{
  "scripts": {
    "dev": "ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Exemplo de Uso

```bash
> status
[STATUS] Leituras atuais:
======================================================================
  temperatura          25.3°C       OK       [AUTO]
  luminosidade         650lux       OK       [AUTO]
  umidade              62.5%        OK       [AUTO]
  umidade_solo         72.0%        OK       [AUTO]
  ph                   6.8          OK       [AUTO]
  pressao              1015hPa      OK       [AUTO]
======================================================================

> temp 35
[OK] temperatura = 35.0°C (ALERTA) [MANUAL]

> ph 5.0
[OK] ph = 5.0 (ALERTA) [MANUAL]

> status
[STATUS] Leituras atuais:
======================================================================
  temperatura          35.0°C       ALERTA   [MANUAL]
  luminosidade         650lux       OK       [AUTO]
  umidade              62.5%        OK       [AUTO]
  umidade_solo         72.0%        OK       [AUTO]
  ph                   5.0          ALERTA   [MANUAL]
  pressao              1015hPa      OK       [AUTO]
======================================================================

> auto
[OK] Modo automático ativado para todos os sensores
```

## 🔄 Substituindo por Hardware Real

Graças à arquitetura desacoplada, **é muito simples** trocar a simulação por Arduino físico:

### 1️⃣ Crie RealBoard.ts
```bash
cp src/sensors/RealBoard.example.ts src/sensors/RealBoard.ts
```

### 2️⃣ Implemente a leitura real dos sensores
```typescript
// src/sensors/RealBoard.ts
import { ISensorBoard } from '../interfaces/ISensorBoard';
import * as five from 'johnny-five';

export class RealBoard implements ISensorBoard {
  private board: five.Board;
  private temperature: five.Thermometer;
  private moisture: five.Sensor;
  
  async initialize(): Promise<void> {
    this.board = new five.Board();
    
    return new Promise((resolve) => {
      this.board.on('ready', () => {
        // DHT22 - Temperatura e Umidade
        this.temperature = new five.Thermometer({
          controller: 'DHT22',
          pin: 2
        });
        
        // Sensor de Umidade do Solo
        this.moisture = new five.Sensor({
          pin: 'A0',
          freq: 1000
        });
        
        resolve();
      });
    });
  }
  
  readAllSensors(): Record<string, SensorValue> {
    return {
      temperatura: {
        valor: this.temperature.celsius,
        status: this.getStatus(this.temperature.celsius, 20, 30),
        timestamp: Date.now(),
        unidade: '°C'
      },
      // ... outros sensores
    };
  }
}
```

### 3️⃣ Atualize apenas o index.ts
```typescript
// index.ts - ÚNICA mudança necessária!

// Antes:
import { VirtualBoard } from './src/sensors/VirtualBoard';
const sensorBoard = new VirtualBoard();

// Depois:
import { RealBoard } from './src/sensors/RealBoard';
const sensorBoard = new RealBoard();

// Resto do código permanece IGUAL! 🎉
const dataPublisher = new FirebaseClient();
const controller = new SensorController(sensorBoard, dataPublisher);
controller.start();
```

### 4️⃣ Pronto! ✅
- Nenhum outro arquivo precisa ser alterado
- Controller, CLI, Firebase continuam funcionando
- Mesma interface, implementação diferente

## 📊 Formato de Dados Firebase

```json
{
  "agro": {
    "algodao": {
      "sensores": {
        "temperatura": {
          "valor": 25.3,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": "°C"
        },
        "luminosidade": {
          "valor": 650,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": "lux"
        },
        "umidade": {
          "valor": 62.5,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": "%"
        },
        "umidade_solo": {
          "valor": 72.0,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": "%"
        },
        "ph": {
          "valor": 6.8,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": ""
        },
        "pressao": {
          "valor": 1015,
          "status": "OK",
          "timestamp": 1700000000000,
          "unidade": "hPa"
        },
        "painel": "VERDE",
        "timestamp": 1700000000000
      }
    }
  }
}
```

## 🧪 Testando Cenários

### Cenário 1: Condições Ideais
```bash
> temp 25
> luz 600
> umidade 60
> solo 70
> ph 6.5
> pressao 1013
```
**Resultado**: Painel VERDE

### Cenário 2: Alerta de Temperatura
```bash
> temp 33
```
**Resultado**: Painel AMARELO

### Cenário 3: Crítico - Solo Seco
```bash
> solo 30
```
**Resultado**: Painel VERMELHO

### Cenário 4: pH Crítico
```bash
> ph 4.5
```
**Resultado**: Painel VERMELHO

## 🏗️ Extensibilidade

### Adicionar Novo Sensor

1. **Atualizar `config.ts`**:
```typescript
sensors: {
  // ... sensores existentes
  co2: {
    min: 300,
    max: 5000,
    okMin: 400,
    okMax: 1000,
    alertaMin: 350,
    alertaMax: 1500,
    unidade: 'ppm'
  }
}
```

2. **Atualizar `types.ts`**:
```typescript
export interface Payload {
  // ... campos existentes
  co2: SensorValue;
}
```

3. **Adicionar comando CLI em `CLI.ts`**:
```typescript
case 'co2':
  this.setSensorValue('co2', args[0]);
  break;
```

4. **Atualizar Flutter model e dashboard**

Pronto! O sensor já funciona em toda a aplicação.

## 📈 Benefícios da Nova Arquitetura

✅ **Manutenibilidade**: Código organizado e fácil de entender  
✅ **Escalabilidade**: Adicione sensores sem modificar código existente  
✅ **Testabilidade**: Classes isoladas facilitam testes unitários  
✅ **Reutilização**: Componentes podem ser usados em outros projetos  
✅ **Preparado para Produção**: Fácil migração para hardware real  
✅ **TypeScript**: Segurança de tipos em tempo de desenvolvimento  

## 🔌 Substituindo Firebase por MQTT

Também é simples trocar o Firebase por MQTT (ou qualquer outro protocolo):

### 1️⃣ Crie MqttPublisher.ts
```bash
cp src/publishers/MqttPublisher.example.ts src/publishers/MqttPublisher.ts
npm install mqtt
```

### 2️⃣ Atualize apenas o index.ts
```typescript
// index.ts

// Antes:
import { FirebaseClient } from './src/firebase/FirebaseClient';
const dataPublisher = new FirebaseClient();

// Depois:
import { MqttPublisher } from './src/publishers/MqttPublisher';
const dataPublisher = new MqttPublisher('mqtt://broker.example.com');

// Resto continua igual!
const sensorBoard = new VirtualBoard();
const controller = new SensorController(sensorBoard, dataPublisher);
```

## 🎨 Combinações Possíveis

Graças à injeção de dependências, você pode combinar qualquer implementação:

```typescript
// Simulação + Firebase (desenvolvimento)
const board = new VirtualBoard();
const publisher = new FirebaseClient();

// Simulação + MQTT (testes de integração)
const board = new VirtualBoard();
const publisher = new MqttPublisher('mqtt://test-broker');

// Hardware Real + Firebase (produção)
const board = new RealBoard();
const publisher = new FirebaseClient();

// Hardware Real + MQTT (produção alternativa)
const board = new RealBoard();
const publisher = new MqttPublisher('mqtt://prod-broker');

// Sempre o mesmo controller!
const controller = new SensorController(board, publisher);
```

## 📝 Próximos Passos

### Para Desenvolvimento
- [x] Arquitetura desacoplada com interfaces
- [x] Simulação virtual funcionando
- [x] Firebase integrado
- [x] CLI interativo
- [ ] Testes unitários com Jest
- [ ] Testes de integração

### Para Produção
- [ ] Implementar RealBoard com Arduino físico
- [ ] Testar com sensores reais (DHT22, soil moisture, pH)
- [ ] Configurar calibração de sensores
- [ ] Implementar retry e tratamento de erros robusto
- [ ] Logging estruturado
- [ ] Monitoramento de saúde do sistema

### Extensões Futuras
- [ ] Suporte a múltiplas culturas (soja, milho, etc.)
- [ ] Dashboard web para visualização
- [ ] Modo de replay de dados históricos
- [ ] Alertas via SMS/Email
- [ ] Machine Learning para previsões

---

**Versão**: 2.0.0  
**Data**: Novembro 2024  
**Arquitetura**: Desacoplada com Injeção de Dependências  
**Princípios**: SOLID, Interface-based Design, Separation of Concerns
