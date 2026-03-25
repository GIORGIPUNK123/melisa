import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can also log to an error reporting service here
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4'>
          <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full'>
            <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>

            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center'>
              Oops! Something went wrong
            </h2>

            <p className='text-gray-600 dark:text-gray-400 mb-6 text-center'>
              {this.state.error?.message ||
                'An unexpected error occurred. Please try reloading the page.'}
            </p>

            <Button onClick={this.handleReload} variant='primary' fullWidth>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
