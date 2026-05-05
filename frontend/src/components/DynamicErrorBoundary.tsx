import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DynamicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dynamic Rendering Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-3xl animate-fade-in text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 mb-6">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rendering Failed</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            The current configuration caused a runtime error. This usually happens when the JSON schema is incompatible with the rendering engine.
          </p>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-left font-mono text-xs text-red-500 mb-8 border border-red-100 dark:border-red-900/30 max-w-full overflow-auto">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCcw size={18} />
            Reset Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
