/**
 * Grid SDK Client Service
 * Singleton service for Grid API operations with robust error handling
 */

import { GridClient, GridEnvironment } from '@sqds/grid';
import { getGridConfig } from '../lib/env';
import {
  GridError,
  GridNetworkError,
  GridAuthError,
  GridValidationError,
  GridConfigError,
  GridRateLimitError,
  GridInsufficientFundsError,
  GridAccountNotFoundError,
  GridInvalidOtpError,
  GridSpendingLimitExceededError,
  GridServiceUnavailableError,
  GridTimeoutError,
  GridUnknownError,
  createGridError,
  wrapError,
} from '../lib/errors';
import {
  IGridService,
  GridServiceConfig,
  CreateAccountRequest,
  CreateAccountResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  GetBalancesRequest,
  GetBalancesResponse,
  CreateSpendingLimitRequest,
  CreateSpendingLimitResponse,
  DeleteSpendingLimitRequest,
  DeleteSpendingLimitResponse,
  GetSpendingLimitsRequest,
  GetSpendingLimitsResponse,
  TransactionRequest,
  TransactionResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  GetAccountInfoRequest,
  AccountInfo,
  UpdateAccountRequest,
  UpdateAccountResponse,
  GridEnvironment,
} from '../lib/grid-types';

/**
 * Grid Service Implementation
 * Provides a clean, typed interface for Grid SDK operations
 */
class GridService implements IGridService {
  private client: GridClient;
  private config: GridServiceConfig;
  private isInitialized: boolean = false;

  constructor(config: GridServiceConfig = {}) {
    this.config = {
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };
    this.initializeClient();
  }

  /**
   * Initialize Grid client with configuration
   */
  private initializeClient(): void {
    try {
      const gridConfig = getGridConfig();
      this.client = new GridClient(gridConfig);
      this.isInitialized = true;
    } catch (error) {
      throw new GridConfigError(
        'Failed to initialize Grid client',
        { originalError: error }
      );
    }
  }

  /**
   * Make HTTP request to Grid API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const gridConfig = getGridConfig();
    const baseUrl = 'https://grid.squads.xyz/api/grid/v1';
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${gridConfig.apiKey}`,
      'Content-Type': 'application/json',
      'x-grid-environment': gridConfig.environment,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createGridError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  /**
   * Execute operation with error handling and retries
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (!this.isInitialized) {
      throw new GridConfigError('Grid client not initialized');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= (this.config.retries || 1); attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new GridTimeoutError(`${operationName} timed out after ${this.config.timeout}ms`));
            }, this.config.timeout);
          }),
        ]);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain error types
        if (error instanceof GridAuthError || 
            error instanceof GridValidationError ||
            error instanceof GridAccountNotFoundError ||
            error instanceof GridInvalidOtpError) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < (this.config.retries || 1)) {
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw wrapError(lastError || new Error(`${operationName} failed after ${this.config.retries} attempts`));
  }

  /**
   * Handle Grid SDK errors and convert to appropriate GridError types
   */
  private handleError(error: any, operationName: string): never {
    if (error instanceof GridError) {
      throw error;
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      throw new GridNetworkError(
        `Network error during ${operationName}`,
        error.statusCode,
        { originalError: error }
      );
    }

    // Handle authentication errors
    if (error.statusCode === 401 || error.message?.includes('unauthorized')) {
      throw new GridAuthError(
        `Authentication failed during ${operationName}`,
        error.statusCode,
        { originalError: error }
      );
    }

    // Handle validation errors
    if (error.statusCode === 400 || error.message?.includes('validation')) {
      throw new GridValidationError(
        `Validation error during ${operationName}: ${error.message}`,
        { originalError: error }
      );
    }

    // Handle rate limiting
    if (error.statusCode === 429) {
      throw new GridRateLimitError(
        `Rate limit exceeded during ${operationName}`,
        error.retryAfter,
        { originalError: error }
      );
    }

    // Handle insufficient funds
    if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
      throw new GridInsufficientFundsError(
        `Insufficient funds during ${operationName}`,
        { originalError: error }
      );
    }

    // Handle account not found
    if (error.statusCode === 404 || error.message?.includes('not found')) {
      throw new GridAccountNotFoundError(
        `Account not found during ${operationName}`,
        { originalError: error }
      );
    }

    // Handle invalid OTP
    if (error.message?.includes('invalid otp') || error.message?.includes('otp')) {
      throw new GridInvalidOtpError(
        `Invalid OTP during ${operationName}`,
        { originalError: error }
      );
    }

