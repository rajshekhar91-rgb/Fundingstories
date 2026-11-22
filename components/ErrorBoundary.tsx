import React from 'react';

interface ErrorBoundaryState { hasError: boolean; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application rendering error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="mb-3 text-2xl font-medium">Something went wrong</h1>
          <p className="mb-6 text-gray-600">The page could not be displayed. Reload to try again.</p>
          <button className="border border-gray-300 px-4 py-2" onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    }
    return this.props.children;
  }
}
