// lib/models/notification_model.dart
class AlertNotification {
  final String id;
  final String sensorName;
  final String sensorLabel;
  final double valor;
  final String unidade;
  final String status;
  final int timestamp;
  final bool lida;

  AlertNotification({
    required this.id,
    required this.sensorName,
    required this.sensorLabel,
    required this.valor,
    required this.unidade,
    required this.status,
    required this.timestamp,
    this.lida = false,
  });

  factory AlertNotification.fromMap(Map<dynamic, dynamic> map, String id) {
    return AlertNotification(
      id: id,
      sensorName: map['sensorName'] as String,
      sensorLabel: map['sensorLabel'] as String,
      valor: (map['valor'] as num).toDouble(),
      unidade: map['unidade'] as String,
      status: map['status'] as String,
      timestamp: map['timestamp'] as int,
      lida: map['lida'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'sensorName': sensorName,
      'sensorLabel': sensorLabel,
      'valor': valor,
      'unidade': unidade,
      'status': status,
      'timestamp': timestamp,
      'lida': lida,
    };
  }

  AlertNotification copyWith({bool? lida}) {
    return AlertNotification(
      id: id,
      sensorName: sensorName,
      sensorLabel: sensorLabel,
      valor: valor,
      unidade: unidade,
      status: status,
      timestamp: timestamp,
      lida: lida ?? this.lida,
    );
  }

  DateTime get dateTime => DateTime.fromMillisecondsSinceEpoch(timestamp);

  String get formattedTime {
    final date = dateTime;
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) {
      return 'Agora';
    } else if (diff.inHours < 1) {
      return '${diff.inMinutes}min atrás';
    } else if (diff.inDays < 1) {
      return '${diff.inHours}h atrás';
    } else if (diff.inDays == 1) {
      return 'Ontem';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d atrás';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  String get fullFormattedTime {
    final date = dateTime;
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} às ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
