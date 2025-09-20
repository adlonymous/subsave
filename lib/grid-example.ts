/**
 * Grid Service Usage Examples
 * Demonstrates how to use the Grid service in your app
 */

import { getGridService } from '../services/grid-service';
import {
  CreateAccountRequest,
  VerifyOtpRequest,
  GetBalancesRequest,
  CreateSpendingLimitRequest,
  DeleteSpendingLimitRequest,
  TransactionRequest,
} from './grid-types';
import {
  GridError,
  GridNetworkError,
  GridAuthError,
  GridValidationError,
  GridInsufficientFundsError,
  GridAccountNotFoundError,
  GridInvalidOtpError,
  GridSpendingLimitExceededError,
} from './errors';

/**
 * Example: Create a new account (email-based)
 */
export async function createAccountExample() {
  try {
    const gridService = getGridService();
    
    const accountRequest: CreateAccountRequest = {
      type: 'email',
      email: 'user@example.com',
      memo: 'SubSave account for user@example.com',
    };

    const account = await gridService.createAccount(accountRequest);
    console.log('Account created:', account);
    
    return account;
  } catch (error) {
    if (error instanceof GridValidationError) {
      console.error('Validation error:', error.message);
      // Handle validation errors (e.g., invalid email format)
    } else if (error instanceof GridNetworkError) {
      console.error('Network error:', error.message);
      // Handle network errors (e.g., retry with exponential backoff)
    } else {
      console.error('Unexpected error:', error.message);
      // Handle other errors
    }
    throw error;
  }
}

/**
 * Example: Verify OTP
 */
