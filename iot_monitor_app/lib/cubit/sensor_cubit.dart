import 'package:flutter_bloc/flutter_bloc.dart';
import 'sensor_state.dart';
import '../data/firebase_service.dart';

class SensorCubit extends Cubit<SensorState> {
  final FirebaseService service;
  SensorCubit(this.service) : super(SensorState()) {
    _start();
  }

  void _start() {
    emit(state.copyWith(loading: true));
    service.listenToSensors((payload) {
      emit(state.copyWith(data: payload, loading: false));
    });
  }

  Future<void> forcarEstado(String estado) async {
    await service.sendCommand(estado);
  }
}
