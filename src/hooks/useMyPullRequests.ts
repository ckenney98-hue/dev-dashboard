import { useState, useEffect } from "react";
import { fetchMyPullRequests, fetchPRThreads } from "../api/pullRequests";
import type { GitPullRequest, PullRequestThread } from "../types/ado";

export interface PRViewModel {
  pr: GitPullRequest;
  unresolvedComments: number;
  totalThreads: number;
  isStuck: boolean;
  webUrl: string;
}

const stuckDays = Number(import.meta.env.VITE_STUCK_DAYS_THRESHOLD) || 3;

function isStuck(pr: GitPullRequest): boolean {
  const created = new Date(pr.creationDate);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= stuckDays;
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

export function useMyPullRequests(refreshKey: number) {
  const [data, setData] = useState<PRViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const prs = await fetchMyPullRequests();

        const withThreads = await Promise.all(
          prs.map(async (pr) => {
            const threads = await fetchPRThreads(
              pr.repository.id,
              pr.pullRequestId
            );
            return {
              pr,
              unresolvedComments: countUnresolved(threads),
              totalThreads: threads.filter(
                (t) => !t.isDeleted && t.comments?.some((c) => c.commentType !== "system")
              ).length,
              isStuck: isStuck(pr),
              webUrl: buildWebUrl(pr),
            };
          })
        );

        if (!cancelled) setData(withThreads);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { data, loading, error };
}
