// Connection data
export interface ConnectionData {
  authenticatedUser: {
    id: string;
    providerDisplayName: string;
    properties: Record<string, unknown>;
  };
}

// Pull Requests
export interface GitPullRequest {
  pullRequestId: number;
  title: string;
  status: "active" | "abandoned" | "completed";
  isDraft: boolean;
  creationDate: string;
  mergeStatus: string;
  sourceRefName: string;
  targetRefName: string;
  repository: {
    id: string;
    name: string;
    url: string;
    webUrl: string;
  };
  createdBy: {
    id: string;
    displayName: string;
  };
  reviewers: PullRequestReviewer[];
  url: string;
  _links?: {
    web?: { href: string };
  };
}

export interface PullRequestReviewer {
  id: string;
  displayName: string;
  uniqueName: string;
  vote: number; // 10=approved, 5=suggestions, 0=none, -5=waiting, -10=rejected
  isRequired: boolean;
  imageUrl?: string;
}

export interface PullRequestThread {
  id: number;
  status: "active" | "byDesign" | "closed" | "fixed" | "pending" | "unknown" | "wontFix";
  comments: ThreadComment[];
  isDeleted: boolean;
  properties?: Record<string, unknown>;
  threadContext?: {
    filePath: string;
  };
}

export interface ThreadComment {
  id: number;
  content: string;
  author: {
    displayName: string;
    id: string;
  };
  publishedDate: string;
  commentType: string;
}

// Work Items
export interface WorkItem {
  id: number;
  fields: {
    "System.Title": string;
    "System.State": string;
    "System.WorkItemType": string;
    "System.AssignedTo"?: {
      displayName: string;
      uniqueName: string;
      imageUrl?: string;
    };
    "Microsoft.VSTS.Scheduling.StoryPoints"?: number;
    "System.Tags"?: string;
    "Microsoft.VSTS.Common.ClosedDate"?: string;
  };
  url: string;
  _links?: {
    html?: { href: string };
  };
}

export interface TeamIteration {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate: string;
    finishDate: string;
    timeFrame: "past" | "current" | "future";
  };
}

export interface IterationWorkItems {
  workItemRelations: Array<{
    target: {
      id: number;
      url: string;
    };
    rel: string | null;
    source: {
      id: number;
      url: string;
    } | null;
  }>;
}

// ADO list response wrapper
export interface AdoListResponse<T> {
  count: number;
  value: T[];
}
