import { useState, useEffect } from "react";
import { fetchWorktrees, type WorktreeInfo } from "../api/worktrees";
import { fetchMyPullRequests } from "../api/pullRequests";
import { fetchWorkItemsBatch } from "../api/workItems";
import type { WorkItem } from "../types/ado";

export type { WorktreeInfo };

export interface WorktreeViewModel {
  worktree: WorktreeInfo;
  workItem: WorkItem | null;
  prUrl: string | null;
  prId: number | null;
}

const ADO_ID_PATTERN = /^ado-(\d+)/;

function parseWorkItemId(branch: string): number | null {
  const match = branch.match(ADO_ID_PATTERN);
  return match ? Number(match[1]) : null;
}

function buildPrWebUrl(repoName: string, prId: number): string {
  const org = import.meta.env.VITE_ADO_ORG;
  const project = import.meta.env.VITE_ADO_PROJECT;
  return `https://dev.azure.com/${org}/${project}/_git/${repoName}/pullrequest/${prId}`;
}

export function useWorktrees(refreshKey: number) {
  const [data, setData] = useState<WorktreeViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [worktrees, myPrs] = await Promise.all([
          fetchWorktrees(),
          fetchMyPullRequests(),
        ]);

        const workItemIds = worktrees
          .map((wt) => parseWorkItemId(wt.branch))
          .filter((id): id is number => id !== null);

        const uniqueIds = [...new Set(workItemIds)];
        const workItems = uniqueIds.length > 0
          ? await fetchWorkItemsBatch(uniqueIds)
          : [];

        const workItemMap = new Map<number, WorkItem>();
        for (const wi of workItems) {
          workItemMap.set(wi.id, wi);
        }

        const prByBranch = new Map<string, { prId: number; repoName: string }>();
        for (const pr of myPrs) {
          const branch = pr.sourceRefName.replace("refs/heads/", "");
          prByBranch.set(branch, { prId: pr.pullRequestId, repoName: pr.repository.name });
        }

        const viewModels: WorktreeViewModel[] = worktrees.map((wt) => {
          const wiId = parseWorkItemId(wt.branch);
          const prInfo = prByBranch.get(wt.branch);
          return {
            worktree: wt,
            workItem: wiId ? workItemMap.get(wiId) ?? null : null,
            prUrl: prInfo ? buildPrWebUrl(prInfo.repoName, prInfo.prId) : null,
            prId: prInfo?.prId ?? null,
          };
        });

        if (!cancelled) setData(viewModels);
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
