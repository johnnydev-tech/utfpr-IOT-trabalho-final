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

- **Temperatura**: Monitoramento entre 22°C e 38°C
- **Luminosidade**: Monitoramento entre 200 e 900 lux
- **Sistema de Alertas**: Verde (OK), Amarelo (Alerta), Vermelho (Crítico)
- **Atualização em Tempo Real**: Dados sincronizados via Firebase Realtime Database

## 🏗️ Arquitetura

```
┌─────────────────────┐
│  Arduino Simulador  │ ──┐
│   (Node.js + TS)    │   │
└─────────────────────┘   │
                          │
                          ▼
              ┌──────────────────────┐
              │  Firebase Realtime   │
              │      Database        │
              └──────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   App Flutter       │
              │  (Dashboard + UI)   │
              └─────────────────────┘
```

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

### 2. Configurar o Simulador Arduino

```bash
cd arduino-simulator
npm install
```

**Importante**: Certifique-se de que o arquivo `serviceAccountKey.json` está presente na pasta `arduino-simulator/`.

### 3. Configurar o App Flutter

```bash
cd ../iot_monitor_app
flutter pub get
```

### 4. Executar o Simulador

**Opção 1: Via VS Code (Recomendado)**

1. Abra o projeto no VS Code
2. Pressione `F5` ou vá em `Run → Start Debugging`
3. Selecione **"Arduino Simulado"** na lista de configurações

**Opção 2: Via Terminal**

```bash
cd arduino-simulator
npm start
```

### 5. Executar o App Flutter

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
│   │   ├── cubit/             # Gerenciamento de estado (BLoC)
│   │   ├── data/              # Serviços e repositórios
│   │   ├── models/            # Modelos de dados
│   │   ├── pages/             # Telas do app
│   │   └── widgets/           # Componentes reutilizáveis
│   ├── pubspec.yaml           # Dependências Flutter
│   └── android/ios/web/       # Configurações de plataforma
│
├── .vscode/
│   └── launch.json            # Configurações de debug do VS Code
│
└── README.md                  # Este arquivo
```

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

- Verifique se o arquivo `serviceAccountKey.json` está presente
- Confirme que a URL do banco de dados está correta
- Verifique as regras de segurança do Firebase Realtime Database

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

## 👥 Autores

- Johnny Freire - UTFPR

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos - UTFPR - Trabalho Final de IoT
