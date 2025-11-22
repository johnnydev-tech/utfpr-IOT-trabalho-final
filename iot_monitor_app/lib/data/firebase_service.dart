import 'package:firebase_database/firebase_database.dart';
import '../models/sensor_model.dart';

class FirebaseService {
  final db = FirebaseDatabase.instance.ref('/agro/algodao');

  void listenToSensors(void Function(SensoresPayload) onData) {
    db.child('sensores').onValue.listen((event) {
      final v = event.snapshot.value as Map?;
      if (v == null) return;
      final payload = SensoresPayload.fromMap(Map<String, dynamic>.from(v));
      onData(payload);
    });
  }

  Future<void> sendCommand(String estado) async {
    await db.child('comandos').set({'forcar_estado': estado});
  }
}
