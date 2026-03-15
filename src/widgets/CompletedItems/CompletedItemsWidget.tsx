import { useSprintWorkItems } from "../../hooks/useSprintWorkItems";
import { workItemWebUrl } from "../../hooks/useSprintWorkItems";
import { WidgetCard } from "../WidgetCard";
import type { WorkItem } from "../../types/ado";
import "./CompletedItemsWidget.css";

interface CompletedItemsWidgetProps {
  refreshKey: number;
}

const CLOSED_STATES = ["Closed", "Done", "Resolved", "Removed"];

function isDeployed(item: WorkItem): boolean {
  const closedDate = item.fields["Microsoft.VSTS.Common.ClosedDate"];
  if (!closedDate) return false;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(closedDate).getTime() <= endOfToday.getTime();
}

const TYPE_ICONS: Record<string, string> = {
  "User Story": "📖",
  Bug: "🐛",
  Task: "✅",
  Feature: "🌟",
  Epic: "🏔",
};

export function CompletedItemsWidget({ refreshKey }: CompletedItemsWidgetProps) {
  const { data, loading, error } = useSprintWorkItems(refreshKey);
  const { items: allItems } = data;

  const closedItems = allItems.filter((i) =>
    CLOSED_STATES.includes(i.fields["System.State"])
  );

  return (
    <WidgetCard
      title={<>Completed{closedItems.length > 0 && <span className="completed-count">{closedItems.length}</span>}</>}
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
    >
      {closedItems.length === 0 ? (
        <div className="widget-empty">No completed items yet</div>
      ) : (
        closedItems.map((item) => {
          const deployed = isDeployed(item);
          const fields = item.fields;
          const type = fields["System.WorkItemType"];
          const points = fields["Microsoft.VSTS.Scheduling.StoryPoints"];

          return (
            <div key={item.id} className={`ci-row ${deployed ? "ci-deployed" : ""}`}>
              <span className="ci-type" title={type}>
                {TYPE_ICONS[type] ?? "📋"}
              </span>
              <div className="ci-main">
                <div className="ci-title-line">
                  <a
                    href={workItemWebUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ci-title"
                  >
                    {fields["System.Title"]}
                  </a>
                  {deployed && <span className="ci-badge-deployed">Deployed</span>}
                </div>
                <div className="ci-meta">
                  <span className="ci-state">{fields["System.State"]}</span>
                  {fields["System.AssignedTo"] && (
                    <span className="ci-assigned">
                      {fields["System.AssignedTo"].displayName}
                    </span>
                  )}
                </div>
              </div>
              {points != null && (
                <span className="ci-points" title="Story points">
                  {points} SP
                </span>
              )}
            </div>
          );
        })
      )}
    </WidgetCard>
  );
}
