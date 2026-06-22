"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  remountKey: number;
}

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, remountKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
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
            onClick={() =>
              this.setState((s) => ({
                hasError: false,
                remountKey: s.remountKey + 1,
              }))
            }
            className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      );
    }

    return <div key={this.state.remountKey} className="h-full w-full">{this.props.children}</div>;
  }
}