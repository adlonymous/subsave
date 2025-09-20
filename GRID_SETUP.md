# Grid SDK Integration Setup

This document explains how to set up and use the Grid SDK client in your SubSave Expo app, based on the [Squads-Grid neobank-example-app](https://github.com/Squads-Grid/neobank-example-app) architecture.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Grid SDK Configuration
# Backend-only variables (never expose these to frontend)
GRID_API_KEY=your_grid_api_key_here

# Public variables (safe for frontend)
EXPO_PUBLIC_GRID_ENV=sandbox
EXPO_PUBLIC_API_ENDPOINT=http://localhost:8081/api
EXPO_PUBLIC_GRID_ENDPOINT=your_custom_endpoint

# Auth0 Configuration
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here

# Environment
NODE_ENV=development
```

### 2. Get Your Grid API Key

1. Visit [Grid Dashboard](https://grid.squads.xyz/dashboard)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key to your `.env` file

### 3. Architecture Overview

This implementation follows the [Squads-Grid neobank-example-app](https://github.com/Squads-Grid/neobank-example-app) architecture, adapted for Expo:

- **Direct SDK Integration**: Uses `easClient.ts` to directly call Grid SDK methods
- **SDK Client**: `sdkClient.ts` provides singleton Grid SDK client with proper initialization
- **Security**: API keys are stored as environment variables and used directly by the SDK
- **SDK Benefits**: Type-safe methods, built-in error handling, and simplified integration

### 4. Basic Usage

```typescript
import { createUserAccount, verifyUserOtp, getUserBalance } from '@/utils/grid-integration';

// Create an account
const account = await createUserAccount('user@example.com');

// Verify OTP
const verification = await verifyUserOtp('user@example.com', '123456');

// Get balance
const balance = await getUserBalance(accountId);
```

## 📁 Project Structure

```
grid/
├── sdkClient.ts        # Grid SDK client wrapper (singleton)

utils/
└── easClient.ts        # Direct Grid SDK integration client

app/
├── utils/
│   └── grid-integration.ts  # App-specific Grid helpers
└── components/
    └── GridAccountSetup.tsx # Grid account setup UI

lib/
├── env.ts              # Environment configuration
├── errors.ts           # Error handling classes
└── grid-types.ts       # Grid API type definitions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GRID_API_KEY` | Your Grid API key | Yes | - |
| `EXPO_PUBLIC_GRID_ENV` | Grid environment (sandbox/production) | No | sandbox |
| `EXPO_PUBLIC_GRID_ENDPOINT` | Custom Grid endpoint (optional) | No | - |
| `NODE_ENV` | Node environment | No | `development` |

### Service Configuration

```typescript
import { getGridService } from './services/grid-service';

const gridService = getGridService({
  timeout: 30000,        // Request timeout in ms
  retries: 3,            // Number of retries
  retryDelay: 1000,      // Delay between retries in ms
});
```

## 🛠️ Available Methods

### Account Management

```typescript
// Create account
const account = await gridService.createAccount({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  metadata: { source: 'mobile_app' }
});

// Verify OTP
const verification = await gridService.verifyOtp({
  accountId: 'account-id',
  otp: '123456'
});

// Get account info
const accountInfo = await gridService.getAccountInfo({
  accountId: 'account-id'
});

// Update account
const updatedAccount = await gridService.updateAccount({
  accountId: 'account-id',
  firstName: 'Jane',
  lastName: 'Smith'
});
```

### Balance Management

```typescript
// Get balances
const balances = await gridService.getBalances({
  accountId: 'account-id',
  currency: 'USD' // Optional
});
```

### Spending Limits

```typescript
// Create spending limit
const spendingLimit = await gridService.createSpendingLimit({
  accountId: 'account-id',
  limit: 1000,
  currency: 'USD',
  period: 'monthly',
  description: 'Monthly subscription limit'
});

// Get spending limits
const limits = await gridService.getSpendingLimits({
  accountId: 'account-id',
  status: 'active'
});

// Delete spending limit
await gridService.deleteSpendingLimit({
  limitId: 'limit-id',
  accountId: 'account-id'
});
```

### Transactions

```typescript
// Create transaction
const transaction = await gridService.createTransaction({
  accountId: 'account-id',
  amount: 15.99,
  currency: 'USD',
  description: 'Netflix subscription',
  metadata: { subscriptionId: 'netflix-001' }
});

// Get transactions
const transactions = await gridService.getTransactions({
  accountId: 'account-id',
  limit: 10,
  status: 'completed'
});
```

## 🚨 Error Handling

The service provides comprehensive error handling with specific error types:

```typescript
import {
  GridError,
  GridValidationError,
  GridAuthError,
  GridNetworkError,
  GridInsufficientFundsError,
  GridAccountNotFoundError,
  GridInvalidOtpError,
  GridSpendingLimitExceededError,
  GridRateLimitError,
  GridServiceUnavailableError,
  GridTimeoutError,
  GridUnknownError
} from './lib/errors';

try {
  const account = await gridService.createAccount(request);
} catch (error) {
  if (error instanceof GridValidationError) {
    // Handle validation errors
    console.error('Validation error:', error.message);
  } else if (error instanceof GridNetworkError) {
    // Handle network errors
    console.error('Network error:', error.message);
  } else if (error instanceof GridAuthError) {
    // Handle authentication errors
    console.error('Auth error:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```

### Error Types

| Error Type | Description | HTTP Status |
|------------|-------------|-------------|
| `GridValidationError` | Invalid request data | 400 |
| `GridAuthError` | Authentication failed | 401, 403 |
| `GridAccountNotFoundError` | Account not found | 404 |
| `GridInvalidOtpError` | Invalid OTP code | 400 |
| `GridInsufficientFundsError` | Insufficient balance | 400 |
| `GridSpendingLimitExceededError` | Spending limit exceeded | 400 |
| `GridRateLimitError` | Too many requests | 429 |
| `GridTimeoutError` | Request timeout | 408 |
| `GridServiceUnavailableError` | Service unavailable | 5xx |
| `GridNetworkError` | Network connectivity issues | - |
| `GridUnknownError` | Unknown/unexpected errors | - |

## 🔄 Retry Logic

The service includes automatic retry logic for transient errors:

- **Retries**: 3 attempts by default
- **Backoff**: Exponential backoff (1s, 2s, 4s)
- **Timeout**: 30 seconds per request
- **Non-retryable**: Auth, validation, and account not found errors

## 🧪 Testing

### Unit Tests

```typescript
import { resetGridService } from './services/grid-service';

// Reset singleton before each test
beforeEach(() => {
  resetGridService();
});
```

### Mock Service

```typescript
// Create a mock service for testing
const mockGridService = {
  createAccount: jest.fn(),
  verifyOtp: jest.fn(),
  getBalances: jest.fn(),
  // ... other methods
};
```

## 📱 React Native Integration

### Using in Components

```typescript
import React, { useState, useEffect } from 'react';
import { getGridService } from '../services/grid-service';
import { GridError } from '../lib/errors';

export function AccountSetupScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const gridService = getGridService();
      const account = await gridService.createAccount({ email });
      
      // Handle success
      console.log('Account created:', account);
    } catch (err) {
      if (err instanceof GridError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your component JSX
  );
}
```

### Using with Context

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { getGridService, IGridService } from '../services/grid-service';

const GridContext = createContext<IGridService | null>(null);

export function GridProvider({ children }: { children: ReactNode }) {
  const gridService = getGridService();
  
  return (
    <GridContext.Provider value={gridService}>
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
}
```

## 🔒 Security Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` files for local development
3. **Production Keys**: Use secure environment variable management in production
4. **Error Logging**: Don't log sensitive information in error messages
5. **Network Security**: Use HTTPS in production

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables (still using sandbox)
GRID_SANDBOX_API_KEY=your_sandbox_api_key
NODE_ENV=production
```

### Health Checks

```typescript
// Check service health
const isHealthy = await gridService.isHealthy();
if (!isHealthy) {
  // Handle service unavailable
}
```

## 📚 Additional Resources

- [Grid SDK Documentation](https://www.npmjs.com/package/@sqds/grid)
- [Grid API Dashboard](https://grid.squads.xyz/dashboard)
- [Grid API Reference](https://docs.grid.squads.xyz/)

## 🤝 Support

For issues related to:
- **Grid SDK**: Contact Grid support
- **Integration**: Check the examples in `lib/grid-example.ts`
- **Error Handling**: Review error types in `lib/errors.ts`
