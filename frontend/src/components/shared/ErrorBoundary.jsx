import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * React Error Boundary — catches rendering errors and shows a fallback UI.
 * Prevents the entire app from crashing on component errors.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B14] flex items-center justify-center p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#FF6B6B]/10 rounded-full blur-[120px]" />
          </div>
          <div className="text-center relative z-10 max-w-md">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-3xl font-extrabold mb-3">
              Something went <span className="text-[#FF6B6B]">wrong</span>
            </h1>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              An unexpected error occurred. Don't worry — your connection is safe.
              Try refreshing the page or going back to the dashboard.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="glass-card p-4 mb-6 text-left">
                <p className="text-xs font-mono text-[#FF6B6B] break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                ↻ Refresh Page
              </button>
              <Link to="/" className="btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
