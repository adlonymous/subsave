/**
 * EAS Client for Grid SDK Integration
 * Direct Grid SDK integration for Expo apps
 * Based on the Squads-Grid neobank-example-app architecture
 * https://github.com/Squads-Grid/neobank-example-app
 */

import { sdkGridClient } from '../grid/sdkClient';

class EASClient {
  constructor() {
    // Don't initialize immediately - wait until first use
  }

  /**
   * Initialize Grid SDK client
   */
  private async initializeGridClient() {
    try {
      if (!sdkGridClient.isInitialized()) {
        await sdkGridClient.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize Grid SDK client:', error);
      throw error; // Re-throw to handle in calling methods
    }
  }

  /**
   * Create Grid account
   */
  async createAccount(data: { email: string; memo?: string }) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.createAccount({
        type: 'email',
        email: data.email,
        memo: data.memo || `SubSave account for ${data.email}`,
      });
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(data: { email: string; otp: string }) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.verifyOtp({
        email: data.email,
        otp: data.otp,
      });
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw error;
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(accountId: string) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.getAccountDetails(accountId);
    } catch (error) {
      console.error('Failed to get account details:', error);
      throw error;
    }
  }

  /**
   * Get account balances
   */
  async getBalances(accountId: string) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.getBalances(accountId);
    } catch (error) {
      console.error('Failed to get balances:', error);
      throw error;
    }
  }

  /**
   * Create spending limit
   */
  async createSpendingLimit(data: {
    accountId: string;
    limit: number;
    currency: string;
    period: string;
    description?: string;
  }) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.createSpendingLimit({
        accountId: data.accountId,
        limit: data.limit,
        currency: data.currency,
        period: data.period,
        description: data.description,
      });
    } catch (error) {
      console.error('Failed to create spending limit:', error);
      throw error;
    }
  }

  /**
   * Get spending limits
   */
  async getSpendingLimits(accountId: string) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.getSpendingLimits(accountId);
    } catch (error) {
      console.error('Failed to get spending limits:', error);
      throw error;
    }
  }

  /**
   * Delete spending limit
   */
  async deleteSpendingLimit(limitId: string) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.deleteSpendingLimit(limitId);
    } catch (error) {
      console.error('Failed to delete spending limit:', error);
      throw error;
    }
  }

  /**
   * Create transaction
   */
  async createTransaction(data: {
    accountId: string;
    amount: number;
    currency: string;
    description?: string;
    recipientAccountId?: string;
  }) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.createTransaction({
        accountId: data.accountId,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        recipientAccountId: data.recipientAccountId,
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  /**
   * Get transactions
   */
  async getTransactions(accountId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    try {
      await this.initializeGridClient();
      const gridClient = sdkGridClient.getClient();
      
      return await gridClient.getTransactions({
        accountId,
        limit: params?.limit,
        offset: params?.offset,
        status: params?.status,
      });
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const isInitialized = sdkGridClient.isInitialized();
      return {
        status: isInitialized ? 'healthy' : 'unhealthy',
        grid: {
          initialized: isInitialized,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        error: 'Grid SDK not available',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const easClient = new EASClient();
export default easClient;
