// lib/data/notification_repository.dart
import 'package:firebase_database/firebase_database.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final DatabaseReference _db = FirebaseDatabase.instance.ref();

  // Salvar nova notificação
  Future<void> saveNotification(AlertNotification notification) async {
    final notificationRef = _db.child('agro/algodao/notificacoes').push();
    await notificationRef.set(notification.toMap());
  }

  // Buscar todas as notificações (ordenadas por timestamp)
  Stream<List<AlertNotification>> watchNotifications() {
    return _db
        .child('agro/algodao/notificacoes')
        .orderByChild('timestamp')
        .onValue
        .map((event) {
          final List<AlertNotification> notifications = [];

          if (event.snapshot.value != null) {
            final data = Map<String, dynamic>.from(event.snapshot.value as Map);

            data.forEach((key, value) {
              notifications.add(
                AlertNotification.fromMap(
                  Map<String, dynamic>.from(value),
                  key,
                ),
              );
            });

            // Ordenar por timestamp decrescente (mais recente primeiro)
            notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
          }

          return notifications;
        });
  }

  // Marcar notificação como lida
  Future<void> markAsRead(String notificationId) async {
    await _db.child('agro/algodao/notificacoes/$notificationId/lida').set(true);
  }

  // Marcar todas como lidas
  Future<void> markAllAsRead() async {
    final snapshot = await _db.child('agro/algodao/notificacoes').get();

    if (snapshot.value != null) {
      final data = Map<String, dynamic>.from(snapshot.value as Map);
      final updates = <String, dynamic>{};

      data.forEach((key, value) {
        updates['agro/algodao/notificacoes/$key/lida'] = true;
      });

      if (updates.isNotEmpty) {
        await _db.update(updates);
      }
    }
  }

  // Limpar notificações antigas (mais de 30 dias)
  Future<void> cleanOldNotifications() async {
    final thirtyDaysAgo = DateTime.now()
        .subtract(const Duration(days: 30))
        .millisecondsSinceEpoch;

    final snapshot = await _db
        .child('agro/algodao/notificacoes')
        .orderByChild('timestamp')
        .endAt(thirtyDaysAgo)
        .get();

    if (snapshot.value != null) {
      final data = Map<String, dynamic>.from(snapshot.value as Map);

      for (final key in data.keys) {
        await _db.child('agro/algodao/notificacoes/$key').remove();
      }
    }
  }
}
