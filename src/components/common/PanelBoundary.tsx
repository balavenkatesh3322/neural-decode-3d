import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** If a panel crashes, show a small message and keep the rest of the app (and the 3D view) alive. */
export class PanelBoundary extends React.Component<{ children: React.ReactNode; onReset: () => void }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('[NeuralDecode] panel crashed:', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2f2a27]/50">
        <div className="max-w-sm w-full p-5 rounded-2xl bg-[#fffbf4] border border-rose-200 shadow-2xl space-y-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4" /> This panel hit a problem
          </div>
          <p className="text-xs text-[#534a43] font-mono break-words">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset();
            }}
            className="w-full py-2 rounded-xl bg-[#2f2a27] text-white text-xs font-semibold"
          >
            Close panel
          </button>
        </div>
      </div>
    );
  }
}
