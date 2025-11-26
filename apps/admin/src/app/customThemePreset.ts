import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

const themeColorName = 'zinc';

/* Works because highlight tokens are defined under colorScheme */
export const CustomThemePreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: `{${themeColorName}.50}`,
      100: `{${themeColorName}.100}`,
      200: `{${themeColorName}.200}`,
      300: `{${themeColorName}.300}`,
      400: `{${themeColorName}.400}`,
      500: `{${themeColorName}.500}`,
      600: `{${themeColorName}.600}`,
      700: `{${themeColorName}.700}`,
      800: `{${themeColorName}.800}`,
      900: `{${themeColorName}.900}`,
      950: `{${themeColorName}.950}`,
    },
    colorScheme: {
      light: {
        primary: {
          color: `{${themeColorName}.950}`,
          inverseColor: `{${themeColorName}.950}`,
          hoverColor: `{${themeColorName}.800}`,
          activeColor: `{${themeColorName}.800}`,
        },
        highlight: {
          background: `{${themeColorName}.950}`,
          focusBackground: `{${themeColorName}.700}`,
          color: `{${themeColorName}.50}`,
          focusColor: `{${themeColorName}.50}`,
        },
      },
      dark: {
        primary: {
          color: `{${themeColorName}.400}`,
          inverseColor: `{${themeColorName}.950}`,
          hoverColor: `{${themeColorName}.100}`,
          activeColor: `{${themeColorName}.200}`,
        },
        highlight: {
          background: `{${themeColorName}.200}`,
          focusBackground: `{${themeColorName}.100}`,
          color: `{${themeColorName}.950}`,
          focusColor: `{${themeColorName}.950}`,
        },
      },
    },
  },
});
