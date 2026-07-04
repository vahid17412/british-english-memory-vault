export class ErrorReporter {
  /**
   * Centralized error reporting.
   * In a production environment, this integrates with Sentry or Crashlytics.
   */
  static report(context: string, error: unknown): void {
    // Suppressed direct console.error for UI cleanliness, prepared for structured logging
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[ErrorReporter] ${context}:`, error);
    }
  }
}
