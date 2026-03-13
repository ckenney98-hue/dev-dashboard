export interface WorktreeInfo {
  path: string;
  name: string;
  branch: string;
  commit: string;
  isBare: boolean;
  isMain: boolean;
  lastModified: string | null;
  dirtyCount: number;
}

export async function fetchWorktrees(): Promise<WorktreeInfo[]> {
  const res = await fetch("/api/local/worktrees");
  if (!res.ok) {
    throw new Error(`Worktree API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
