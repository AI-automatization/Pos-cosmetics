'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Class component: only exported via the functional wrapper below to avoid
// dual @types/react (v18 mobile / v19 web) monorepo JSX type conflict.
class _ErrorBoundaryImpl extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack); // eslint-disable-line no-console
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700">Sahifani yuklashda xato yuz berdi</p>
          <p className="text-xs text-red-500">
            {this.state.error?.message ?? 'Kutilmagan xato'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
          >
            Qayta urinish
          </button>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}

// Functional wrapper: TypeScript checks this signature (not the class),
// bypassing the @types/react 18 vs 19 incompatibility in this monorepo.
export function ErrorBoundary({ children, fallback }: Props): React.JSX.Element {
  return React.createElement(_ErrorBoundaryImpl, { fallback, children }) as React.JSX.Element;
}