export async function verifyOtpExample(email: string, otp: string) {
  try {
    const gridService = getGridService();
    
    const otpRequest: VerifyOtpRequest = {
      email,
      otp,
    };

    const result = await gridService.verifyOtp(otpRequest);
    console.log('OTP verified:', result);
    
    return result;
  } catch (error) {
    if (error instanceof GridInvalidOtpError) {
      console.error('Invalid OTP:', error.message);
      // Handle invalid OTP (e.g., show error message to user)
    } else if (error instanceof GridAccountNotFoundError) {
      console.error('Account not found:', error.message);
      // Handle account not found
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example: Get account balances
 */
export async function getBalancesExample(accountId: string) {
  try {
    const gridService = getGridService();
    
    const balanceRequest: GetBalancesRequest = {
      accountId,
      currency: 'USD', // Optional: filter by currency
    };

    const balances = await gridService.getBalances(balanceRequest);
    console.log('Account balances:', balances);
    
    return balances;
  } catch (error) {
    if (error instanceof GridAccountNotFoundError) {
      console.error('Account not found:', error.message);
    } else if (error instanceof GridAuthError) {
      console.error('Authentication error:', error.message);
      // Handle auth errors (e.g., redirect to login)
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example: Create spending limit
 */
export async function createSpendingLimitExample(accountId: string) {
  try {
    const gridService = getGridService();
    
    const limitRequest: CreateSpendingLimitRequest = {
      accountId,
      limit: 1000, // $1000 limit
      currency: 'USD',
      period: 'monthly',
      description: 'Monthly subscription limit',
      metadata: {
        category: 'subscriptions',
        autoApproval: true,
      },
    };

    const spendingLimit = await gridService.createSpendingLimit(limitRequest);
    console.log('Spending limit created:', spendingLimit);
    
    return spendingLimit;
  } catch (error) {
    if (error instanceof GridValidationError) {
      console.error('Validation error:', error.message);
    } else if (error instanceof GridInsufficientFundsError) {
      console.error('Insufficient funds:', error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example: Delete spending limit
 */
export async function deleteSpendingLimitExample(limitId: string, accountId: string) {
  try {
    const gridService = getGridService();
    
    const deleteRequest: DeleteSpendingLimitRequest = {
      limitId,
      accountId,
    };

    const result = await gridService.deleteSpendingLimit(deleteRequest);
    console.log('Spending limit deleted:', result);
    
    return result;
  } catch (error) {
    if (error instanceof GridAccountNotFoundError) {
      console.error('Account not found:', error.message);
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example: Create transaction
 */
export async function createTransactionExample(accountId: string) {
  try {
    const gridService = getGridService();
    
    const transactionRequest: TransactionRequest = {
      accountId,
      amount: 15.99, // $15.99
      currency: 'USD',
      description: 'Netflix subscription',
      metadata: {
        subscriptionId: 'netflix-001',
        category: 'entertainment',
        recurring: true,
      },
    };

    const transaction = await gridService.createTransaction(transactionRequest);
    console.log('Transaction created:', transaction);
    
    return transaction;
  } catch (error) {
    if (error instanceof GridInsufficientFundsError) {
      console.error('Insufficient funds:', error.message);
      // Handle insufficient funds (e.g., show add funds prompt)
    } else if (error instanceof GridSpendingLimitExceededError) {
      console.error('Spending limit exceeded:', error.message);
      // Handle spending limit exceeded
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

/**
 * Example: Check service health
 */
export async function checkServiceHealthExample() {
  try {
    const gridService = getGridService();
    
    const isHealthy = await gridService.isHealthy();
    console.log('Grid service healthy:', isHealthy);
    
    const clientInfo = gridService.getClientInfo();
    console.log('Client info:', clientInfo);
    
    return { isHealthy, clientInfo };
  } catch (error) {
    console.error('Health check failed:', error.message);
    throw error;
  }
}

/**
 * Example: Complete account setup flow
 */
export async function completeAccountSetupExample() {
  try {
    console.log('Starting account setup...');
    
    // 1. Create account
    const account = await createAccountExample();
    const accountId = account.data.address || account.data.email;
    if (!accountId) {
      throw new Error('Failed to get account ID from created account');
    }
    console.log('Step 1: Account created with ID:', accountId);
    
    // 2. Verify OTP (in real app, this would come from user input)
    const otp = '123456'; // This would come from user input
    const verification = await verifyOtpExample(account.data.email || '', otp);
    console.log('Step 2: OTP verified:', verification.data.status === 'verified');
    
    // 3. Get initial balances
    const balances = await getBalancesExample(accountId);
    console.log('Step 3: Initial balances:', balances);
    
    // 4. Create spending limit
    const spendingLimit = await createSpendingLimitExample(accountId);
    console.log('Step 4: Spending limit created:', spendingLimit.limitId);
    
    // 5. Check service health
    const health = await checkServiceHealthExample();
    console.log('Step 5: Service health check:', health.isHealthy);
    
    console.log('Account setup completed successfully!');
    
    return {
      account,
      verification,
      balances,
      spendingLimit,
      health,
    };
  } catch (error) {
    console.error('Account setup failed:', error.message);
    throw error;
  }
}

/**
 * Example: Error handling patterns
 */
export function handleGridError(error: unknown) {
  if (error instanceof GridError) {
    switch (error.code) {
      case 'GRID_VALIDATION_ERROR':
        // Show validation error to user
        return { type: 'validation', message: error.message };
      
      case 'GRID_AUTH_ERROR':
        // Redirect to login or refresh token
        return { type: 'auth', message: 'Please log in again' };
      
      case 'GRID_NETWORK_ERROR':
        // Show network error and retry option
        return { type: 'network', message: 'Network error. Please try again.' };
      
      case 'GRID_INSUFFICIENT_FUNDS_ERROR':
        // Show add funds prompt
        return { type: 'funds', message: 'Insufficient funds. Please add money to your account.' };
      
      case 'GRID_RATE_LIMIT_ERROR':
        // Show rate limit message
        return { type: 'rate_limit', message: 'Too many requests. Please wait a moment.' };
      
      default:
        // Show generic error
        return { type: 'unknown', message: 'Something went wrong. Please try again.' };
    }
  }
  
  // Handle non-Grid errors
  return { type: 'unknown', message: 'An unexpected error occurred.' };
}
