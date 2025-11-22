import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/sensor_cubit.dart';
import '../cubit/sensor_state.dart'; // Import the sensor_state.dart

class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Monitor Algodão')),
      body: BlocBuilder<SensorCubit, SensorState>(builder: (context, state) {
        if (state.loading) return Center(child: CircularProgressIndicator());
        if (state.data == null) return Center(child: Text('Aguardando dados...'));

        final d = state.data!;
        Color panelColor = Colors.green;
        if (d.painel == 'AMARELO') panelColor = Colors.amber;
        if (d.painel == 'VERMELHO') panelColor = Colors.red;

        return Column(
          children: [
            SizedBox(height: 20),
            CircleAvatar(radius: 48, backgroundColor: panelColor),
            SizedBox(height: 12),
            Text('Painel: ${d.painel}'),
            SizedBox(height: 20),
            ListTile(title: Text('Temperatura'), subtitle: Text('${d.temperatura.valor} °C — ${d.temperatura.status}')),
            ListTile(title: Text('Luminosidade'), subtitle: Text('${d.luminosidade.valor} — ${d.luminosidade.status}')),
            Spacer(),
            Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
              ElevatedButton(onPressed: () => context.read<SensorCubit>().forcarEstado('VERDE'), child: Text('Forçar VERDE')),
              ElevatedButton(onPressed: () => context.read<SensorCubit>().forcarEstado('AMARELO'), child: Text('Forçar AMARELO')),
              ElevatedButton(onPressed: () => context.read<SensorCubit>().forcarEstado('VERMELHO'), child: Text('Forçar VERMELHO')),
              ElevatedButton(onPressed: () => context.read<SensorCubit>().forcarEstado('AUTO'), child: Text('AUTO')),
            ])
          ],
        );
      }),
    );
  }
}
