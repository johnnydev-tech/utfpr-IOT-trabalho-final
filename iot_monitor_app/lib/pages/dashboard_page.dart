import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/sensor_cubit.dart';
import '../cubit/sensor_state.dart';
import '../models/sensor_model.dart';
import '../models/notification_model.dart';
import '../core/theme/app_palette.dart';
import '../core/theme/app_constants.dart';
import '../core/services/notification_service.dart';
import '../data/notification_repository.dart';
import 'notifications_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final Set<String> _notifiedSensors = {};

  void _checkCriticalAlerts(SensoresPayload data) async {
    final sensors = [
      {
        'name': 'temperatura',
        'value': data.temperatura,
        'label': 'Temperatura',
      },
      {
        'name': 'luminosidade',
        'value': data.luminosidade,
        'label': 'Luminosidade',
      },
      {'name': 'umidade', 'value': data.umidade, 'label': 'Umidade do Ar'},
      {
        'name': 'umidade_solo',
        'value': data.umidadeSolo,
        'label': 'Umidade do Solo',
      },
      {'name': 'ph', 'value': data.ph, 'label': 'pH do Solo'},
      {'name': 'pressao', 'value': data.pressao, 'label': 'Pressão'},
    ];

    for (final sensor in sensors) {
      final sensorName = sensor['name'] as String;
      final sensorValue = sensor['value'] as SensorValue;
      final sensorLabel = sensor['label'] as String;

      if (sensorValue.status == 'CRITICO') {
        if (!_notifiedSensors.contains(sensorName)) {
          _notifiedSensors.add(sensorName);
          
          // Mostrar notificação local
          NotificationService().showCriticalAlert(
            title: 'Alerta Crítico: $sensorLabel',
            body:
                '${sensorValue.valor}${sensorValue.unidade} - Ação imediata necessária!',
            sensorName: sensorName,
          );
          
          // Salvar no Firebase
          final notification = AlertNotification(
            id: '',
            sensorName: sensorName,
            sensorLabel: sensorLabel,
            valor: sensorValue.valor,
            unidade: sensorValue.unidade,
            status: sensorValue.status,
            timestamp: DateTime.now().millisecondsSinceEpoch,
          );
          
          await NotificationRepository().saveNotification(notification);
        }
      } else {
        _notifiedSensors.remove(sensorName);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(
                AppConstants.borderRadiusSmall,
              ),
              child: Image.asset(
                'assets/images/cotton_icon.png',
                height: AppConstants.iconSizeMedium,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: AppConstants.paddingSmall),
            const Text('Monitor Algodão'),
          ],
        ),
        elevation: AppConstants.elevationSmall,
        actions: [
          // Botão de notificações com badge
          StreamBuilder<List<AlertNotification>>(
            stream: NotificationRepository().watchNotifications(),
            builder: (context, snapshot) {
              final unreadCount = snapshot.data
                      ?.where((n) => !n.lida)
                      .length ?? 0;
              
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const NotificationsPage(),
                        ),
                      );
                    },
                    tooltip: 'Histórico de Alertas',
                  ),
                  if (unreadCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppPalette.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          unreadCount > 9 ? '9+' : '$unreadCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: BlocConsumer<SensorCubit, SensorState>(
        listener: (context, state) {
          // Verificar alertas críticos e enviar notificações
          if (state is SensorLoaded) {
            _checkCriticalAlerts(state.data);
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
            Icon(
              Icons.sensors,
              size: AppConstants.iconSizeExtraLarge,
              color: AppPalette.gray,
            ),
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
              const Icon(
                Icons.error_outline,
                size: AppConstants.iconSizeExtraLarge,
                color: AppPalette.error,
              ),
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

    if (state is SensorLoaded) {
      data = state.data;
    } else if (state is SensorSendingCommand) {
      data = state.currentData;
    } else if (state is SensorCommandSent) {
      data = state.data;
    } else if (state is SensorCommandFailed) {
      data = state.currentData;
    }

    if (data == null) {
      return const Center(child: Text('Aguardando dados...'));
    }

    return _buildDashboard(context, data);
  }

  Widget _buildDashboard(BuildContext context, SensoresPayload data) {
    Color panelColor = AppPalette.sensorOk;
    IconData panelIcon = Icons.check_circle;

    if (data.painel == 'AMARELO') {
      panelColor = AppPalette.sensorAlert;
      panelIcon = Icons.warning;
    } else if (data.painel == 'VERMELHO') {
      panelColor = AppPalette.sensorCritical;
      panelIcon = Icons.dangerous;
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 24),

          // Status Panel
          Container(
            margin: const EdgeInsets.symmetric(
              horizontal: AppConstants.paddingLarge,
            ),
            padding: const EdgeInsets.all(AppConstants.paddingLarge),
            decoration: BoxDecoration(
              color: panelColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(
                AppConstants.borderRadiusNormal,
              ),
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

          // Sensores Atmosféricos
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Condições Atmosféricas',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          const SizedBox(height: 8),

          _buildSensorCard(
            context,
            title: 'Temperatura',
            value:
                '${data.temperatura.valor.toStringAsFixed(1)}${data.temperatura.unidade}',
            status: data.temperatura.status,
            icon: Icons.thermostat,
          ),

          _buildSensorCard(
            context,
            title: 'Luminosidade',
            value:
                '${data.luminosidade.valor.toStringAsFixed(0)}${data.luminosidade.unidade}',
            status: data.luminosidade.status,
            icon: Icons.wb_sunny,
          ),

          _buildSensorCard(
            context,
            title: 'Umidade do Ar',
            value:
                '${data.umidade.valor.toStringAsFixed(1)}${data.umidade.unidade}',
            status: data.umidade.status,
            icon: Icons.water_drop,
          ),

          _buildSensorCard(
            context,
            title: 'Pressão Atmosférica',
            value:
                '${data.pressao.valor.toStringAsFixed(0)}${data.pressao.unidade}',
            status: data.pressao.status,
            icon: Icons.compress,
          ),

          const SizedBox(height: 24),

          // Sensores do Solo
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Condições do Solo',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          const SizedBox(height: 8),

          _buildSensorCard(
            context,
            title: 'Umidade do Solo',
            value:
                '${data.umidadeSolo.valor.toStringAsFixed(1)}${data.umidadeSolo.unidade}',
            status: data.umidadeSolo.status,
            icon: Icons.grass,
          ),

          _buildSensorCard(
            context,
            title: 'pH do Solo',
            value: '${data.ph.valor.toStringAsFixed(1)}${data.ph.unidade}',
            status: data.ph.status,
            icon: Icons.science,
          ),

          const SizedBox(height: 32),
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
    Color statusColor = AppPalette.sensorOk;
    if (status == 'ALERTA') statusColor = AppPalette.sensorAlert;
    if (status == 'CRITICO') statusColor = AppPalette.sensorCritical;

    return Card(
      child: ListTile(
        minVerticalPadding: 0,
        contentPadding: const EdgeInsets.all(AppConstants.paddingNormal),
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
