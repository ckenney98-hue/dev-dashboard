import { adoGet } from "./adoClient";
import type {
  ConnectionData,
  GitPullRequest,
  PullRequestThread,
  AdoListResponse,
} from "../types/ado";

const project = import.meta.env.VITE_ADO_PROJECT;

let cachedUserId: string | null = null;

export async function fetchCurrentUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const data = await adoGet<ConnectionData>("_apis/connectionData");
  cachedUserId = data.authenticatedUser.id;
  return cachedUserId;
}

export async function fetchMyPullRequests(): Promise<GitPullRequest[]> {
  const userId = await fetchCurrentUserId();
  const data = await adoGet<AdoListResponse<GitPullRequest>>(
    `${project}/_apis/git/pullrequests?searchCriteria.creatorId=${userId}&searchCriteria.status=active`
  );
  return data.value;
}

export async function fetchPRThreads(
  repoId: string,
  prId: number
): Promise<PullRequestThread[]> {
  const data = await adoGet<AdoListResponse<PullRequestThread>>(
    `${project}/_apis/git/repositories/${repoId}/pullRequests/${prId}/threads`
  );
  return data.value;
}
