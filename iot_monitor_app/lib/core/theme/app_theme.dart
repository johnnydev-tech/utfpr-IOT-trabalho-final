import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_palette.dart';
import 'app_constants.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: false,
      brightness: Brightness.light,

      // Cores principais
      primaryColor: AppPalette.primary,
      scaffoldBackgroundColor: AppPalette.background,
      canvasColor: AppPalette.cardBackground,

      colorScheme: const ColorScheme.light(
        primary: AppPalette.primary,
        secondary: AppPalette.secondary,
        surface: AppPalette.cardBackground,
        background: AppPalette.background,
        error: AppPalette.error,
        onPrimary: AppPalette.white,
        onSecondary: AppPalette.white,
        onSurface: AppPalette.dark,
        onBackground: AppPalette.dark,
        onError: AppPalette.white,
      ),

      // Tipografia usando Google Fonts (Roboto + Oswald)
      textTheme: TextTheme(
        displayLarge: GoogleFonts.oswald(
          fontSize: AppConstants.fontSizeTitle,
          fontWeight: FontWeight.bold,
          color: AppPalette.dark,
        ),
        displayMedium: GoogleFonts.oswald(
          fontSize: AppConstants.fontSizeSubtitle,
          fontWeight: FontWeight.w600,
          color: AppPalette.dark,
        ),
        headlineMedium: GoogleFonts.oswald(
          fontSize: AppConstants.fontSizeLarger,
          fontWeight: FontWeight.w600,
          color: AppPalette.dark,
        ),
        titleLarge: GoogleFonts.roboto(
          fontSize: AppConstants.fontSizeLarge,
          fontWeight: FontWeight.w600,
          color: AppPalette.dark,
        ),
        titleMedium: GoogleFonts.roboto(
          fontSize: AppConstants.fontSizeNormal,
          fontWeight: FontWeight.w500,
          color: AppPalette.dark,
        ),
        bodyLarge: GoogleFonts.roboto(
          fontSize: AppConstants.fontSizeNormal,
          fontWeight: FontWeight.normal,
          color: AppPalette.dark,
        ),
        bodyMedium: GoogleFonts.roboto(
          fontSize: AppConstants.fontSizeSmall,
          fontWeight: FontWeight.normal,
          color: AppPalette.dark,
        ),
        bodySmall: GoogleFonts.roboto(
          fontSize: AppConstants.fontSizeSmaller,
          fontWeight: FontWeight.normal,
          color: AppPalette.gray,
        ),
      ),

      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: AppPalette.primary,
        foregroundColor: AppPalette.white,
        elevation: AppConstants.elevationSmall,
        centerTitle: true,
        titleTextStyle: GoogleFonts.oswald(
          fontSize: AppConstants.fontSizeLarge,
          fontWeight: FontWeight.w600,
          color: AppPalette.white,
        ),
      ),

      // Cards
      cardTheme: CardThemeData(
        color: AppPalette.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusMedium),
        ),
        margin: const EdgeInsets.all(AppConstants.paddingSmall),
      ),

      // Botões Elevados
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppPalette.primary,
          foregroundColor: AppPalette.white,
          elevation: AppConstants.elevationMedium,
          padding: const EdgeInsets.symmetric(
            horizontal: AppConstants.paddingLarge,
            vertical: AppConstants.paddingSmallTwo,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          ),
          textStyle: GoogleFonts.roboto(
            fontSize: AppConstants.fontSizeNormal,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Botões Outlined
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppPalette.primary,
          side: const BorderSide(color: AppPalette.primary, width: 2),
          padding: const EdgeInsets.symmetric(
            horizontal: AppConstants.paddingLarge,
            vertical: AppConstants.paddingSmallTwo,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          ),
          textStyle: GoogleFonts.roboto(
            fontSize: AppConstants.fontSizeNormal,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppPalette.gray_100,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppConstants.paddingNormal,
          vertical: AppConstants.paddingSmallTwo,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          borderSide: const BorderSide(color: AppPalette.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
          borderSide: const BorderSide(color: AppPalette.error, width: 2),
        ),
        labelStyle: GoogleFonts.roboto(color: AppPalette.gray),
        hintStyle: GoogleFonts.roboto(color: AppPalette.gray_400),
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppPalette.dark,
        contentTextStyle: GoogleFonts.roboto(color: AppPalette.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadiusSmall),
        ),
        behavior: SnackBarBehavior.floating,
      ),

      // FloatingActionButton
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppPalette.primary,
        foregroundColor: AppPalette.white,
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppPalette.grayLight,
        thickness: 1,
        space: AppConstants.spacerNormal,
      ),

      // IconTheme
      iconTheme: const IconThemeData(
        color: AppPalette.dark,
        size: AppConstants.iconSizeNormal,
      ),

      primaryIconTheme: const IconThemeData(
        color: AppPalette.primary,
        size: AppConstants.iconSizeNormal,
      ),
    );
  }
}
