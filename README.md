<div align="center">
  <img src="iot_monitor_app/assets/images/cotton_icon.png" alt="Cotton Monitor" width="120"/>
  <h1>Sistema de Monitoramento IoT para Agricultura</h1>
  <p>UTFPR - Trabalho Final de IoT</p>
</div>

## Preview

<div align="center">
  <table>
    <tr>
      <td><img src="assets/Simulator Screenshot - iPhone 17 Pro - 2025-11-22 at 17.32.31.png" width="250"/></td>
      <td><img src="assets/Simulator Screenshot - iPhone 17 Pro - 2025-11-22 at 17.32.35.png" width="250"/></td>
      <td><img src="assets/Simulator Screenshot - iPhone 17 Pro - 2025-11-22 at 17.32.38.png" width="250"/></td>
    </tr>
    <tr>
      <td align="center">Status Verde (OK)</td>
      <td align="center">Status Amarelo (Alerta)</td>
      <td align="center">Status Vermelho (Crítico)</td>
    </tr>
  </table>
  
  <br/>
  
  <p><strong>Demonstração do Funcionamento em Tempo Real:</strong></p>
  <a href="assets/funcionamento.mov">
    <img src="assets/Simulator Screenshot - iPhone 17 Pro - 2025-11-22 at 17.32.35.png" width="300"/>
    <br/>
    <em>Clique para assistir ao vídeo de demonstração</em>
  </a>
