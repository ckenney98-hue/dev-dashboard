import { useState, useEffect, useRef } from "react";
import {
  fetchCurrentIteration,
  fetchIterationWorkItems,
  fetchWorkItemsBatch,
} from "../api/workItems";
import { fetchCurrentUserName } from "../api/pullRequests";
import type { WorkItem, TeamIteration } from "../types/ado";

export interface SprintProgress {
  totalItems: number;
  doneItems: number;
  totalPoints: number;
  donePoints: number;
}

export interface SprintData {
  iteration: TeamIteration | null;
  items: WorkItem[];
  progress: SprintProgress;
  currentUserName: string;
}

const DONE_STATES = ["Closed", "Done", "Resolved", "Removed"];

function buildWebUrl(item: WorkItem): string {
  const org = import.meta.env.VITE_ADO_ORG;
  const project = import.meta.env.VITE_ADO_PROJECT;
  return `https://dev.azure.com/${org}/${project}/_workitems/edit/${item.id}`;
}

export { buildWebUrl as workItemWebUrl };

export function useSprintWorkItems(refreshKey: number) {
  const [data, setData] = useState<SprintData>({
    iteration: null,
    items: [],
    progress: { totalItems: 0, doneItems: 0, totalPoints: 0, donePoints: 0 },
    currentUserName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasFetched.current) setLoading(true);
      setError(null);
      try {
        const iteration = await fetchCurrentIteration();
        if (!iteration) {
          if (!cancelled)
            setData({
              iteration: null,
              items: [],
              progress: { totalItems: 0, doneItems: 0, totalPoints: 0, donePoints: 0 },
              currentUserName: "",
            });
          return;
        }

        const ids = await fetchIterationWorkItems(iteration.id);
        const unordered = await fetchWorkItemsBatch(ids);
        const orderMap = new Map(ids.map((id, i) => [id, i]));
        const items = unordered
          .filter((i) => i.fields["System.WorkItemType"] !== "Task")
          .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

        const progress: SprintProgress = {
          totalItems: items.length,
          doneItems: items.filter((i) =>
            DONE_STATES.includes(i.fields["System.State"])
          ).length,
          totalPoints: items.reduce(
            (sum, i) =>
              sum + (i.fields["Microsoft.VSTS.Scheduling.StoryPoints"] ?? 0),
            0
          ),
          donePoints: items
            .filter((i) => DONE_STATES.includes(i.fields["System.State"]))
            .reduce(
              (sum, i) =>
                sum + (i.fields["Microsoft.VSTS.Scheduling.StoryPoints"] ?? 0),
              0
            ),
        };

        const currentUserName = await fetchCurrentUserName();
        if (!cancelled) setData({ iteration, items, progress, currentUserName });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) {
          setLoading(false);
          hasFetched.current = true;
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { data, loading, error };
}
