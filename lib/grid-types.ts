/**
 * TypeScript interfaces for Grid API
 * Defines request/response types for Grid SDK operations
 */

/**
 * Grid environment configuration
 */
export type GridEnvironment = 'sandbox';

/**
 * Grid client configuration
 */
export interface GridClientConfig {
  environment: GridEnvironment;
  apiKey: string;
}

/**
 * Account creation request (matches Grid API)
 */
export interface CreateAccountRequest {
  type: 'email' | 'signers';
  email?: string;
  signers?: string[];
  threshold?: number;
  memo?: string;
}

/**
 * Account creation response (matches Grid API)
 */
export interface CreateAccountResponse {
  data: {
    type: 'email' | 'signers';
    email?: string;
    status: 'pending_verification' | 'active' | 'suspended';
    otp_sent?: boolean;
    created_at: string;
    expires_at?: string;
    memo?: string;
    address?: string; // For signer-based accounts
  };
  metadata: {
    request_id: string;
    timestamp: string;
  };
}

/**
 * OTP verification request (matches Grid API)
 */
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

/**
 * OTP verification response (matches Grid API)
 */
export interface VerifyOtpResponse {
  data: {
    email: string;
    status: 'verified' | 'failed';
    verified_at?: string;
    token?: string;
  };
  metadata: {
    request_id: string;
    timestamp: string;
  };
}

/**
 * Account balance response
 */
export interface AccountBalance {
  accountId: string;
  balance: number;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: string;
}

/**
 * Get balances request
 */
export interface GetBalancesRequest {
  accountId: string;
  currency?: string;
}

/**
 * Get balances response
 */
export interface GetBalancesResponse {
  balances: AccountBalance[];
  totalBalance: number;
  currency: string;
}

/**
 * Spending limit creation request
 */
export interface CreateSpendingLimitRequest {
  accountId: string;
  limit: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Spending limit creation response
 */
export interface CreateSpendingLimitResponse {
  limitId: string;
  accountId: string;
  limit: number;
  currency: string;
  period: string;
  description?: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Delete spending limit request
 */
export interface DeleteSpendingLimitRequest {
  limitId: string;
  accountId: string;
}

/**
 * Delete spending limit response
 */
export interface DeleteSpendingLimitResponse {
  success: boolean;
  limitId: string;
  deletedAt: string;
}

/**
 * Get spending limits request
 */
export interface GetSpendingLimitsRequest {
  accountId: string;
  status?: 'active' | 'paused' | 'cancelled';
  limit?: number;
  offset?: number;
}

/**
 * Get spending limits response
 */
export interface GetSpendingLimitsResponse {
  limits: CreateSpendingLimitResponse[];
  total: number;
  hasMore: boolean;
}

/**
 * Transaction request
 */
export interface TransactionRequest {
  accountId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  recipientAccountId?: string;
  recipientEmail?: string;
}

/**
 * Transaction response
 */
export interface TransactionResponse {
  transactionId: string;
  accountId: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Get transactions request
 */
export interface GetTransactionsRequest {
  accountId: string;
  limit?: number;
  offset?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

/**
 * Get transactions response
 */
export interface GetTransactionsResponse {
  transactions: TransactionResponse[];
  total: number;
  hasMore: boolean;
}

/**
 * Account information response
 */
export interface AccountInfo {
  accountId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Get account info request
 */
export interface GetAccountInfoRequest {
  accountId: string;
}

/**
 * Update account request
 */
export interface UpdateAccountRequest {
  accountId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
}

/**
 * Update account response
 */
export interface UpdateAccountResponse {
  success: boolean;
  accountId: string;
  updatedAt: string;
  account: AccountInfo;
}

/**
 * Grid service interface
 * Defines the contract for Grid operations
 */
export interface IGridService {
  // Account management
  createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
  verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse>;
  getAccountInfo(request: GetAccountInfoRequest): Promise<AccountInfo>;
  updateAccount(request: UpdateAccountRequest): Promise<UpdateAccountResponse>;

  // Balance management
  getBalances(request: GetBalancesRequest): Promise<GetBalancesResponse>;

  // Spending limits
  createSpendingLimit(request: CreateSpendingLimitRequest): Promise<CreateSpendingLimitResponse>;
  deleteSpendingLimit(request: DeleteSpendingLimitRequest): Promise<DeleteSpendingLimitResponse>;
  getSpendingLimits(request: GetSpendingLimitsRequest): Promise<GetSpendingLimitsResponse>;

  // Transactions
  createTransaction(request: TransactionRequest): Promise<TransactionResponse>;
  getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse>;

  // Utility methods
  isHealthy(): Promise<boolean>;
  getClientInfo(): { environment: GridEnvironment; apiKey: string };
}

/**
 * Grid service configuration
 */
export interface GridServiceConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Grid API error response
 */
export interface GridApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
  timestamp: string;
}

/**
 * Grid API success response wrapper
 */
export interface GridApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: GridApiErrorResponse['error'];
  statusCode: number;
  timestamp: string;
}
