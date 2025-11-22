class SensorValue {
  final double valor;
  final String status;
  final int timestamp;

  SensorValue({required this.valor, required this.status, required this.timestamp});

  factory SensorValue.fromMap(Map m) => SensorValue(
    valor: (m['valor'] as num).toDouble(),
    status: m['status'] as String,
    timestamp: m['timestamp'] as int,
  );
}

class SensoresPayload {
  final SensorValue temperatura;
  final SensorValue luminosidade;
  final String painel;
  final int timestamp;

  SensoresPayload({required this.temperatura, required this.luminosidade, required this.painel, required this.timestamp});

  factory SensoresPayload.fromMap(Map m) => SensoresPayload(
    temperatura: SensorValue.fromMap(Map<String, dynamic>.from(m['temperatura'])),
    luminosidade: SensorValue.fromMap(Map<String, dynamic>.from(m['luminosidade'])),
    painel: m['painel'] as String,
    timestamp: m['timestamp'] as int,
  );
}
