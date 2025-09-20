/**
 * Expo App Configuration
 * Handles environment variables and app configuration
 */

import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

/**
 * Get environment variables with fallbacks
 */
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || fallback || '';
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  // Environment configuration
  const nodeEnv = getEnvVar('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';

  // Grid SDK configuration
  const gridApiKey = getEnvVar('GRID_API_KEY', '');
  const gridEnv = getEnvVar('EXPO_PUBLIC_GRID_ENV', 'sandbox');
  const gridEndpoint = getEnvVar('EXPO_PUBLIC_GRID_ENDPOINT', '');

  // Auth0 configuration
  const auth0ClientSecret = getEnvVar('AUTH0_CLIENT_SECRET', '');

  // App configuration
  const appName = getEnvVar('APP_NAME', 'SubSave');
  const appSlug = getEnvVar('APP_SLUG', 'subsave');
  const appVersion = getEnvVar('APP_VERSION', '1.0.0');

  // Build configuration
  const bundleIdentifier = getEnvVar('BUNDLE_IDENTIFIER', 'com.aadilahmed.subsave');
  const packageName = getEnvVar('PACKAGE_NAME', 'com.aadilahmed.subsave');

  return {
    ...config,
    name: appName,
    slug: appSlug,
    version: appVersion,
    orientation: 'portrait',
    icon: './assets/adaptive-icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier,
      buildNumber: getEnvVar('IOS_BUILD_NUMBER', '1'),
      ...(isDevelopment && {
        // Development-specific iOS config
        developmentClient: {
          silentLaunch: true,
        },
      }),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: packageName,
      versionCode: getNumberEnvVar('ANDROID_VERSION_CODE', 1),
      ...(isDevelopment && {
        // Development-specific Android config
        developmentClient: {
          silentLaunch: true,
        },
      }),
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    scheme: 'subsave',
    plugins: [
      'expo-router',
      // Add environment-specific plugins
      ...(isDevelopment ? [
        // Development plugins
      ] : [
        // Production plugins
      ]),
    ],
    extra: {
      // Expose environment variables to the app
      env: {
        NODE_ENV: nodeEnv,
        GRID_API_KEY: gridApiKey,
        EXPO_PUBLIC_GRID_ENV: gridEnv,
        EXPO_PUBLIC_GRID_ENDPOINT: gridEndpoint,
        AUTH0_CLIENT_SECRET: auth0ClientSecret,
        IS_PRODUCTION: isProduction,
        IS_DEVELOPMENT: isDevelopment,
      },
      // Auth0 configuration
      auth0: {
        clientSecret: auth0ClientSecret,
      },
    },
    // Development-specific configuration
    ...(isDevelopment && {
      developmentClient: {
        silentLaunch: true,
      },
    }),
  };
};
