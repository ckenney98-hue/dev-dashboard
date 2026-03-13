import { fetchPRThreads, fetchPRStatuses, type PRStatusEntry } from "../api/pullRequests";
import type { GitPullRequest, PullRequestThread } from "../types/ado";

export type BuildStatus = "succeeded" | "failed" | "pending" | "none";

export interface PRViewModel {
  pr: GitPullRequest;
  unresolvedComments: number;
  totalThreads: number;
  isStuck: boolean;
  isStuckCritical: boolean;
  buildStatus: BuildStatus;
  buildUrl: string | null;
  webUrl: string;
}

const stuckHours = Number(import.meta.env.VITE_STUCK_HOURS_THRESHOLD) || 5;

function getInactiveHours(pr: GitPullRequest, threads: PullRequestThread[]): number {
  let lastActivity = new Date(pr.creationDate).getTime();

  for (const thread of threads) {
    if (thread.isDeleted) continue;
    for (const comment of thread.comments ?? []) {
      const published = new Date(comment.publishedDate).getTime();
      if (published > lastActivity) {
        lastActivity = published;
      }
    }
  }

  return (Date.now() - lastActivity) / (1000 * 60 * 60);
}

function buildWebUrl(pr: GitPullRequest): string {
  const org = import.meta.env.VITE_ADO_ORG;
  const project = import.meta.env.VITE_ADO_PROJECT;
  return `https://dev.azure.com/${org}/${project}/_git/${pr.repository.name}/pullrequest/${pr.pullRequestId}`;
}

function countUnresolved(threads: PullRequestThread[]): number {
  return threads.filter(
    (t) =>
      !t.isDeleted &&
      t.status !== "closed" &&
      t.status !== "fixed" &&
      t.status !== "byDesign" &&
      t.status !== "wontFix" &&
      t.comments?.some((c) => c.commentType !== "system")
  ).length;
}

function deriveBuildStatus(statuses: PRStatusEntry[]): { status: BuildStatus; url: string | null } {
  if (statuses.length === 0) return { status: "none", url: null };

  const latestByContext = new Map<string, PRStatusEntry>();
  for (const s of statuses) {
    const key = `${s.context.genre}/${s.context.name}`;
    const existing = latestByContext.get(key);
    if (!existing || new Date(s.creationDate) > new Date(existing.creationDate)) {
      latestByContext.set(key, s);
    }
  }

  const latest = [...latestByContext.values()];
  const failed = latest.find((s) => s.state === "failed" || s.state === "error");
  if (failed) return { status: "failed", url: failed.targetUrl ?? null };

  const pending = latest.find((s) => s.state === "pending");
  if (pending) return { status: "pending", url: pending.targetUrl ?? null };

  const succeeded = latest.find((s) => s.state === "succeeded");
  if (succeeded) return { status: "succeeded", url: succeeded.targetUrl ?? null };

  return { status: "none", url: null };
}

export async function enrichPullRequests(prs: GitPullRequest[]): Promise<PRViewModel[]> {
  return Promise.all(
    prs.map(async (pr) => {
      const [threads, statuses] = await Promise.all([
        fetchPRThreads(pr.repository.id, pr.pullRequestId),
        fetchPRStatuses(pr.repository.id, pr.pullRequestId),
      ]);
      const inactiveHours = getInactiveHours(pr, threads);
      const build = deriveBuildStatus(statuses);
      return {
        pr,
        unresolvedComments: countUnresolved(threads),
        totalThreads: threads.filter(
          (t) => !t.isDeleted && t.comments?.some((c) => c.commentType !== "system")
        ).length,
        isStuck: inactiveHours >= stuckHours,
        isStuckCritical: inactiveHours >= 24,
        buildStatus: build.status,
        buildUrl: build.url,
        webUrl: buildWebUrl(pr),
      };
    })
  );
}
