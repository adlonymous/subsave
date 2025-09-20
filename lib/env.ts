/**
 * Environment configuration helper
 * Centralizes environment variable access with proper validation
 */

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  GRID_API_KEY: string;
  GRID_ENVIRONMENT: 'sandbox';
  EXPO_PUBLIC_GRID_ENV: 'sandbox';
  EXPO_PUBLIC_GRID_ENDPOINT?: string;
  EXPO_PUBLIC_GEMINI_API_KEY: string;
}

/**
 * Validates and returns environment configuration
 * Throws error if required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
  const gridApiKey = process.env.EXPO_PUBLIC_GRID_API_KEY || process.env.GRID_API_KEY;
  const gridEnvironment = (process.env.EXPO_PUBLIC_GRID_ENV || 'sandbox') as 'sandbox';
  const gridEndpoint = process.env.EXPO_PUBLIC_GRID_ENDPOINT;
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // Validate required environment variables
  if (!gridApiKey) {
    throw new Error(
      'GRID_API_KEY is required. Please set it in your .env file or environment variables.'
    );
  }

  if (!geminiApiKey) {
    throw new Error(
      'EXPO_PUBLIC_GEMINI_API_KEY is required. Please set it in your .env file or environment variables.'
    );
  }

  return {
    NODE_ENV: nodeEnv,
    GRID_API_KEY: gridApiKey,
    GRID_ENVIRONMENT: gridEnvironment,
    EXPO_PUBLIC_GRID_ENV: gridEnvironment,
    EXPO_PUBLIC_GRID_ENDPOINT: gridEndpoint,
    EXPO_PUBLIC_GEMINI_API_KEY: geminiApiKey,
  };
}

/**
 * Get Grid client configuration
 * Returns configuration object for GridClient initialization
 */
export function getGridConfig() {
  const config = getEnvConfig();
  
  return {
    environment: config.GRID_ENVIRONMENT,
    apiKey: config.GRID_API_KEY,
    baseUrl: config.EXPO_PUBLIC_GRID_ENDPOINT,
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvConfig().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvConfig().NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnvConfig().NODE_ENV === 'test';
}
