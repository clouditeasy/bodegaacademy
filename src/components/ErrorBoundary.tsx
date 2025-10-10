import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-900">
                  Une erreur s'est produite
                </h1>
                <p className="text-sm text-red-700">
                  L'application a rencontré un problème
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-red-900 mb-2">Détails de l'erreur:</h2>
              <pre className="text-xs text-red-800 overflow-auto whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Stack trace (détails techniques)
                </summary>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Recharger la page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Réinitialiser et recharger
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p><strong>Informations système:</strong></p>
              <p>User Agent: {navigator.userAgent}</p>
              <p>Viewport: {window.innerWidth}x{window.innerHeight}</p>
              <p>Date: {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
