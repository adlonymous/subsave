import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: '100' as const,
    },
  },
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10B981', // Muted green primary
    primaryContainer: '#1F2937', // Dark grey container
    secondary: '#8B5CF6', // Muted purple secondary
    secondaryContainer: '#1F2937', // Dark grey container
    tertiary: '#FF6B6B', // Coral accent
    tertiaryContainer: '#FFE8E8', // Light coral container
    surface: '#FFFFFF', // Pure white surface
    surfaceVariant: '#F5F5F5', // Light gray surface
    background: '#FAFAFA', // Off-white background
    error: '#FF5252',
    errorContainer: '#FFE8E8',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#2D1B3D',
    onSecondary: '#000000',
    onSecondaryContainer: '#0D3D2A',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#4D1A1A',
    onSurface: '#000000',
    onSurfaceVariant: '#333333',
    onBackground: '#000000',
    onError: '#FFFFFF',
    onErrorContainer: '#4D1A1A',
    outline: '#CCCCCC',
    outlineVariant: '#E0E0E0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#000000',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#9945FF',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8F8F8',
      level3: '#F0F0F0',
      level4: '#E8E8E8',
      level5: '#E0E0E0',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#10B981', // Muted green primary
    primaryContainer: '#1F2937', // Dark grey container
    secondary: '#8B5CF6', // Muted purple secondary
    secondaryContainer: '#1F2937', // Dark grey container
    tertiary: '#FF6B6B', // Coral accent
    tertiaryContainer: '#4D1A1A', // Dark coral container
    surface: '#111827', // Dark grey surface
    surfaceVariant: '#1F2937', // Slightly lighter grey surface
    background: '#0F172A', // Very dark blue-grey background
    error: '#FF5252',
    errorContainer: '#4D1A1A',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#E8D5FF',
    onSecondary: '#000000',
    onSecondaryContainer: '#A8F5C8',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#FFD5D5',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    onBackground: '#FFFFFF',
    onError: '#FFFFFF',
    onErrorContainer: '#FFD5D5',
    outline: '#666666',
    outlineVariant: '#333333',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#000000',
    inversePrimary: '#9945FF',
    elevation: {
      level0: 'transparent',
      level1: '#111111',
      level2: '#1A1A1A',
      level3: '#222222',
      level4: '#2A2A2A',
      level5: '#333333',
    },
  },
};
