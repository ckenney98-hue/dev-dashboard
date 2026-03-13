import { useWorktrees } from "../../hooks/useWorktrees";
import { WidgetCard } from "../WidgetCard";
import { WorktreeRow } from "./WorktreeRow";

interface WorktreesWidgetProps {
  refreshKey: number;
}

export function WorktreesWidget({ refreshKey }: WorktreesWidgetProps) {
  const { data, loading, error } = useWorktrees(refreshKey);

  const viewModels = data.filter((vm) => !vm.worktree.isBare);

  return (
    <WidgetCard
      title="Git Worktrees"
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
    >
      {viewModels.length === 0 ? (
        <div className="widget-empty">No worktrees found</div>
      ) : (
        viewModels.map((vm) => <WorktreeRow key={vm.worktree.path} vm={vm} />)
      )}
    </WidgetCard>
  );
}
