import '../../models/sensor_model.dart';
import '../../models/notification_model.dart';
import '../../data/notification_repository.dart';
import 'notification_service.dart';

/// Serviço responsável por monitorar alertas críticos dos sensores
/// e gerenciar notificações (local + Firebase)
class AlertMonitoringService {
  final NotificationService _notificationService = NotificationService();
  final NotificationRepository _notificationRepository =
      NotificationRepository();
  final Set<String> _notifiedSensors = {};

  /// Verifica todos os sensores e dispara notificações para alertas críticos
  Future<void> checkCriticalAlerts(SensoresPayload data) async {
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
      await _checkSensor(
        name: sensor['name'] as String,
        value: sensor['value'] as SensorValue,
        label: sensor['label'] as String,
      );
    }
  }

  /// Verifica um sensor individual e dispara notificação se necessário
  Future<void> _checkSensor({
    required String name,
    required SensorValue value,
    required String label,
  }) async {
    if (value.status == 'CRITICO') {
      if (!_notifiedSensors.contains(name)) {
        _notifiedSensors.add(name);

        // Mostrar notificação local
        await _notificationService.showCriticalAlert(
          title: 'Alerta Crítico: $label',
          body: '${value.valor}${value.unidade} - Ação imediata necessária!',
          sensorName: name,
        );

        // Salvar no Firebase
        final notification = AlertNotification(
          id: '',
          sensorName: name,
          sensorLabel: label,
          valor: value.valor,
          unidade: value.unidade,
          status: value.status,
          timestamp: DateTime.now().millisecondsSinceEpoch,
        );

        await _notificationRepository.saveNotification(notification);
      }
    } else {
      // Remove do set quando não está mais crítico
      _notifiedSensors.remove(name);
    }
  }

  /// Limpa o histórico de sensores notificados
  void clearNotifiedSensors() {
    _notifiedSensors.clear();
  }
}
