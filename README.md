# 🌾 Sistema de Monitoramento IoT para Agricultura - UTFPR

Sistema completo de monitoramento de sensores para cultivo de algodão, com simulador Arduino e aplicativo Flutter em tempo real.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Testando o Sistema](#testando-o-sistema)
- [Comandos do Simulador](#comandos-do-simulador)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🎯 Visão Geral

Este projeto simula um sistema IoT para monitoramento de condições ambientais em plantações de algodão, incluindo:

### Sensores Atmosféricos
- **Temperatura**: 15-42°C (ideal: 20-30°C)
- **Luminosidade**: 100-1000 lux (ideal: 400-800 lux)
- **Umidade do Ar**: 30-95% (ideal: 50-70%)
- **Pressão Atmosférica**: 950-1050 hPa (ideal: 1000-1025 hPa)

### Sensores do Solo
- **Umidade do Solo**: 20-100% (ideal: 60-80%)
- **pH do Solo**: 4.0-9.0 (ideal: 5.8-8.0)

### Recursos
- **Sistema de Alertas**: Verde (OK), Amarelo (Alerta), Vermelho (Crítico)
- **Atualização em Tempo Real**: Dados sincronizados via Firebase Realtime Database
- **Arquitetura Modular**: Preparado para hardware real com johnny-five
- **Cotton Design System**: Interface moderna com paleta de cores profissional

## 🏗️ Arquitetura

```
┌─────────────────────┐
│  Arduino Simulador  │ ──┐
│   (Node.js + TS)    │   │
│  - Interactive CLI  │   │
│  - Manual/Auto Mode │   │
└─────────────────────┘   │
                          │
                          ▼
              ┌──────────────────────┐
              │  Firebase Realtime   │
              │      Database        │
              │   - Real-time sync   │
              └──────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   App Flutter       │
              │  - State Pattern    │
              │  - Either<L,R>      │
              │  - BLoC/Cubit       │
              │  - Error Handling   │
              └─────────────────────┘
```

### Padrões Implementados

#### State Pattern
O app utiliza **State Pattern** para gerenciar diferentes estados da aplicação:
- `SensorInitial` - Estado inicial
- `SensorLoading` - Carregando dados
- `SensorLoaded` - Dados carregados com sucesso
- `SensorError` - Erro ao carregar dados
- `SensorSendingCommand` - Enviando comando
- `SensorCommandSent` - Comando enviado com sucesso
- `SensorCommandFailed` - Falha ao enviar comando

#### Either Pattern (Programação Funcional)
Usando **dartz** para tratamento de erros tipado:
```dart
Either<Failure, Success>
```
- **Left**: Representa falhas (FirebaseConnectionFailure, DataParsingFailure, etc.)
- **Right**: Representa sucesso com dados válidos

#### BLoC/Cubit Pattern
- **Separation of Concerns**: Lógica de negócio separada da UI
- **Reactive Programming**: Stream de estados reativos
- **Testability**: Fácil de testar e mockar

### Fluxo de Dados

1. **Simulador → Firebase**: Envia dados de sensores a cada 2 segundos
2. **Firebase → App**: App Flutter escuta mudanças em tempo real
3. **App → Firebase**: Envia comandos de controle
4. **Firebase → Simulador**: Simulador reage aos comandos

## 📦 Pré-requisitos

### Para o Simulador Arduino

- **Node.js**: v16 ou superior
- **npm** ou **yarn**
- Conta Firebase com Realtime Database configurado

### Para o App Flutter

- **Flutter SDK**: 3.0 ou superior
- **Dart SDK**: 3.0 ou superior
- **VS Code** ou **Android Studio**
- Emulador/dispositivo Android/iOS ou navegador (para web)

## 🚀 Como Executar

### 1. Clonar o Repositório

```bash
git clone https://github.com/johnnydev-tech/utfpr-IOT-trabalho-final.git
cd utfpr-IOT-trabalho-final
```

### 2. Configurar Firebase Realtime Database

⚠️ **IMPORTANTE**: Configure as regras do Firebase antes de continuar!

📖 **[Guia Completo de Configuração do Firebase →](FIREBASE_SETUP.md)**

**Configuração Rápida:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Realtime Database → Rules**
4. Cole este código (apenas para desenvolvimento):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. Clique em **Publish**

### 3. Configurar o Simulador Arduino

```bash
cd arduino-simulator
npm install
```

#### Obter Service Account Key (Recomendado para Produção)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem) > **Service Accounts**
4. Clique em **Generate New Private Key**
5. Salve o arquivo baixado como `serviceAccountKey.json` na pasta `arduino-simulator/`

#### Modo de Desenvolvimento (Alternativo)

Se você não tiver o `serviceAccountKey.json`, o simulador funcionará em **modo de desenvolvimento** automaticamente. 

⚠️ **Importante**: Para o modo de desenvolvimento funcionar, as regras do Firebase Realtime Database devem estar configuradas para permitir leitura/escrita:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Nota**: Use regras abertas apenas em desenvolvimento. Em produção, configure regras de segurança adequadas.

### 4. Configurar o App Flutter

```bash
cd ../iot_monitor_app
flutter pub get
```

### 5. Executar o Simulador

**Opção 1: Via VS Code (Recomendado)**

1. Abra o projeto no VS Code
2. Pressione `F5` ou vá em `Run → Start Debugging`
3. Selecione **"Arduino Simulado"** na lista de configurações

**Opção 2: Via Terminal**

```bash
cd arduino-simulator
npm start
```

### 6. Executar o App Flutter

**Opção 1: Via VS Code (Recomendado)**

1. Certifique-se de ter um dispositivo/emulador conectado ou use Chrome para web
2. Pressione `F5` ou vá em `Run → Start Debugging`
3. Selecione **"IOT APP"** na lista de configurações

**Opção 2: Via Terminal**

```bash
cd iot_monitor_app
flutter run
```

Para executar na web:
```bash
flutter run -d chrome
```

## 🧪 Testando o Sistema

### Cenário 1: Testar Modo Automático (Padrão)

1. Inicie o simulador - ele começará a enviar dados aleatórios
2. Abra o app Flutter - você verá os dados atualizando em tempo real
3. Observe as mudanças de status e cores do painel

### Cenário 2: Testar Valores Críticos

No terminal do simulador, digite:

```bash
# Definir temperatura crítica
temp 37

# Definir luminosidade crítica
luz 950
```

No app, você verá o painel mudar para **VERMELHO**.

### Cenário 3: Testar Valores de Alerta

```bash
# Definir temperatura de alerta
temp 32

# Definir luminosidade de alerta
luz 350
```

No app, você verá o painel mudar para **AMARELO**.

### Cenário 4: Testar Valores Normais

```bash
# Definir valores normais
temp 25
luz 600
```

No app, você verá o painel mudar para **VERDE**.

### Cenário 5: Voltar ao Modo Automático

```bash
auto
```

O simulador voltará a gerar valores aleatórios.

## 📱 Comandos do Simulador

O simulador possui uma interface interativa de linha de comando:

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `temp <valor>` | Define temperatura manual (°C) | `temp 32` |
| `luz <valor>` | Define luminosidade manual (lux) | `luz 450` |
| `auto` | Volta ao modo automático | `auto` |
| `status` | Mostra valores atuais | `status` |
| `help` | Mostra o menu de ajuda | `help` |
| `exit` | Encerra o simulador | `exit` |

### Exemplo de Sessão

```bash
> temp 35
✓ Temperatura definida para 35°C (modo manual)

> luz 800
✓ Luminosidade definida para 800 lux (modo manual)

> status
📊 Status atual:
Modo: MANUAL
Temperatura: 35 °C
Luminosidade: 800 lux

> auto
✓ Modo automático ativado
```

## 📊 Limites e Status

### Temperatura

| Faixa | Status |
|-------|--------|
| < 30°C | ✅ OK (Verde) |
| 30-35°C | ⚠️ ALERTA (Amarelo) |
| > 35°C | 🔴 CRÍTICO (Vermelho) |

### Luminosidade

| Faixa | Status |
|-------|--------|
| 400-800 lux | ✅ OK (Verde) |
| 300-399 ou 801-900 lux | ⚠️ ALERTA (Amarelo) |
| < 300 ou > 900 lux | 🔴 CRÍTICO (Vermelho) |

### Painel Consolidado

O painel mostra a cor baseada na prioridade:
- 🔴 **VERMELHO**: Se qualquer sensor estiver crítico
- 🟡 **AMARELO**: Se qualquer sensor estiver em alerta
- 🟢 **VERDE**: Se todos os sensores estiverem OK

## 📁 Estrutura do Projeto

```
utfpr-IOT-trabalho-final/
├── arduino-simulator/           # Simulador Arduino em Node.js/TypeScript
│   ├── arduino-simulado.ts     # Código principal do simulador
│   ├── package.json            # Dependências Node.js
│   ├── tsconfig.json           # Configuração TypeScript
│   └── serviceAccountKey.json  # Credenciais Firebase (não versionado)
│
├── iot_monitor_app/            # Aplicativo Flutter
│   ├── lib/
│   │   ├── main.dart          # Entrada do app
│   │   ├── firebase_options.dart  # Configurações Firebase
│   │   ├── core/              # 🆕 Core utilities
│   │   │   ├── error/
│   │   │   │   └── failures.dart  # Classes de falhas tipadas
│   │   │   └── utils/
│   │   │       └── logger.dart    # Logger configurado
│   │   ├── cubit/             # Gerenciamento de estado (BLoC)
│   │   │   ├── sensor_cubit.dart  # Lógica de negócio
│   │   │   └── sensor_state.dart  # 🆕 State Pattern implementation
│   │   ├── data/              # 🆕 Camada de dados com Either
│   │   │   └── firebase_service.dart
│   │   ├── models/            # Modelos de dados
│   │   │   └── sensor_model.dart
│   │   ├── pages/             # 🆕 UI melhorada com tratamento de estados
│   │   │   └── dashboard_page.dart
│   │   └── widgets/           # Componentes reutilizáveis
│   ├── pubspec.yaml           # Dependências Flutter
│   └── android/ios/web/       # Configurações de plataforma
│
├── .vscode/
│   └── launch.json            # Configurações de debug do VS Code
│
└── README.md                  # Este arquivo
```

### 🆕 Melhorias Implementadas

#### Logs Detalhados
- **Logger configurado** com níveis (debug, info, warning, error, fatal)
- **Emojis** para fácil identificação visual
- **Stack traces** para debugging
- **Timestamps** automáticos

#### Tratamento de Erros Robusto
- **Either Pattern** para erros tipados
- **Failure classes** específicas por tipo de erro
- **Error recovery** automático
- **User-friendly messages** na UI

#### UI/UX Melhorada
- **SnackBars** para feedback de comandos
- **Loading states** informativos
- **Error states** com opção de retry
- **Status cards** visuais
- **Responsive design**

## 🔧 Configuração Avançada

### Modificar Intervalo de Atualização

No arquivo `arduino-simulator/arduino-simulado.ts`, linha 8:

```typescript
const CONFIG = {
  UPDATE_INTERVAL: 2000, // Altere para o intervalo desejado em ms
  // ...
};
```

### Modificar Limites de Sensores

No mesmo arquivo `CONFIG`:

```typescript
const CONFIG = {
  // ...
  TEMP_OK_MAX: 30,      // Temperatura máxima para OK
  TEMP_ALERTA_MAX: 35,  // Temperatura máxima para ALERTA
  LUZ_OK_MIN: 400,      // Luminosidade mínima para OK
  LUZ_OK_MAX: 800,      // Luminosidade máxima para OK
  // ...
};
```

## 🐛 Troubleshooting

### Simulador não conecta ao Firebase

**Erro: "Failed to parse private key"**
- O arquivo `serviceAccountKey.json` contém dados de exemplo
- Baixe o arquivo real do Firebase Console (veja instruções acima)
- Ou configure as regras do Firebase para permitir acesso em modo desenvolvimento

**Erro de conexão**
- Confirme que a URL do banco de dados está correta
- Verifique sua conexão com internet
- Verifique as regras de segurança do Firebase Realtime Database

**Para testar rapidamente** (apenas desenvolvimento):
1. Vá ao Firebase Console > Realtime Database > Rules
2. Configure as regras como:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. Execute o simulador - ele usará modo de desenvolvimento automaticamente

### App Flutter não recebe dados

- Certifique-se de que o simulador está rodando
- Verifique a conexão com internet
- Confirme que o `firebase_options.dart` está configurado corretamente

### Erro de compilação TypeScript

```bash
cd arduino-simulator
rm -rf node_modules package-lock.json
npm install
```

## 📊 Logs e Debugging

### Logs do Simulador

O simulador exibe logs coloridos e informativos:

```bash
🚀 Iniciando Arduino Simulado...
📡 Conectando ao Firebase...
✓ Conectado ao Firebase!
[AUTO] Enviado: { temp: '28.5°C (OK)', luz: '650 lux (OK)', painel: VERDE }
📥 Comando recebido do app: forçar painel VERMELHO
```

### Logs do App Flutter

O app utiliza o pacote `logger` com diferentes níveis:

- `🐛 DEBUG`: Informações detalhadas de desenvolvimento
- `💡 INFO`: Eventos importantes do app
- `⚠️ WARNING`: Situações que requerem atenção
- `❌ ERROR`: Erros recuperáveis
- `💀 FATAL`: Erros críticos não recuperáveis

Exemplo de log:

```
💡 [INFO] 🚀 Iniciando aplicação
💡 [INFO] ✅ Firebase inicializado com sucesso
💡 [INFO] 🔄 Iniciando listener de sensores
🐛 [DEBUG] ✅ Dados recebidos: Temp=25.3°C, Luz=580lux, Painel=VERDE
💡 [INFO] 📤 Enviando comando: AMARELO
💡 [INFO] ✅ Comando enviado com sucesso: AMARELO
```

### Tratamento de Erros

O sistema possui classes específicas de erro:

1. **FirebaseConnectionFailure**: Problemas de conexão
2. **DataParsingFailure**: Erro ao processar dados
3. **TimeoutFailure**: Timeout de operação
4. **CommandFailure**: Falha ao enviar comando
5. **UnknownFailure**: Erros não categorizados

Cada erro exibe:
- Mensagem amigável na UI
- Log detalhado no console
- Stack trace para debugging
- Opção de retry quando aplicável

## 👥 Autores

- Johnny Freire - UTFPR

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos - UTFPR - Trabalho Final de IoT
