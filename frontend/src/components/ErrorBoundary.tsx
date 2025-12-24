import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

/**
 * 🛡️ ErrorBoundary Component
 * Catches React component errors and displays user-friendly messages
 * Prevents blank screen - shows diagnostic info instead
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught error:');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Log to external service (optional)
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error) || (
          <div
            style={{
              padding: '24px',
              border: '2px solid #d32f2f',
              borderRadius: '8px',
              backgroundColor: '#ffebee',
              color: '#d32f2f',
              fontFamily: 'Arial, sans-serif',
              margin: '20px',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#d32f2f' }}>
              ⚠️ Error Rendering ROI Editor
            </h2>
            
            <p style={{ marginBottom: '12px' }}>
              <strong>Error Message:</strong>
            </p>
            <pre
              style={{
                backgroundColor: '#fff3e0',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '100px',
                color: '#e65100',
              }}
            >
              {this.state.error.message}
            </pre>

            <details
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <summary style={{ fontWeight: 'bold', color: '#666' }}>
                📋 Technical Details (Click to expand)
              </summary>
              <pre
                style={{
                  fontSize: '11px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  marginTop: '8px',
                  color: '#666',
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#999' }}>
                💡 Try reloading the page to recover. If the problem persists, please contact support.
              </p>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#b71c1c';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f';
                }}
              >
                🔄 Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
