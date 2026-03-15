import { useEffect } from "react";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import { MyPRsWidget } from "./widgets/MyPRs/MyPRsWidget";
import { TeamPRsWidget } from "./widgets/TeamPRs/TeamPRsWidget";
import { SprintItemsWidget } from "./widgets/SprintItems/SprintItemsWidget";
import { WorktreesWidget } from "./widgets/Worktrees/WorktreesWidget";
import { BookmarksWidget } from "./widgets/Bookmarks/BookmarksWidget";
import { CompletedItemsWidget } from "./widgets/CompletedItems/CompletedItemsWidget";
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
        <div className="pr-column">
          <SprintItemsWidget refreshKey={refreshKey} />
          <CompletedItemsWidget refreshKey={refreshKey} />
        </div>
        <div className="pr-column">
          <MyPRsWidget refreshKey={refreshKey} />
          <TeamPRsWidget refreshKey={refreshKey} />
          <WorktreesWidget refreshKey={refreshKey} />
        </div>
        <BookmarksWidget refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default App;
