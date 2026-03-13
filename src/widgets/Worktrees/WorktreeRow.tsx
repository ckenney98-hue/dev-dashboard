import type { WorktreeViewModel } from "../../hooks/useWorktrees";
import "./WorktreeRow.css";

interface WorktreeRowProps {
  vm: WorktreeViewModel;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function workItemWebUrl(id: number): string {
  const org = import.meta.env.VITE_ADO_ORG;
  const project = import.meta.env.VITE_ADO_PROJECT;
  return `https://dev.azure.com/${org}/${project}/_workitems/edit/${id}`;
}

export function WorktreeRow({ vm }: WorktreeRowProps) {
  const { worktree, workItem, prUrl, prId } = vm;

  return (
    <div className={`wt-row ${worktree.isMain ? "wt-main" : ""}`}>
      <div className="wt-main-col">
        <div className="wt-title-line">
          <span className="wt-name" title={worktree.path}>
            {worktree.isMain ? "main repo" : worktree.name}
          </span>
          <div className="wt-badges">
            {prUrl && (
              <a href={prUrl} target="_blank" rel="noopener noreferrer" className="wt-badge wt-badge-pr" title={`PR #${prId}`}>
                PR #{prId}
              </a>
            )}
            <span className={`wt-badge ${worktree.dirtyCount > 0 ? "wt-dirty" : "wt-clean"}`}>
              {worktree.dirtyCount > 0 ? `${worktree.dirtyCount} changed` : "clean"}
            </span>
          </div>
        </div>
        {workItem && (
          <div className="wt-work-item">
            <span className="wt-wi-type">{workItem.fields["System.WorkItemType"]}:</span>
            <a href={workItemWebUrl(workItem.id)} target="_blank" rel="noopener noreferrer" className="wt-wi-link">
              #{workItem.id}
            </a>
            <span className="wt-wi-title">{workItem.fields["System.Title"]}</span>
            <span className="wt-wi-state">{workItem.fields["System.State"]}</span>
          </div>
        )}
        <div className="wt-meta">
          <span className="wt-branch">{worktree.branch}</span>
          <span className="wt-commit">{worktree.commit}</span>
          {worktree.lastModified && (
            <span className="wt-modified" title={worktree.lastModified}>
              {timeAgo(worktree.lastModified)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
