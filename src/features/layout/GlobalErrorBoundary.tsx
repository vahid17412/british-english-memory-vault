import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(): State {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().split('-')[0]
      : `err-${Date.now().toString(36)}`;

    return {
      hasError: true,
      errorId: id,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    ErrorReporter.report('GlobalErrorBoundary', { error, errorInfo });
  }

  private handleCopy = () => {
    if (this.state.errorId) {
      navigator.clipboard.writeText(this.state.errorId).catch(() => {});
    }
  }

  private handleReset = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center font-sans">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            We encountered an unexpected error. Your flashcard data is safe in the local database.
          </p>
          <div 
            onClick={this.handleCopy}
            className="text-xs text-gray-400 dark:text-gray-600 font-mono mb-8 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Click to copy Error ID"
          >
            Error ID: {this.state.errorId}
          </div>
          <button 
            onClick={this.handleReset}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}