"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // ponytail: log safe error info only
    console.error("[ErrorBoundary]", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-gray-400">Something went wrong rendering this section.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
