import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'sensor_state.dart';
import '../data/firebase_service.dart';
import '../models/sensor_model.dart';
import '../core/utils/logger.dart';

class SensorCubit extends Cubit<SensorState> {
  final FirebaseService service;
  StreamSubscription? _subscription;

  SensorCubit(this.service) : super(const SensorInitial()) {
    _start();
  }

  void _start() {
    AppLogger.info('🚀 Iniciando SensorCubit');
    emit(const SensorLoading());

    _subscription = service.listenToSensors().listen(
      (either) {
        either.fold(
          (failure) {
            AppLogger.error('❌ Erro recebido no Cubit: ${failure.message}');
            emit(SensorError(failure));
          },
          (data) {
            AppLogger.debug('✅ Dados carregados no Cubit');
            emit(SensorLoaded(data));
          },
        );
      },
      onError: (error, stackTrace) {
        AppLogger.error('❌ Erro no stream', error, stackTrace);
      },
    );
  }

  Future<void> forcarEstado(String estado) async {
    final currentState = state;

    SensoresPayload? currentData;
    if (currentState is SensorLoaded) {
      currentData = currentState.data;
    } else if (currentState is SensorCommandSent) {
      currentData = currentState.data;
    } else if (currentState is SensorCommandFailed) {
      currentData = currentState.currentData;
    }

    if (currentData != null) {
      emit(SensorSendingCommand(currentData));
    }

    AppLogger.info('📤 Forçando estado: $estado');

    final result = await service.sendCommand(estado);

    result.fold(
      (failure) {
        AppLogger.error('❌ Falha ao enviar comando: ${failure.message}');
        if (currentData != null) {
          emit(SensorCommandFailed(currentData, failure));
          final data = currentData;
          Future.delayed(const Duration(seconds: 3), () {
            if (state is SensorCommandFailed) {
              emit(SensorLoaded(data));
            }
          });
        } else {
          emit(SensorError(failure));
        }
      },
      (_) {
        AppLogger.info('✅ Comando enviado com sucesso');
        if (currentData != null) {
          emit(
            SensorCommandSent(
              currentData,
              'Comando "$estado" enviado com sucesso',
            ),
          );
          final data = currentData;
          Future.delayed(const Duration(seconds: 2), () {
            if (state is SensorCommandSent) {
              emit(SensorLoaded(data));
            }
          });
        }
      },
    );
  }

  @override
  Future<void> close() {
    AppLogger.info('🔒 Fechando SensorCubit');
    _subscription?.cancel();
    return super.close();
  }
}
