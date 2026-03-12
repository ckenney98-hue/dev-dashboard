import { useEffect } from "react";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { MyPRsWidget } from "./widgets/MyPRs/MyPRsWidget";
import { SprintItemsWidget } from "./widgets/SprintItems/SprintItemsWidget";
import "./App.css";

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function App() {
  const { refreshKey, lastRefreshed, refresh } = useAutoRefresh();

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("dashboard-refresh", handler);
    return () => window.removeEventListener("dashboard-refresh", handler);
  }, [refresh]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dev Dashboard</h1>
        <div className="dashboard-actions">
          <span className="last-refreshed">
            Last refreshed: {formatTime(lastRefreshed)}
          </span>
          <button className="refresh-all-btn" onClick={refresh}>
            ↻ Refresh All
          </button>
        </div>
      </header>
      <div className="widget-grid">
        <MyPRsWidget refreshKey={refreshKey} />
        <SprintItemsWidget refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default App;
