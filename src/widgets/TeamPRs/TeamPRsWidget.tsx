import { useState } from "react";
import { useTeamPullRequests } from "../../hooks/useTeamPullRequests";
import { WidgetCard } from "../WidgetCard";
import { PRRow } from "../MyPRs/PRRow";
import "../MyPRs/MyPRsWidget.css";

interface TeamPRsWidgetProps {
  refreshKey: number;
}

export function TeamPRsWidget({ refreshKey }: TeamPRsWidgetProps) {
  const { data, loading, error } = useTeamPullRequests(refreshKey);
  const [showDrafts, setShowDrafts] = useState(true);

  const filtered = showDrafts ? data : data.filter((vm) => !vm.pr.isDraft);

  return (
    <WidgetCard
      title="Flannel Reviewers"
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
        <div className="widget-empty">No PRs waiting for review</div>
      ) : (
        filtered.map((vm) => <PRRow key={vm.pr.pullRequestId} vm={vm} />)
      )}
    </WidgetCard>
  );
}
