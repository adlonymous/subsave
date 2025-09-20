/**
 * Centralized error handling classes
 * Provides structured error types for different failure scenarios
 */

/**
 * Base error class for all Grid-related errors
 */
export class GridError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'GRID_ERROR',
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'GridError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GridError);
    }
  }
}

/**
 * Error for network-related failures
 */
export class GridNetworkError extends GridError {
  constructor(message: string, statusCode?: number, details?: any) {
    super(message, 'GRID_NETWORK_ERROR', statusCode, details);
    this.name = 'GridNetworkError';
  }
}

/**
 * Error for authentication failures
 */
export class GridAuthError extends GridError {
  constructor(message: string, statusCode?: number, details?: any) {
    super(message, 'GRID_AUTH_ERROR', statusCode, details);
    this.name = 'GridAuthError';
  }
}

/**
 * Error for validation failures
 */
export class GridValidationError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_VALIDATION_ERROR', undefined, details);
    this.name = 'GridValidationError';
  }
}

/**
 * Error for configuration issues
 */
export class GridConfigError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_CONFIG_ERROR', undefined, details);
    this.name = 'GridConfigError';
  }
}

/**
 * Error for rate limiting
 */
export class GridRateLimitError extends GridError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, details?: any) {
    super(message, 'GRID_RATE_LIMIT_ERROR', 429, details);
    this.name = 'GridRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error for insufficient funds
 */
export class GridInsufficientFundsError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_INSUFFICIENT_FUNDS_ERROR', 400, details);
    this.name = 'GridInsufficientFundsError';
  }
}

/**
 * Error for account not found
 */
export class GridAccountNotFoundError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_ACCOUNT_NOT_FOUND_ERROR', 404, details);
    this.name = 'GridAccountNotFoundError';
  }
}

/**
 * Error for invalid OTP
 */
export class GridInvalidOtpError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_INVALID_OTP_ERROR', 400, details);
    this.name = 'GridInvalidOtpError';
  }
}

/**
 * Error for spending limit exceeded
 */
export class GridSpendingLimitExceededError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_SPENDING_LIMIT_EXCEEDED_ERROR', 400, details);
    this.name = 'GridSpendingLimitExceededError';
  }
}

/**
 * Error for service unavailable
 */
export class GridServiceUnavailableError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_SERVICE_UNAVAILABLE_ERROR', 503, details);
    this.name = 'GridServiceUnavailableError';
  }
}

/**
 * Error for timeout
 */
export class GridTimeoutError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_TIMEOUT_ERROR', 408, details);
    this.name = 'GridTimeoutError';
  }
}

/**
 * Error for unknown/unexpected errors
 */
export class GridUnknownError extends GridError {
  constructor(message: string, details?: any) {
    super(message, 'GRID_UNKNOWN_ERROR', undefined, details);
    this.name = 'GridUnknownError';
  }
}

/**
 * Error type mapping for different HTTP status codes
 */
export const GRID_ERROR_MAP: Record<number, (message: string, details?: any) => GridError> = {
  400: (message: string, details?: any) => new GridValidationError(message, details),
  401: (message: string, details?: any) => new GridAuthError(message, undefined, details),
  403: (message: string, details?: any) => new GridAuthError(message, undefined, details),
  404: (message: string, details?: any) => new GridAccountNotFoundError(message, details),
  408: (message: string, details?: any) => new GridTimeoutError(message, details),
  429: (message: string, details?: any) => new GridRateLimitError(message, undefined, details),
  500: (message: string, details?: any) => new GridServiceUnavailableError(message, details),
  502: (message: string, details?: any) => new GridServiceUnavailableError(message, details),
  503: (message: string, details?: any) => new GridServiceUnavailableError(message, details),
  504: (message: string, details?: any) => new GridServiceUnavailableError(message, details),
};

/**
 * Creates appropriate error type based on status code
 */
export function createGridError(
  message: string,
  statusCode?: number,
  details?: any
): GridError {
  if (statusCode && GRID_ERROR_MAP[statusCode]) {
    return GRID_ERROR_MAP[statusCode](message, details);
  }
  
  return new GridUnknownError(message, details);
}

/**
 * Wraps unknown errors and converts them to GridError
 */
export function wrapError(error: unknown): GridError {
  if (error instanceof GridError) {
    return error;
  }

  if (error instanceof Error) {
    return new GridUnknownError(error.message, { originalError: error });
  }

  return new GridUnknownError('An unknown error occurred', { originalError: error });
}
