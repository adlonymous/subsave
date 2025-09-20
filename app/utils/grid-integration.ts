/**
 * Grid Integration for SubSave App
 * Based on the Squads-Grid neobank-example-app architecture
 * https://github.com/Squads-Grid/neobank-example-app
 */

import { easClient } from '../../utils/easClient';

/**
 * Create a Grid account for a user (email-based)
 */
export async function createUserAccount(email: string, memo?: string) {
  try {
    const account = await easClient.createAccount({
      email,
      memo: memo || `SubSave account for ${email}`,
    });
    
    return account;
  } catch (error) {
    console.error('Failed to create account:', error);
    throw new Error('Failed to create account. Please try again.');
  }
}

/**
 * Verify OTP for account activation
 */
export async function verifyUserOtp(email: string, otp: string) {
  try {
    const verification = await easClient.verifyOtp({
      email,
      otp,
    });

    return verification;
  } catch (error) {
    console.error('OTP verification failed:', error);
    throw new Error('OTP verification failed. Please check your code and try again.');
  }
}

/**
 * Get user's account balance
 */
export async function getUserBalance(accountId: string) {
  try {
    const balances = await easClient.getBalances(accountId);
    return balances;
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error('Failed to get balance. Please try again.');
  }
}

/**
 * Create a spending limit for subscriptions
 */
export async function createSubscriptionLimit(accountId: string, monthlyLimit: number) {
  try {
    const spendingLimit = await easClient.createSpendingLimit({
      accountId,
      limit: monthlyLimit,
      currency: 'USD',
      period: 'monthly',
      description: 'Monthly subscription spending limit',
    });
    
    return spendingLimit;
  } catch (error) {
    console.error('Failed to create spending limit:', error);
    throw new Error('Failed to create spending limit. Please try again.');
  }
}

/**
 * Process a subscription payment
 */
export async function processSubscriptionPayment(
  accountId: string,
  subscriptionName: string,
  amount: number,
  subscriptionId: string
) {
  try {
    const transaction = await easClient.createTransaction({
      accountId,
      amount,
      currency: 'USD',
      description: `${subscriptionName} subscription`,
    });
    
    return transaction;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw new Error('Payment processing failed. Please try again.');
  }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(accountId: string, limit: number = 20) {
  try {
    const transactions = await easClient.getTransactions(accountId, {
      limit,
      status: 'completed',
    });

    return transactions;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    throw new Error('Failed to get transactions. Please try again.');
  }
}

/**
 * Check if Grid service is healthy
 */
export async function isGridServiceHealthy() {
  try {
    // Try to initialize the Grid client first
    await easClient.healthCheck();
    return true;
  } catch (error) {
    console.error('Grid service health check failed:', error);
    return false;
  }
}
