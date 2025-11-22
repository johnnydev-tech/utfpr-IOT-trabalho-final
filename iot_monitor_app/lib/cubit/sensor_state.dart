import 'package:equatable/equatable.dart';
import '../models/sensor_model.dart';
import '../core/error/failures.dart';

/// Base abstract class for all sensor states
abstract class SensorState extends Equatable {
  const SensorState();

  @override
  List<Object?> get props => [];
}

/// Initial state - app just started
class SensorInitial extends SensorState {
  const SensorInitial();
}

/// Loading state - waiting for data
class SensorLoading extends SensorState {
  const SensorLoading();
}

/// Success state - data loaded successfully
class SensorLoaded extends SensorState {
  final SensoresPayload data;

  const SensorLoaded(this.data);

  @override
  List<Object?> get props => [data];
}

/// Error state - something went wrong
class SensorError extends SensorState {
  final Failure failure;

  const SensorError(this.failure);

  @override
  List<Object?> get props => [failure];
}

/// Command sending state
class SensorSendingCommand extends SensorState {
  final SensoresPayload currentData;

  const SensorSendingCommand(this.currentData);

  @override
  List<Object?> get props => [currentData];
}

/// Command sent successfully
class SensorCommandSent extends SensorState {
  final SensoresPayload data;
  final String message;

  const SensorCommandSent(this.data, this.message);

  @override
  List<Object?> get props => [data, message];
}

/// Command failed
class SensorCommandFailed extends SensorState {
  final SensoresPayload currentData;
  final Failure failure;

  const SensorCommandFailed(this.currentData, this.failure);

  @override
  List<Object?> get props => [currentData, failure];
}
