import 'package:equatable/equatable.dart';

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

class FirebaseConnectionFailure extends Failure {
  const FirebaseConnectionFailure({
    super.message = 'Erro de conexão com Firebase',
    super.code,
    super.stackTrace,
  });
}

class DataParsingFailure extends Failure {
  const DataParsingFailure({
    super.message = 'Erro ao processar dados do servidor',
    super.code,
    super.stackTrace,
  });
}

class TimeoutFailure extends Failure {
  const TimeoutFailure({
    super.message = 'Tempo limite de conexão excedido',
    super.code,
    super.stackTrace,
  });
}

class UnknownFailure extends Failure {
  const UnknownFailure({
    super.message = 'Erro desconhecido',
    super.code,
    super.stackTrace,
  });
}

class CommandFailure extends Failure {
  const CommandFailure({
    super.message = 'Erro ao enviar comando',
    super.code,
    super.stackTrace,
  });
}
