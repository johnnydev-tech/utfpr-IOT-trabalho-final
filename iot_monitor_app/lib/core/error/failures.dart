import 'package:equatable/equatable.dart';

/// Classe base para falhas
abstract class Failure extends Equatable {
  final String message;
  final String? code;
  final StackTrace? stackTrace;

  const Failure({required this.message, this.code, this.stackTrace});

  @override
  List<Object?> get props => [message, code];

  @override
  String toString() => 'Failure(message: $message, code: $code)';
}

/// Falha de conexão com Firebase
class FirebaseConnectionFailure extends Failure {
  const FirebaseConnectionFailure({
    String message = 'Erro de conexão com Firebase',
    String? code,
    StackTrace? stackTrace,
  }) : super(message: message, code: code, stackTrace: stackTrace);
}

/// Falha ao parsear dados
class DataParsingFailure extends Failure {
  const DataParsingFailure({
    String message = 'Erro ao processar dados do servidor',
    String? code,
    StackTrace? stackTrace,
  }) : super(message: message, code: code, stackTrace: stackTrace);
}

/// Falha de timeout
class TimeoutFailure extends Failure {
  const TimeoutFailure({
    String message = 'Tempo limite de conexão excedido',
    String? code,
    StackTrace? stackTrace,
  }) : super(message: message, code: code, stackTrace: stackTrace);
}

/// Falha desconhecida
class UnknownFailure extends Failure {
  const UnknownFailure({
    String message = 'Erro desconhecido',
    String? code,
    StackTrace? stackTrace,
  }) : super(message: message, code: code, stackTrace: stackTrace);
}

/// Falha ao enviar comando
class CommandFailure extends Failure {
  const CommandFailure({
    String message = 'Erro ao enviar comando',
    String? code,
    StackTrace? stackTrace,
  }) : super(message: message, code: code, stackTrace: stackTrace);
}
