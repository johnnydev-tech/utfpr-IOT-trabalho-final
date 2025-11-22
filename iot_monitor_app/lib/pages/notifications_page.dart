// lib/pages/notifications_page.dart
import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../data/notification_repository.dart';
import '../core/theme/app_palette.dart';
import '../core/theme/app_constants.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = NotificationRepository();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico de Alertas'),
        elevation: AppConstants.elevationSmall,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: () async {
              await repository.markAllAsRead();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Todas as notificações marcadas como lidas'),
                    duration: Duration(seconds: 2),
                  ),
                );
              }
            },
            tooltip: 'Marcar todas como lidas',
          ),
        ],
      ),
      body: StreamBuilder<List<AlertNotification>>(
        stream: repository.watchNotifications(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: AppPalette.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Erro ao carregar notificações',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(snapshot.error.toString()),
                ],
              ),
            );
          }

          final notifications = snapshot.data ?? [];

          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: AppConstants.iconSizeExtraLarge,
                    color: AppPalette.gray,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Nenhum alerta crítico registrado',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Você será notificado quando houver\nalertas críticos nos sensores',
                    textAlign: TextAlign.center,
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(color: AppPalette.gray),
                  ),
                ],
              ),
            );
          }

          // Agrupar por data
          final groupedNotifications = _groupByDate(notifications);

          return ListView.builder(
            padding: const EdgeInsets.all(AppConstants.paddingNormal),
            itemCount: groupedNotifications.length,
            itemBuilder: (context, index) {
              final group = groupedNotifications[index];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppConstants.paddingSmall,
                      vertical: AppConstants.paddingNormal,
                    ),
                    child: Text(
                      group['date'] as String,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppPalette.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ...((group['notifications'] as List<AlertNotification>).map(
                    (notification) => _NotificationCard(
                      notification: notification,
                      repository: repository,
                    ),
                  )),
                  const SizedBox(height: AppConstants.paddingNormal),
                ],
              );
            },
          );
        },
      ),
    );
  }

  List<Map<String, dynamic>> _groupByDate(
    List<AlertNotification> notifications,
  ) {
    final Map<String, List<AlertNotification>> grouped = {};

    for (final notification in notifications) {
      final date = notification.dateTime;
      final now = DateTime.now();
      String dateKey;

      if (date.year == now.year &&
          date.month == now.month &&
          date.day == now.day) {
        dateKey = 'Hoje';
      } else if (date.year == now.year &&
          date.month == now.month &&
          date.day == now.day - 1) {
        dateKey = 'Ontem';
      } else {
        dateKey = '${date.day}/${date.month}/${date.year}';
      }

      grouped.putIfAbsent(dateKey, () => []);
      grouped[dateKey]!.add(notification);
    }

    return grouped.entries
        .map((e) => {'date': e.key, 'notifications': e.value})
        .toList();
  }
}

class _NotificationCard extends StatelessWidget {
  final AlertNotification notification;
  final NotificationRepository repository;

  const _NotificationCard({
    required this.notification,
    required this.repository,
  });

  Color get _statusColor {
    switch (notification.status) {
      case 'CRITICO':
        return AppPalette.sensorCritical;
      case 'ALERTA':
        return AppPalette.sensorAlert;
      default:
        return AppPalette.sensorOk;
    }
  }

  IconData get _statusIcon {
    switch (notification.status) {
      case 'CRITICO':
        return Icons.dangerous;
      case 'ALERTA':
        return Icons.warning;
      default:
        return Icons.check_circle;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppConstants.paddingSmall),
      elevation: notification.lida ? 1 : AppConstants.elevationMedium,
      color: notification.lida ? AppPalette.gray_100 : AppPalette.white,
      child: InkWell(
        onTap: () => _showDetails(context),
        borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.paddingNormal),
          child: Row(
            children: [
              // Ícone de status
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(
                    AppConstants.borderRadiusSmall,
                  ),
                ),
                child: Icon(_statusIcon, color: _statusColor, size: 28),
              ),
              const SizedBox(width: AppConstants.paddingNormal),

              // Informações
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.sensorLabel,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(
                                  fontWeight: notification.lida
                                      ? FontWeight.normal
                                      : FontWeight.bold,
                                ),
                          ),
                        ),
                        if (!notification.lida)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppPalette.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${notification.valor}${notification.unidade} - ${notification.status}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: _statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.formattedTime,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),

              // Seta
              Icon(Icons.chevron_right, color: AppPalette.gray),
            ],
          ),
        ),
      ),
    );
  }

  void _showDetails(BuildContext context) async {
    // Marcar como lida
    if (!notification.lida) {
      await repository.markAsRead(notification.id);
    }

    if (context.mounted) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppConstants.borderRadiusNormal),
          ),
        ),
        builder: (context) => DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              child: Padding(
                padding: const EdgeInsets.all(AppConstants.paddingLarge),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppPalette.gray_300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppConstants.paddingLarge),

                    // Ícone e título
                    Row(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: _statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(
                              AppConstants.borderRadiusMedium,
                            ),
                          ),
                          child: Icon(
                            _statusIcon,
                            color: _statusColor,
                            size: 36,
                          ),
                        ),
                        const SizedBox(width: AppConstants.paddingNormal),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Alerta ${notification.status}',
                                style: Theme.of(context).textTheme.headlineSmall
                                    ?.copyWith(color: _statusColor),
                              ),
                              Text(
                                notification.sensorLabel,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: AppConstants.paddingLarge),
                    const Divider(),
                    const SizedBox(height: AppConstants.paddingNormal),

                    // Detalhes
                    _DetailRow(
                      icon: Icons.thermostat,
                      label: 'Valor Registrado',
                      value: '${notification.valor}${notification.unidade}',
                      valueColor: _statusColor,
                    ),
                    _DetailRow(
                      icon: Icons.access_time,
                      label: 'Data e Hora',
                      value: notification.fullFormattedTime,
                    ),
                    _DetailRow(
                      icon: Icons.sensors,
                      label: 'Sensor',
                      value: notification.sensorLabel,
                    ),
                    _DetailRow(
                      icon: Icons.warning,
                      label: 'Status',
                      value: notification.status,
                      valueColor: _statusColor,
                    ),

                    const SizedBox(height: AppConstants.paddingLarge),

                    // Botão fechar
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Fechar'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppConstants.paddingSmall),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppPalette.gray),
          const SizedBox(width: AppConstants.paddingSmall),
          Text(
            '$label: ',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: AppPalette.gray_600),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: valueColor,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
