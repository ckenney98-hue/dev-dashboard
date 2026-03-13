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
  const data = await adoGet<ConnectionData>("_apis/connectionData", { skipVersion: true });
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

export async function fetchTeamReviewPullRequests(): Promise<GitPullRequest[]> {
  const reviewerGroupId = import.meta.env.VITE_ADO_REVIEWER_GROUP_ID;
  if (!reviewerGroupId) {
    throw new Error("VITE_ADO_REVIEWER_GROUP_ID is not configured");
  }

  const userId = await fetchCurrentUserId();
  const data = await adoGet<AdoListResponse<GitPullRequest>>(
    `${project}/_apis/git/pullrequests?searchCriteria.reviewerId=${reviewerGroupId}&searchCriteria.status=active`
  );

  return data.value.filter((pr) => pr.createdBy?.id !== userId);
}

export interface PRStatusEntry {
  state: "succeeded" | "failed" | "pending" | "error" | "notSet" | "notApplicable";
  description: string;
  context: {
    name: string;
    genre: string;
  };
  creationDate: string;
  targetUrl?: string;
}

export async function fetchPRStatuses(
  repoId: string,
  prId: number
): Promise<PRStatusEntry[]> {
  const data = await adoGet<AdoListResponse<PRStatusEntry>>(
    `${project}/_apis/git/repositories/${repoId}/pullRequests/${prId}/statuses`
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
