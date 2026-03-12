import type { ReactNode } from "react";
import "./WidgetCard.css";

interface WidgetCardProps {
  title: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
}

export function WidgetCard({ title, loading, error, onRetry, children }: WidgetCardProps) {
  return (
    <div className="widget-card">
      <div className="widget-header">
        <h2 className="widget-title">{title}</h2>
        <button className="widget-refresh" onClick={onRetry} title="Refresh">
          ↻
        </button>
      </div>
      <div className="widget-body">
        {loading && <div className="widget-loading">Loading…</div>}
        {error && (
          <div className="widget-error">
            <span>{error}</span>
            <button onClick={onRetry}>Retry</button>
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  );
}
