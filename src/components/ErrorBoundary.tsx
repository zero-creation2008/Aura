import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AURA Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full bg-slate-900 border border-cyan-500/30 rounded-xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-2xl font-bold">
              ⚡
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AURA Autonomous System Recovery
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              The platform encountered a client initialization warning. Fallback runtime mode has been engaged.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-rose-400 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition-all cursor-pointer"
              >
                Reload Dashboard
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (_e) {}
                  this.setState({ hasError: false, error: null });
                  window.location.href = window.location.pathname;
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold rounded-lg text-sm transition-all cursor-pointer text-center"
              >
                Reset & Launch Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
