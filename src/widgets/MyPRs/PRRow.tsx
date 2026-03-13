import type { PRViewModel } from "../../hooks/useMyPullRequests";
import "./PRRow.css";

interface PRRowProps {
  vm: PRViewModel;
}

function voteClass(vote: number): string {
  if (vote === 10) return "vote-approved";
  if (vote === 5) return "vote-suggestions";
  if (vote === -5) return "vote-waiting";
  if (vote === -10) return "vote-rejected";
  return "vote-none";
}

function voteLabel(vote: number): string {
  if (vote === 10) return "✓";
  if (vote === 5) return "~";
  if (vote === -5) return "⏳";
  if (vote === -10) return "✗";
  return "○";
}

const BUILD_ICONS: Record<string, string> = {
  succeeded: "✓",
  failed: "✗",
  pending: "●",
};

const BUILD_LABELS: Record<string, string> = {
  succeeded: "Build passed",
  failed: "Build failed",
  pending: "Build running",
};

export function PRRow({ vm }: PRRowProps) {
  const { pr, unresolvedComments, isStuck, isStuckCritical, buildStatus, buildUrl, webUrl } = vm;
  const targetBranch = pr.targetRefName.replace("refs/heads/", "");
  const hasConflicts = pr.mergeStatus === "conflicts";

  return (
    <div className="pr-row">
      <div className="pr-main">
        <div className="pr-title-line">
          <a href={webUrl} target="_blank" rel="noopener noreferrer" className="pr-title">
            {pr.title}
          </a>
          <div className="pr-badges">
            {pr.isDraft && <span className="badge badge-draft">Draft</span>}
            {hasConflicts && <span className="badge badge-conflict">Conflicts</span>}
            {isStuck && (
              <span className={`badge ${isStuckCritical ? "badge-stuck-critical" : "badge-stuck"}`}>
                Stuck
              </span>
            )}
            {buildStatus !== "none" && (
              buildUrl ? (
                <a
                  href={buildUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`badge badge-build badge-build-${buildStatus}`}
                  title={BUILD_LABELS[buildStatus]}
                >
                  {BUILD_ICONS[buildStatus]} Build
                </a>
              ) : (
                <span
                  className={`badge badge-build badge-build-${buildStatus}`}
                  title={BUILD_LABELS[buildStatus]}
                >
                  {BUILD_ICONS[buildStatus]} Build
                </span>
              )
            )}
          </div>
        </div>
        <div className="pr-meta">
          <span className="pr-repo">{pr.repository.name}</span>
          <span className="pr-arrow">→</span>
          <span className="pr-branch">{targetBranch}</span>
          {unresolvedComments > 0 && (
            <span className="pr-comments" title={`${unresolvedComments} unresolved`}>
              💬 {unresolvedComments}
            </span>
          )}
        </div>
      </div>
      <div className="pr-reviewers">
        {pr.reviewers.map((r) => (
          <span
            key={r.id}
            className={`reviewer-vote ${voteClass(r.vote)}`}
            title={`${r.displayName}: ${voteLabel(r.vote)}`}
          >
            {voteLabel(r.vote)}
          </span>
        ))}
      </div>
    </div>
  );
}
