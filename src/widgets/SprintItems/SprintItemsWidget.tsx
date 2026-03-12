import { useSprintWorkItems } from "../../hooks/useSprintWorkItems";
import { WidgetCard } from "../WidgetCard";
import { WorkItemRow } from "./WorkItemRow";
import "./SprintItemsWidget.css";

interface SprintItemsWidgetProps {
  refreshKey: number;
}

export function SprintItemsWidget({ refreshKey }: SprintItemsWidgetProps) {
  const { data, loading, error } = useSprintWorkItems(refreshKey);
  const { iteration, items, progress } = data;

  const pctItems =
    progress.totalItems > 0
      ? Math.round((progress.doneItems / progress.totalItems) * 100)
      : 0;
  const pctPoints =
    progress.totalPoints > 0
      ? Math.round((progress.donePoints / progress.totalPoints) * 100)
      : 0;

  const title = iteration ? `Sprint: ${iteration.name}` : "Sprint Items";

  return (
    <WidgetCard
      title={title}
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
    >
      {!iteration && !loading ? (
        <div className="widget-empty">No current sprint found</div>
      ) : items.length === 0 && !loading ? (
        <div className="widget-empty">No items in this sprint</div>
      ) : (
        <>
          <div className="sprint-progress">
            <div className="progress-row">
              <span className="progress-label">
                Items: {progress.doneItems}/{progress.totalItems}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pctItems}%` }} />
              </div>
              <span className="progress-pct">{pctItems}%</span>
            </div>
            <div className="progress-row">
              <span className="progress-label">
                Points: {progress.donePoints}/{progress.totalPoints}
              </span>
              <div className="progress-bar">
                <div className="progress-fill progress-fill-points" style={{ width: `${pctPoints}%` }} />
              </div>
              <span className="progress-pct">{pctPoints}%</span>
            </div>
          </div>
          {items.map((item) => (
            <WorkItemRow key={item.id} item={item} />
          ))}
        </>
      )}
    </WidgetCard>
  );
}
