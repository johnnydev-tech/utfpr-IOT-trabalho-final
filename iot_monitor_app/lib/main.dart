import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'firebase_options.dart';
import 'data/firebase_service.dart';
import 'cubit/sensor_cubit.dart';
import 'pages/dashboard_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  final service = FirebaseService();
  runApp(MyApp(service));
}

class MyApp extends StatelessWidget {
  final FirebaseService service;
  MyApp(this.service);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agro Monitor',
      home: BlocProvider(
        create: (_) => SensorCubit(service),
        child: DashboardPage(),
      ),
    );
  }
}