    // Handle spending limit exceeded
    if (error.message?.includes('spending limit') || error.message?.includes('limit exceeded')) {
      throw new GridSpendingLimitExceededError(
        `Spending limit exceeded during ${operationName}`,
        { originalError: error }
      );
    }

    // Handle service unavailable
    if (error.statusCode >= 500) {
      throw new GridServiceUnavailableError(
        `Service unavailable during ${operationName}`,
        { originalError: error }
      );
    }

    // Handle timeout
    if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
      throw new GridTimeoutError(
        `Timeout during ${operationName}`,
        { originalError: error }
      );
    }

    // Default to unknown error
    throw new GridUnknownError(
      `Unknown error during ${operationName}: ${error.message || 'Unknown error'}`,
      { originalError: error }
    );
  }

  // Account Management Methods

  async createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse> {
    return this.executeWithRetry(async () => {
      try {
        // Use direct API call instead of SDK for now
        const response = await this.makeRequest<CreateAccountResponse>('/accounts', 'POST', request);
        return response;
      } catch (error) {
        this.handleError(error, 'createAccount');
      }
    }, 'createAccount');
  }

  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.executeWithRetry(async () => {
      try {
        // Use direct API call for OTP verification
        const response = await this.makeRequest<VerifyOtpResponse>('/accounts/verify-otp', 'POST', request);
        return response;
      } catch (error) {
        this.handleError(error, 'verifyOtp');
      }
    }, 'verifyOtp');
  }

  async getAccountInfo(request: GetAccountInfoRequest): Promise<AccountInfo> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.getAccountInfo(request);
        return response as AccountInfo;
      } catch (error) {
        this.handleError(error, 'getAccountInfo');
      }
    }, 'getAccountInfo');
  }

  async updateAccount(request: UpdateAccountRequest): Promise<UpdateAccountResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.updateAccount(request);
        return response as UpdateAccountResponse;
      } catch (error) {
        this.handleError(error, 'updateAccount');
      }
    }, 'updateAccount');
  }

  // Balance Management Methods

  async getBalances(request: GetBalancesRequest): Promise<GetBalancesResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.getBalances(request);
        return response as GetBalancesResponse;
      } catch (error) {
        this.handleError(error, 'getBalances');
      }
    }, 'getBalances');
  }

  // Spending Limits Methods

  async createSpendingLimit(request: CreateSpendingLimitRequest): Promise<CreateSpendingLimitResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.createSpendingLimit(request);
        return response as CreateSpendingLimitResponse;
      } catch (error) {
        this.handleError(error, 'createSpendingLimit');
      }
    }, 'createSpendingLimit');
  }

  async deleteSpendingLimit(request: DeleteSpendingLimitRequest): Promise<DeleteSpendingLimitResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.deleteSpendingLimit(request);
        return response as DeleteSpendingLimitResponse;
      } catch (error) {
        this.handleError(error, 'deleteSpendingLimit');
      }
    }, 'deleteSpendingLimit');
  }

  async getSpendingLimits(request: GetSpendingLimitsRequest): Promise<GetSpendingLimitsResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.getSpendingLimits(request);
        return response as GetSpendingLimitsResponse;
      } catch (error) {
        this.handleError(error, 'getSpendingLimits');
      }
    }, 'getSpendingLimits');
  }

  // Transaction Methods

  async createTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.createTransaction(request);
        return response as TransactionResponse;
      } catch (error) {
        this.handleError(error, 'createTransaction');
      }
    }, 'createTransaction');
  }

  async getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.getTransactions(request);
        return response as GetTransactionsResponse;
      } catch (error) {
        this.handleError(error, 'getTransactions');
      }
    }, 'getTransactions');
  }

  // Utility Methods

  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check - try to get client info
      await this.client.getClientInfo();
      return true;
    } catch (error) {
      return false;
    }
  }

  getClientInfo(): { environment: GridEnvironment; apiKey: string } {
    const config = getGridConfig();
    return {
      environment: config.environment,
      apiKey: config.apiKey.substring(0, 8) + '...', // Mask API key for security
    };
  }
}

// Singleton instance
let gridServiceInstance: GridService | null = null;

/**
 * Get the singleton Grid service instance
 */
export function getGridService(config?: GridServiceConfig): GridService {
  if (!gridServiceInstance) {
    gridServiceInstance = new GridService(config);
  }
  return gridServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetGridService(): void {
  gridServiceInstance = null;
}

// Export the service class and types
export { GridService };
export * from '../lib/grid-types';
export * from '../lib/errors';
