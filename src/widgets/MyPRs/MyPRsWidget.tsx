import { useMyPullRequests } from "../../hooks/useMyPullRequests";
import { WidgetCard } from "../WidgetCard";
import { PRRow } from "./PRRow";

interface MyPRsWidgetProps {
  refreshKey: number;
}

export function MyPRsWidget({ refreshKey }: MyPRsWidgetProps) {
  const { data, loading, error } = useMyPullRequests(refreshKey);

  return (
    <WidgetCard
      title="My Pull Requests"
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
    >
      {data.length === 0 ? (
        <div className="widget-empty">No open pull requests</div>
      ) : (
        data.map((vm) => <PRRow key={vm.pr.pullRequestId} vm={vm} />)
      )}
    </WidgetCard>
  );
}
