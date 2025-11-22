import 'package:flutter/material.dart';

class AppPalette {
  // Cores primárias do Cotton
  static const primary = Color(0xff749E78); // Verde algodão
  static const primaryLight = Color(0xFF83A17D);
  static const primaryAccent = Color(0xFFE2EDDF);

  // Cores secundárias
  static const secondary = Color(0xFFCB9E79); // Marrom/terra

  // Cores base
  static const white = Color(0xffFFFFFF);
  static const light = Color.fromARGB(255, 236, 236, 236);
  static const dark = Color.fromARGB(255, 49, 49, 49);
  static const darkAccent = Color.fromARGB(255, 63, 63, 63);

  // Cores de status/alerta (IOT)
  static const success = Color(0xff749E78); // Verde - OK
  static const warning = Color(0xFFCB9E79); // Amarelo/Laranja - ALERTA
  static const error = Color(0xffF36A6A); // Vermelho - CRITICO
  static const info = Color(0xff637CFF); // Azul - Info

  // Escalas de cinza
  static const fillTextField = Color(0xff9F9F9F);
  static const gray = Color(0xff9F9F9F);
  static const grayLight = Color(0xffE0E0E0);
  static const grayDark = Color(0xff424242);
  static const grayDarker = Color(0xff212121);

  static const gray_100 = Color(0xffF5F5F5);
  static const gray_200 = Color(0xffEEEEEE);
  static const gray_300 = Color(0xffE0E0E0);
  static const gray_400 = Color(0xffBDBDBD);
  static const gray_500 = Color(0xff9E9E9E);
  static const gray_600 = Color(0xff757575);
  static const gray_700 = Color(0xff616161);
  static const gray_800 = Color(0xff424242);
  static const gray_900 = Color(0xff212121);

  // Cores específicas do contexto IOT
  static const sensorOk = success;
  static const sensorAlert = warning;
  static const sensorCritical = error;
  static const background = light;
  static const cardBackground = white;
}
