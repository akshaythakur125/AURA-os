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
        <div className="rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-6 text-center">
          <p className="text-sm text-[#6f675e]">Something went wrong rendering this section.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-xs text-red-400 hover:text-red-300"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
