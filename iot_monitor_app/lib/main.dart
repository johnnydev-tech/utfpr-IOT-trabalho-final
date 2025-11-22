import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'firebase_options.dart';
import 'data/firebase_service.dart';
import 'cubit/sensor_cubit.dart';
import 'pages/dashboard_page.dart';
import 'core/utils/logger.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  AppLogger.info('🚀 Iniciando aplicação');

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    AppLogger.info('✅ Firebase inicializado com sucesso');
  } catch (e, stackTrace) {
    AppLogger.fatal('❌ Erro ao inicializar Firebase', e, stackTrace);
    rethrow;
  }

  final service = FirebaseService();
  runApp(MyApp(service));
}

class MyApp extends StatelessWidget {
  final FirebaseService service;
  const MyApp(this.service, {super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agro Monitor',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.light,
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      home: BlocProvider(
        create: (_) => SensorCubit(service),
        child: const DashboardPage(),
      ),
    );
  }
}
