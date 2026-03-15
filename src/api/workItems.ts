import { adoGet, adoPost } from "./adoClient";
import type {
  TeamIteration,
  IterationWorkItems,
  WorkItem,
  AdoListResponse,
} from "../types/ado";

const project = import.meta.env.VITE_ADO_PROJECT;
const team = import.meta.env.VITE_ADO_TEAM;

export async function fetchCurrentIteration(): Promise<TeamIteration | null> {
  const data = await adoGet<AdoListResponse<TeamIteration>>(
    `${project}/${team}/_apis/work/teamsettings/iterations?$timeframe=current`
  );
  return data.value[0] ?? null;
}

export async function fetchIterationWorkItems(
  iterationId: string
): Promise<number[]> {
  const data = await adoGet<IterationWorkItems>(
    `${project}/${team}/_apis/work/teamsettings/iterations/${iterationId}/workitems`,
    { preview: true, apiVersion: "6.0" }
  );
  // Collect unique work item IDs (targets only, deduped)
  const ids = new Set<number>();
  for (const rel of data.workItemRelations) {
    if (rel.target) ids.add(rel.target.id);
  }
  return [...ids];
}

export async function fetchWorkItemsBatch(ids: number[]): Promise<WorkItem[]> {
  if (ids.length === 0) return [];
  const data = await adoPost<AdoListResponse<WorkItem>>(
    `${project}/_apis/wit/workitemsbatch`,
    {
      ids,
      fields: [
        "System.Title",
        "System.State",
        "System.WorkItemType",
        "System.AssignedTo",
        "Microsoft.VSTS.Scheduling.StoryPoints",
        "System.Tags",
        "Microsoft.VSTS.Common.ClosedDate",
      ],
    },
    { preview: true }
  );
  return data.value;
}
