# Arduino Simulator - Arquitetura Modular

## 📐 Nova Arquitetura

O simulador foi completamente refatorado com uma arquitetura modular e escalável:

```
arduino-simulator/
├── index.ts                    # Ponto de entrada
├── src/
│   ├── types.ts               # Definições de tipos TypeScript
│   ├── config.ts              # Configurações centralizadas
│   ├── Simulator.ts           # Classe principal do simulador
│   ├── sensors/
│   │   ├── SensorManager.ts   # Gerenciador de sensores
│   │   └── VirtualBoard.ts    # Board virtual (johnny-five)
│   ├── firebase/
│   │   └── FirebaseClient.ts  # Cliente Firebase isolado
│   └── cli/
│       └── CLI.ts             # Interface de linha de comando
└── arduino-simulado.ts        # [DEPRECATED] Versão antiga
```

## 🎯 Princípios de Design

### 1. **Separação de Responsabilidades**
- **SensorManager**: Gerencia leitura e estado dos sensores
- **VirtualBoard**: Simula placa Arduino (preparado para johnny-five real)
- **FirebaseClient**: Comunicação isolada com Firebase
- **CLI**: Interface do usuário separada da lógica de negócio
- **Simulator**: Orquestra todos os componentes

### 2. **Orientação a Objetos**
- Classes com responsabilidades únicas
- Encapsulamento de estado e comportamento
- Fácil extensão e manutenção

### 3. **Configuração Centralizada**
- Todas as configurações em `config.ts`
- Fácil ajuste de limites e intervalos
- Separação entre config e lógica

### 4. **Tipos Fortes**
- TypeScript com tipos explícitos
- Interfaces bem definidas
- Redução de erros em runtime

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

## 🔌 Johnny-Five - Preparado para Hardware Real

A arquitetura está preparada para usar johnny-five com Arduino físico:

### Virtual Board (Atual)
```typescript
// src/sensors/VirtualBoard.ts
export class VirtualBoard {
  // Simula sensores virtuais
  // Ideal para desenvolvimento e testes
}
```

### Real Board (Futuro)
```typescript
import * as five from 'johnny-five';

export class RealBoard {
  private board: five.Board;
  private temperature: five.Thermometer;
  private moisture: five.Sensor;
  
  async initialize(): Promise<void> {
    this.board = new five.Board();
    
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
      
      // pH Sensor
      this.ph = new five.Sensor({
        pin: 'A1',
        freq: 1000
      });
    });
  }
}
```

Para usar com hardware real, basta:
1. Conectar Arduino via USB
2. Trocar `VirtualBoard` por `RealBoard` em `Simulator.ts`
3. Configurar os pinos corretos em `RealBoard.ts`

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
    max: 2000,
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

## 🔄 Migração da Versão Antiga

A versão antiga (`arduino-simulado.ts`) ainda existe mas está **deprecated**.

Para migrar completamente:
1. Use `npm run dev` ao invés de executar `arduino-simulado.ts`
2. Configure `.vscode/launch.json` para usar `index.ts`
3. Após validar, delete `arduino-simulado.ts`

## 📝 Próximos Passos

- [ ] Adicionar testes unitários com Jest
- [ ] Implementar logging estruturado
- [ ] Criar modo de replay de dados históricos
- [ ] Adicionar suporte a múltiplas culturas (soja, milho, etc.)
- [ ] Integrar com Arduino físico usando johnny-five
- [ ] Adicionar dashboard web para visualização

---

**Versão**: 2.0.0  
**Data**: Novembro 2024  
**Arquitetura**: Modular com johnny-five