</div>

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura C4](#arquitetura-c4)
- [Pré-requisitos](#pré-requisitos)
- [Simulador Arduino](#simulador-arduino)
- [Aplicativo Flutter](#aplicativo-flutter)
- [Estrutura do Projeto](#estrutura-do-projeto)

## Visão Geral

Sistema completo de monitoramento IoT para cultivo de algodão, composto por simulador Arduino e aplicativo Flutter com sincronização em tempo real.

### Sensores Monitorados

**Atmosféricos:**
- Temperatura: 15-42°C (ideal: 20-30°C)
- Luminosidade: 100-1000 lux (ideal: 400-800 lux)
- Umidade do Ar: 30-95% (ideal: 50-70%)
- Pressão Atmosférica: 950-1050 hPa (ideal: 1000-1025 hPa)

**Solo:**
- Umidade: 20-100% (ideal: 60-80%)
- pH: 4.0-9.0 (ideal: 5.8-8.0)

### Recursos

- Sistema de alertas por cores (Verde/Amarelo/Vermelho)
- Sincronização em tempo real via Firebase
- Johnny-Five com mock-firmata para simulação de Arduino
- Arquitetura preparada para hardware real
- Interface responsiva e moderna

## Arquitetura C4

### Nível 1: Contexto do Sistema

```
                    ┌─────────────┐
                    │   Usuário   │
                    │ Agricultor  │
                    └──────┬──────┘
                           │
                           ▼
    ┌──────────────────────────────────────────┐
    │  Sistema IoT Monitoramento Agrícola      │
    │                                          │
    │  - Coleta de dados de sensores          │
    │  - Análise de condições ambientais      │
    │  - Alertas em tempo real                │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Firebase Cloud  │
          │  Realtime DB    │
          └─────────────────┘
```

### Nível 2: Containers

```
┌──────────────────────────────────────────────────────────────────┐
│                  Sistema IoT Agricultura                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐          ┌────────────────────┐         │
│  │ Arduino Simulator  │          │   Flutter App      │         │
│  │   (Node.js/TS)     │          │  (Dart/Flutter)    │         │
│  │                    │          │                    │         │
│  │ - Johnny-Five      │          │ - Dashboard UI     │         │
│  │ - Mock-Firmata     │          │ - State Mgmt       │         │
│  │ - SensorManager    │◄────────►│ - Real-time        │         │
│  │ - CLI Interface    │   sync   │ - Commands         │         │
│  │ - Firebase Client  │          │                    │         │
│  └─────────┬──────────┘          └─────────┬──────────┘         │
│            │                               │                    │
│            │         ┌─────────────────────┘                    │
│            │         │                                          │
│            ▼         ▼                                          │
│  ┌─────────────────────────────┐                               │
│  │ Firebase Realtime Database  │                               │
│  │                             │                               │
│  │ /agro/algodao/sensores      │                               │
│  │   - temperatura             │                               │
│  │   - luminosidade            │                               │
│  │   - umidade                 │                               │
│  │   - umidade_solo            │                               │
│  │   - ph                      │                               │
│  │   - pressao                 │                               │
│  │   - painel (status)         │                               │
│  └─────────────────────────────┘                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Nível 3: Componentes

#### Arduino Simulator

```
┌────────────────────────────────────────────┐
│        Arduino Simulator (TS)              │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────┐                     │
│  │   Simulator      │                     │
│  │  (Orchestrator)  │                     │
│  └────────┬─────────┘                     │
│           │                                │
│     ┌─────┼──────┬──────────┐             │
│     ▼     ▼      ▼          ▼             │
│  ┌─────┐ ┌──┐ ┌────┐  ┌────────┐         │
│  │Snsr │ │FB│ │CLI │  │ Config │         │
│  │ Mgr │ │  │ │    │  │        │         │
│  └─────┘ └──┘ └────┘  └────────┘         │
│                                            │
│  Johnny-Five + Mock-Firmata:               │
│  - Simula Arduino Board                   │
│  - API compatível com hardware real       │
│                                            │
│  SensorManager:                            │
│  - Leitura de sensores                    │
│  - Validação de limites                   │
│  - Cálculo de status                      │
│                                            │
│  FirebaseClient:                           │
│  - Envio de dados                         │
│  - Escuta de comandos                     │
│                                            │
│  CLI:                                      │
│  - Comandos interativos                   │
│  - Modo manual/automático                 │
│                                            │
└────────────────────────────────────────────┘
```

#### Flutter App

```
┌────────────────────────────────────────────┐
│       Flutter App (Clean Arch)             │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────┐                     │
│  │  Presentation    │                     │
│  │                  │                     │
│  │  ┌────────────┐  │                     │
│  │  │ Dashboard  │  │                     │
│  │  │   Page     │  │                     │
│  │  └─────┬──────┘  │                     │
│  │        │          │                     │
│  │        ▼          │                     │
│  │  ┌────────────┐  │                     │
│  │  │  Sensor    │  │                     │
│  │  │   Cubit    │  │                     │
│  │  └─────┬──────┘  │                     │
│  └────────┼─────────┘                     │
│           │                                │
│  ┌────────▼────────┐                      │
│  │      Data       │                      │
│  │                 │                      │
│  │  ┌───────────┐  │                      │
│  │  │ Firebase  │  │                      │
│  │  │  Service  │  │                      │
│  │  └───────────┘  │                      │
│  │                 │                      │
│  │  Either<L,R>    │                      │
│  │  Error Handling │                      │
│  └─────────────────┘                      │
│                                            │
│  ┌─────────────────┐                      │
│  │     Domain      │                      │
│  │                 │                      │
│  │  ┌───────────┐  │                      │
│  │  │  Sensor   │  │                      │
│  │  │   Model   │  │                      │
│  │  └───────────┘  │                      │
│  │                 │                      │
│  │  ┌───────────┐  │                      │
│  │  │ Failures  │  │                      │
│  │  └───────────┘  │                      │
│  └─────────────────┘                      │
│                                            │
└────────────────────────────────────────────┘
```

### Nível 4: Código

**Padrões Implementados:**

- **State Pattern**: Gerenciamento de estados da aplicação
- **Either Pattern**: Tratamento funcional de erros (Left/Right)
- **BLoC Pattern**: Separação de lógica de negócio
- **Repository Pattern**: Abstração da camada de dados
- **Dependency Injection**: Desacoplamento de componentes

## Pré-requisitos

**Simulador:**
- Node.js v16+
- npm ou yarn

**App Flutter:**
- Flutter SDK 3.0+
- Dart SDK 3.0+

**Firebase:**
- Projeto configurado no Firebase Console
- Realtime Database habilitado

## Simulador Arduino

### Instalação

```bash
cd arduino-simulator
npm install
```

### Configuração Firebase

Obtenha a Service Account Key:
1. Firebase Console > Project Settings > Service Accounts
2. Generate New Private Key
3. Salve como `serviceAccountKey.json` na pasta `arduino-simulator/`

Para desenvolvimento, configure as regras do Firebase:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Executar

```bash
npm start
```

### Comandos CLI

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `temp <valor>` | Define temperatura (°C) | `temp 28` |
| `luz <valor>` | Define luminosidade (lux) | `luz 650` |
| `umidade <valor>` | Define umidade do ar (%) | `umidade 65` |
| `pressao <valor>` | Define pressão (hPa) | `pressao 1013` |
| `solo <valor>` | Define umidade do solo (%) | `solo 75` |
| `ph <valor>` | Define pH do solo | `ph 6.5` |
| `auto` | Modo automático | `auto` |
| `status` | Mostra valores atuais | `status` |
| `help` | Menu de ajuda | `help` |
| `exit` | Encerra simulador | `exit` |

### Arquitetura Modular

```
arduino-simulator/
├── index.ts                # Entry point
├── src/
│   ├── config.ts          # Configurações centralizadas
│   ├── types.ts           # Tipos TypeScript
│   ├── Simulator.ts       # Orquestrador principal
│   ├── sensors/
│   │   ├── SensorManager.ts   # Gerenciamento de sensores
│   │   └── VirtualBoard.ts    # Board virtual
│   ├── firebase/
│   │   └── FirebaseClient.ts  # Cliente Firebase
│   └── cli/
│       └── CLI.ts             # Interface CLI
```

**Implementação com Johnny-Five:**

O simulador utiliza Johnny-Five com mock-firmata para simular o Arduino. A arquitetura está pronta para migração para hardware real - basta remover o mock-firmata e conectar Arduino via USB.

## Aplicativo Flutter

### Instalação

```bash
cd iot_monitor_app
flutter pub get
```

### Executar

```bash
flutter run
```

Para web:
```bash
flutter run -d chrome
```

### Arquitetura Clean

```
lib/
├── main.dart
├── firebase_options.dart
├── core/
│   ├── error/
│   │   └── failures.dart      # Classes de erro tipadas
│   └── utils/
│       └── logger.dart         # Logger configurado
├── cubit/
│   ├── sensor_cubit.dart       # Lógica de negócio
│   └── sensor_state.dart       # State Pattern
├── data/
│   └── firebase_service.dart   # Either<L,R> pattern
├── models/
│   └── sensor_model.dart       # Modelos de domínio
├── pages/
│   └── dashboard_page.dart     # UI
└── widgets/                    # Componentes reutilizáveis
```

### Estados da Aplicação

- `SensorInitial`: Estado inicial
- `SensorLoading`: Carregando dados
- `SensorLoaded`: Dados carregados
- `SensorError`: Erro ao carregar
- `SensorSendingCommand`: Enviando comando
- `SensorCommandSent`: Comando enviado
- `SensorCommandFailed`: Falha no comando

### Tratamento de Erros

```dart
Either<Failure, Success>
```

**Failures tipadas:**
- `FirebaseConnectionFailure`
- `DataParsingFailure`
- `TimeoutFailure`
- `CommandFailure`
- `UnknownFailure`

### Fluxo de Dados

1. Simulador → Firebase: Envia dados a cada 2s
2. Firebase → App: Listener em tempo real
3. App → Firebase: Comandos de controle
4. Firebase → Simulador: Reage aos comandos

## Estrutura do Projeto

```
utfpr-IOT-trabalho-final/
├── arduino-simulator/          # Simulador Node.js/TypeScript
│   ├── src/
│   │   ├── sensors/           # Gerenciamento de sensores
│   │   ├── firebase/          # Cliente Firebase
│   │   └── cli/               # Interface CLI
│   ├── index.ts
│   └── package.json
│
├── iot_monitor_app/           # App Flutter
│   ├── lib/
│   │   ├── core/             # Utilitários core
│   │   ├── cubit/            # BLoC/Cubit
│   │   ├── data/             # Camada de dados
│   │   ├── models/           # Modelos de domínio
│   │   ├── pages/            # Telas UI
│   │   └── widgets/          # Componentes
│   ├── assets/images/        # Imagens e ícones
│   └── pubspec.yaml
│
└── README.md
```

## Limites e Status

### Temperatura
- OK: < 30°C (Verde)
- Alerta: 30-35°C (Amarelo)
- Crítico: > 35°C (Vermelho)

### Luminosidade
- OK: 400-800 lux (Verde)
- Alerta: 300-399 ou 801-900 lux (Amarelo)
- Crítico: < 300 ou > 900 lux (Vermelho)

### Painel Consolidado
- Vermelho: Qualquer sensor crítico
- Amarelo: Qualquer sensor em alerta
- Verde: Todos os sensores OK

## Logs e Debugging

**Simulador:**
```bash
[AUTO] Enviado: { temp: '28.5°C (OK)', luz: '650 lux (OK)' }
[COMANDO] Recebido do app: VERMELHO
```

**App Flutter:**
```
💡 [INFO] Firebase inicializado
🔄 [INFO] Listener de sensores ativo
✅ [INFO] Comando enviado: AMARELO
```

## Troubleshooting

**Simulador não conecta:**
- Verifique `serviceAccountKey.json`
- Configure regras do Firebase para desenvolvimento
- Confirme URL do database

**App não recebe dados:**
- Certifique-se que o simulador está rodando
- Verifique `firebase_options.dart`
- Confirme conexão com internet

## Autores

Johnny Freire - UTFPR

## Licença

Projeto acadêmico - UTFPR - Trabalho Final de IoT
