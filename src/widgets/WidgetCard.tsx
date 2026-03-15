import { useState, type ReactNode } from "react";
import "./WidgetCard.css";

interface WidgetCardProps {
  title: ReactNode;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function WidgetCard({ title, loading, error, onRetry, headerActions, children, defaultCollapsed = false }: WidgetCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`widget-card ${collapsed ? "widget-collapsed" : ""}`}>
      <div className="widget-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="widget-title-row">
          <span className={`widget-chevron ${collapsed ? "" : "widget-chevron-open"}`}>&#9656;</span>
          <h2 className="widget-title">{title}</h2>
        </div>
        <div className="widget-header-actions" onClick={(e) => e.stopPropagation()}>
          {headerActions}
          <button className="widget-refresh" onClick={onRetry} title="Refresh">
            ↻
          </button>
        </div>
      </div>
      {!collapsed && (
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
      )}
    </div>
  );
}
