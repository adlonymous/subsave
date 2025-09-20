/**
 * Grid SDK Client
 * Based on the Squads-Grid neobank-example-app architecture
 * https://github.com/Squads-Grid/neobank-example-app
 */

import { GridClient, GridEnvironment } from '@sqds/grid';
import { getGridConfig } from '../lib/env';

class SDKGridClient {
  private static instance: SDKGridClient;
  private gridClient: GridClient | null = null;
  private sessionSecrets: any = null;

  private constructor() {}

  public static getInstance(): SDKGridClient {
    if (!SDKGridClient.instance) {
      SDKGridClient.instance = new SDKGridClient();
    }
    return SDKGridClient.instance;
  }

  /**
   * Initialize the Grid SDK client
   */
  public async initialize(): Promise<void> {
    try {
      const config = getGridConfig();
      
      this.gridClient = new GridClient({
        apiKey: config.apiKey,
        environment: config.environment as GridEnvironment,
        baseUrl: process.env.EXPO_PUBLIC_GRID_ENDPOINT, // Optional custom endpoint
      });

      // Generate session secrets for secure operations
      this.sessionSecrets = await this.gridClient.generateSessionSecrets();
      
      console.log('Grid SDK client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Grid SDK client:', error);
      throw error;
    }
  }

  /**
   * Get the Grid client instance
   */
  public getClient(): GridClient {
    if (!this.gridClient) {
      throw new Error('Grid SDK client not initialized. Call initialize() first.');
    }
    return this.gridClient;
  }

  /**
   * Get session secrets for secure operations
   */
  public getSessionSecrets(): any {
    if (!this.sessionSecrets) {
      throw new Error('Session secrets not available. Call initialize() first.');
    }
    return this.sessionSecrets;
  }

  /**
   * Check if client is initialized
   */
  public isInitialized(): boolean {
    return this.gridClient !== null;
  }

  /**
   * Reset the client (useful for testing)
   */
  public reset(): void {
    this.gridClient = null;
    this.sessionSecrets = null;
  }
}

// Export singleton instance
export const sdkGridClient = SDKGridClient.getInstance();
export default sdkGridClient;
