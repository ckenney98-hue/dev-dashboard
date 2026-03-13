import type { WorkItem } from "../../types/ado";
import { workItemWebUrl } from "../../hooks/useSprintWorkItems";
import "./WorkItemRow.css";

interface WorkItemRowProps {
  item: WorkItem;
}

const TYPE_ICONS: Record<string, string> = {
  "User Story": "📖",
  Bug: "🐛",
  Task: "✅",
  Feature: "🌟",
  Epic: "🏔",
};

const STATE_CLASSES: Record<string, string> = {
  New: "state-new",
  Active: "state-active",
  Developing: "state-developing",
  "Code Review": "state-code-review",
  "Dev Ready": "state-dev-ready",
  "Test Ready": "state-test-ready",
  Resolved: "state-resolved",
  Closed: "state-closed",
  Done: "state-closed",
  Removed: "state-removed",
};

export function WorkItemRow({ item }: WorkItemRowProps) {
  const fields = item.fields;
  const type = fields["System.WorkItemType"];
  const state = fields["System.State"];
  const assignedTo = fields["System.AssignedTo"];
  const points = fields["Microsoft.VSTS.Scheduling.StoryPoints"];
  const webUrl = workItemWebUrl(item);

  return (
    <div className="wi-row">
      <span className="wi-type" title={type}>
        {TYPE_ICONS[type] ?? "📋"}
      </span>
      <div className="wi-main">
        <a href={webUrl} target="_blank" rel="noopener noreferrer" className="wi-title">
          {fields["System.Title"]}
        </a>
        <div className="wi-meta">
          <span className={`wi-state ${STATE_CLASSES[state] ?? ""}`}>{state}</span>
          {assignedTo && (
            <span className="wi-assigned">{assignedTo.displayName}</span>
          )}
        </div>
      </div>
      {points != null && <span className="wi-points" title="Story points">{points} SP</span>}
    </div>
  );
}
