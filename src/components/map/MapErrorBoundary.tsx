"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 bg-slate-100 p-6 text-center">
          <p className="text-sm font-medium text-slate-800">Map failed to load</p>
          <p className="text-xs text-slate-500">
            Refresh the page or try again later. Listings remain available in the sidebar.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}