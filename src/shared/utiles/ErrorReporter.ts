export class ErrorReporter {
  static report(context: string, error: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[ErrorReporter] ${context}:`, error);
    } else {
      // In production, send to internal logger without exposing PII or stack traces
      const safeError = error instanceof Error ? error.message : 'Unknown error';
      // Example: InternalLogger.log({ context, message: safeError });
    }
  }
}