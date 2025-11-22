import 'package:equatable/equatable.dart';
import '../models/sensor_model.dart';

class SensorState extends Equatable {
  final SensoresPayload? data;
  final bool loading;
  final String? error;

  SensorState({this.data, this.loading = false, this.error});

  SensorState copyWith({SensoresPayload? data, bool? loading, String? error}) =>
    SensorState(data: data ?? this.data, loading: loading ?? this.loading, error: error ?? this.error);

  @override
  List<Object?> get props => [data, loading, error];
}
