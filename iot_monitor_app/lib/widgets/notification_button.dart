import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../data/notification_repository.dart';
import '../core/theme/app_palette.dart';
import '../pages/notifications_page.dart';

/// Widget de botão de notificações com badge para a AppBar
class NotificationButton extends StatelessWidget {
  const NotificationButton({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AlertNotification>>(
      stream: NotificationRepository().watchNotifications(),
      builder: (context, snapshot) {
        final unreadCount = snapshot.data?.where((n) => !n.lida).length ?? 0;

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
    );
  }
}
