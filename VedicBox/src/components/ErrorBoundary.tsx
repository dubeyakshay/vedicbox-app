import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Something went wrong</h1>
          <p className="text-red-700 text-center mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
