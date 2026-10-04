import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-mono tracking-tight uppercase">Something went wrong</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              We couldn't generate your document. Your entered information has not been lost.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono bg-slate-100 border p-3 rounded-lg max-w-md mx-auto text-left text-red-800 overflow-x-auto my-2 max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={this.handleReset}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/create';
                }
              }}
              className="py-2.5 px-5 bg-white border border-slate-250 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => {
                window.location.href = '/create';
              }}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
