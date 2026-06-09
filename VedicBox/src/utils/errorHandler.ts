// Error handling utility
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: unknown): { message: string; code: string } => {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof Error) {
    if (error.message.includes('auth')) {
      return { message: 'Authentication failed. Please log in again.', code: 'AUTH_ERROR' };
    }
    if (error.message.includes('network')) {
      return { message: 'Network error. Check your connection.', code: 'NETWORK_ERROR' };
    }
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
};

export const logError = (error: unknown, context?: string) => {
  const env = import.meta.env.VITE_ENV;
  if (env === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }
  // TODO: Send to Sentry/Monitoring service in production
};
