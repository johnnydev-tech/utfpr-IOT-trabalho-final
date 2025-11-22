import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/sensor_cubit.dart';
import '../cubit/sensor_state.dart';
import '../models/sensor_model.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🌾 Monitor Algodão'), elevation: 2),
      body: BlocConsumer<SensorCubit, SensorState>(
        listener: (context, state) {
          // Show snackbars for command results
          if (state is SensorCommandSent) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(child: Text(state.message)),
                  ],
                ),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 2),
              ),
            );
          } else if (state is SensorCommandFailed) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.white),
                    const SizedBox(width: 8),
                    Expanded(child: Text(state.failure.message)),
                  ],
                ),
                backgroundColor: Colors.red,
                duration: const Duration(seconds: 3),
                action: SnackBarAction(
                  label: 'OK',
                  textColor: Colors.white,
                  onPressed: () {},
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          return _buildBody(context, state);
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, SensorState state) {
    // Handle different states using pattern matching
    if (state is SensorInitial) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.sensors, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Inicializando...', style: TextStyle(fontSize: 18)),
          ],
        ),
      );
    }

    if (state is SensorLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Conectando ao Firebase...', style: TextStyle(fontSize: 16)),
          ],
        ),
      );
    }

    if (state is SensorError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Erro', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(
                state.failure.message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  // Restart the cubit
                  context.read<SensorCubit>().close();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Tentar Novamente'),
              ),
            ],
          ),
        ),
      );
    }

    // Extract data from loaded states
    SensoresPayload? data;
    bool isSendingCommand = false;

    if (state is SensorLoaded) {
      data = state.data;
    } else if (state is SensorSendingCommand) {
      data = state.currentData;
      isSendingCommand = true;
    } else if (state is SensorCommandSent) {
      data = state.data;
    } else if (state is SensorCommandFailed) {
      data = state.currentData;
    }

    if (data == null) {
      return const Center(child: Text('Aguardando dados...'));
    }

    return _buildDashboard(context, data, isSendingCommand);
  }

  Widget _buildDashboard(
    BuildContext context,
    SensoresPayload data,
    bool isSendingCommand,
  ) {
    Color panelColor = Colors.green;
    IconData panelIcon = Icons.check_circle;

    if (data.painel == 'AMARELO') {
      panelColor = Colors.amber;
      panelIcon = Icons.warning;
    } else if (data.painel == 'VERMELHO') {
      panelColor = Colors.red;
      panelIcon = Icons.dangerous;
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 24),

          // Status Panel
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: panelColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: panelColor, width: 2),
            ),
            child: Column(
              children: [
                Icon(panelIcon, size: 72, color: panelColor),
                const SizedBox(height: 12),
                Text(
                  'Status: ${data.painel}',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: panelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _getStatusMessage(data.painel),
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Sensor Cards
          _buildSensorCard(
            context,
            title: '🌡️ Temperatura',
            value: '${data.temperatura.valor.toStringAsFixed(1)}°C',
            status: data.temperatura.status,
            icon: Icons.thermostat,
          ),

          _buildSensorCard(
            context,
            title: '💡 Luminosidade',
            value: '${data.luminosidade.valor} lux',
            status: data.luminosidade.status,
            icon: Icons.wb_sunny,
          ),

          const SizedBox(height: 24),

          // Control Buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Controles Manuais',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildCommandButton(
                      context,
                      label: 'VERDE',
                      color: Colors.green,
                      icon: Icons.check,
                      enabled: !isSendingCommand,
                    ),
                    _buildCommandButton(
                      context,
                      label: 'AMARELO',
                      color: Colors.amber,
                      icon: Icons.warning,
                      enabled: !isSendingCommand,
                    ),
                    _buildCommandButton(
                      context,
                      label: 'VERMELHO',
                      color: Colors.red,
                      icon: Icons.dangerous,
                      enabled: !isSendingCommand,
                    ),
                    _buildCommandButton(
                      context,
                      label: 'AUTO',
                      color: Colors.blue,
                      icon: Icons.auto_mode,
                      enabled: !isSendingCommand,
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          if (isSendingCommand)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  SizedBox(width: 12),
                  Text('Enviando comando...'),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSensorCard(
    BuildContext context, {
    required String title,
    required String value,
    required String status,
    required IconData icon,
  }) {
    Color statusColor = Colors.green;
    if (status == 'ALERTA') statusColor = Colors.amber;
    if (status == 'CRITICO') statusColor = Colors.red;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      child: ListTile(
        leading: Icon(icon, size: 40, color: statusColor),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 18)),
            Text(
              'Status: $status',
              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCommandButton(
    BuildContext context, {
    required String label,
    required Color color,
    required IconData icon,
    required bool enabled,
  }) {
    return ElevatedButton.icon(
      onPressed: enabled
          ? () => context.read<SensorCubit>().forcarEstado(label)
          : null,
      icon: Icon(icon, size: 20),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: enabled ? color : Colors.grey,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }

  String _getStatusMessage(String painel) {
    switch (painel) {
      case 'VERDE':
        return 'Todas as condições estão ótimas';
      case 'AMARELO':
        return 'Atenção: condições em alerta';
      case 'VERMELHO':
        return 'Crítico: ação imediata necessária';
      default:
        return '';
    }
  }
}
