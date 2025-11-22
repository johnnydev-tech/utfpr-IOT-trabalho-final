class SensorValue {
  final double valor;
  final String status;
  final int timestamp;
  final String unidade;

  SensorValue({
    required this.valor,
    required this.status,
    required this.timestamp,
    required this.unidade,
  });

  factory SensorValue.fromMap(Map m) => SensorValue(
    valor: (m['valor'] as num).toDouble(),
    status: m['status'] as String,
    timestamp: m['timestamp'] as int,
    unidade: m['unidade'] as String? ?? '',
  );
}

class SensoresPayload {
  final SensorValue temperatura;
  final SensorValue luminosidade;
  final SensorValue umidade;
  final SensorValue umidadeSolo;
  final SensorValue ph;
  final SensorValue pressao;
  final String painel;
  final int timestamp;

  SensoresPayload({
    required this.temperatura,
    required this.luminosidade,
    required this.umidade,
    required this.umidadeSolo,
    required this.ph,
    required this.pressao,
    required this.painel,
    required this.timestamp,
  });

  factory SensoresPayload.fromMap(Map m) {
    // Criar sensor padrão caso não exista no Firebase (compatibilidade retroativa)
    SensorValue createDefaultSensor(String unidade, double valor) {
      return SensorValue(
        valor: valor,
        status: 'OK',
        timestamp: DateTime.now().millisecondsSinceEpoch,
        unidade: unidade,
      );
    }

    return SensoresPayload(
      temperatura: SensorValue.fromMap(
        Map<String, dynamic>.from(m['temperatura']),
      ),
      luminosidade: SensorValue.fromMap(
        Map<String, dynamic>.from(m['luminosidade']),
      ),
      umidade: m.containsKey('umidade')
          ? SensorValue.fromMap(Map<String, dynamic>.from(m['umidade']))
          : createDefaultSensor('%', 60.0),
      umidadeSolo: m.containsKey('umidade_solo')
          ? SensorValue.fromMap(Map<String, dynamic>.from(m['umidade_solo']))
          : createDefaultSensor('%', 70.0),
      ph: m.containsKey('ph')
          ? SensorValue.fromMap(Map<String, dynamic>.from(m['ph']))
          : createDefaultSensor('', 6.5),
      pressao: m.containsKey('pressao')
          ? SensorValue.fromMap(Map<String, dynamic>.from(m['pressao']))
          : createDefaultSensor('hPa', 1013.0),
      painel: m['painel'] as String,
      timestamp: m['timestamp'] as int,
    );
  }
}
