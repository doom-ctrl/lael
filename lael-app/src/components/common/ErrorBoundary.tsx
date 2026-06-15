import * as React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — wraps the app (or a sub-tree) and renders
 * a calm fallback if a descendant component throws during render.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Hook your logger here (Sentry, etc.) when ready.
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    // Also remount children to reset internal state.
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <h1 className="mb-2 font-display text-2xl italic text-text-primary tracking-[-0.02em]">
              Something went wrong
            </h1>
            <p className="mb-6 text-sm text-text-secondary">
              {this.state.error?.message ??
                'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={this.handleReset}>
                Try again
              </Button>
              <Button onClick={this.handleReload}>
                <RotateCw className="h-3.5 w-3.5" strokeWidth={1.6} />
                Reload page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
