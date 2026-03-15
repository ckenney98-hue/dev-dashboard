import { useState } from "react";
import { useMyPullRequests } from "../../hooks/useMyPullRequests";
import { WidgetCard } from "../WidgetCard";
import { PRRow } from "./PRRow";
import "./MyPRsWidget.css";

interface MyPRsWidgetProps {
  refreshKey: number;
}

export function MyPRsWidget({ refreshKey }: MyPRsWidgetProps) {
  const { data, loading, error } = useMyPullRequests(refreshKey);
  const [showDrafts, setShowDrafts] = useState(true);

  const filtered = showDrafts ? data : data.filter((vm) => !vm.pr.isDraft);
  const newCount = filtered.filter((vm) => vm.isNew).length;

  return (
    <WidgetCard
      title={<>My Pull Requests{newCount > 0 && <span className="new-count-badge">{newCount} new</span>}</>}
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
      headerActions={
        <label className="toggle-drafts">
          <input
            type="checkbox"
            checked={showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
          />
          Drafts
        </label>
      }
    >
      {filtered.length === 0 ? (
        <div className="widget-empty">No open pull requests</div>
      ) : (
        filtered.map((vm) => <PRRow key={vm.pr.pullRequestId} vm={vm} />)
      )}
    </WidgetCard>
  );
}
