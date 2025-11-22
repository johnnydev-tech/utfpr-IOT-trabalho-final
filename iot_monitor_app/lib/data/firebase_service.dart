import 'dart:async';
import 'package:dartz/dartz.dart';
import 'package:firebase_database/firebase_database.dart';
import '../models/sensor_model.dart';
import '../core/error/failures.dart';
import '../core/utils/logger.dart';

class FirebaseService {
  final db = FirebaseDatabase.instance.ref('/agro/algodao');
  static const _timeout = Duration(seconds: 10);

  /// Listen to sensor data with error handling
  Stream<Either<Failure, SensoresPayload>> listenToSensors() {
    AppLogger.info('🔄 Iniciando listener de sensores');

    return db
        .child('sensores')
        .onValue
        .map<Either<Failure, SensoresPayload>>((event) {
          try {
            final v = event.snapshot.value as Map?;

            if (v == null) {
              AppLogger.warning('⚠️ Dados nulos recebidos do Firebase');
              return Left(
                const DataParsingFailure(
                  message: 'Nenhum dado disponível no servidor',
                ),
              );
            }

            final payload = SensoresPayload.fromMap(
              Map<String, dynamic>.from(v),
            );

            AppLogger.debug(
              '✅ Dados recebidos: Temp=${payload.temperatura.valor}°C, '
              'Luz=${payload.luminosidade.valor}lux, Painel=${payload.painel}',
            );

            return Right(payload);
          } catch (e, stackTrace) {
            AppLogger.error(
              '❌ Erro ao processar dados do Firebase',
              e,
              stackTrace,
            );

            return Left(
              DataParsingFailure(
                message: 'Erro ao processar dados: ${e.toString()}',
                stackTrace: stackTrace,
              ),
            );
          }
        })
        .handleError((error, stackTrace) {
          AppLogger.error('❌ Erro na conexão com Firebase', error, stackTrace);

          return Left(
            FirebaseConnectionFailure(
              message: 'Erro de conexão: ${error.toString()}',
              stackTrace: stackTrace,
            ),
          );
        });
  }

  /// Send command to Firebase with error handling
  Future<Either<Failure, void>> sendCommand(String estado) async {
    try {
      AppLogger.info('📤 Enviando comando: $estado');

      await db
          .child('comandos')
          .set({'forcar_estado': estado})
          .timeout(_timeout);

      AppLogger.info('✅ Comando enviado com sucesso: $estado');
      return const Right(null);
    } on TimeoutException catch (e, stackTrace) {
      AppLogger.error('⏱️ Timeout ao enviar comando', e, stackTrace);

      return Left(
        TimeoutFailure(
          message: 'Tempo limite excedido ao enviar comando',
          stackTrace: stackTrace,
        ),
      );
    } catch (e, stackTrace) {
      AppLogger.error('❌ Erro ao enviar comando', e, stackTrace);

      return Left(
        CommandFailure(
          message: 'Erro ao enviar comando: ${e.toString()}',
          stackTrace: stackTrace,
        ),
      );
    }
  }
}
