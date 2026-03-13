import type { Plugin } from "vite";
import { execFile } from "child_process";
import { stat } from "fs/promises";
import { join } from "path";

interface WorktreeEntry {
  path: string;
  name: string;
  branch: string;
  commit: string;
  isBare: boolean;
  isMain: boolean;
  lastModified: string | null;
  dirtyCount: number;
}

function parseWorktreeList(output: string): Omit<WorktreeEntry, "lastModified" | "dirtyCount">[] {
  const entries: Omit<WorktreeEntry, "lastModified" | "dirtyCount">[] = [];
  const blocks = output.trim().split(/\n\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    let path = "";
    let commit = "";
    let branch = "";
    let isBare = false;

    for (const line of lines) {
      if (line.startsWith("worktree ")) {
        path = line.slice("worktree ".length).trim();
      } else if (line.startsWith("HEAD ")) {
        commit = line.slice("HEAD ".length).trim();
      } else if (line.startsWith("branch ")) {
        branch = line.slice("branch ".length).trim().replace("refs/heads/", "");
      } else if (line.trim() === "bare") {
        isBare = true;
      } else if (line.trim() === "detached") {
        branch = "(detached)";
      }
    }

    if (path) {
      entries.push({
        path,
        name: path.split(/[\\/]/).pop() || path,
        branch,
        commit: commit.slice(0, 8),
        isBare,
        isMain: false,
      });
    }
  }

  if (entries.length > 0) {
    entries[0].isMain = true;
  }

  return entries;
}

function gitWorktreeList(repoRoot: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", ["worktree", "list", "--porcelain"], { cwd: repoRoot }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

function getDirtyCount(worktreePath: string): Promise<number> {
  return new Promise((resolve) => {
    execFile(
      "git",
      ["status", "--porcelain"],
      { cwd: worktreePath },
      (err, stdout) => {
        if (err) {
          resolve(-1);
          return;
        }
        const lines = stdout.trim().split("\n").filter(Boolean);
        resolve(lines.length);
      }
    );
  });
}

async function getLastModified(worktreePath: string): Promise<string | null> {
  try {
    const gitHead = join(worktreePath, ".git");
    const stats = await stat(gitHead);
    return stats.mtime.toISOString();
  } catch {
    return null;
  }
}

export function localGitApi(repoRoot: string): Plugin {
  return {
    name: "local-git-api",
    configureServer(server) {
      server.middlewares.use("/api/local/worktrees", async (_req, res) => {
        try {
          const raw = await gitWorktreeList(repoRoot);
          const entries = parseWorktreeList(raw);

          const withDates: WorktreeEntry[] = await Promise.all(
            entries.map(async (e) => ({
              ...e,
              lastModified: await getLastModified(e.path),
              dirtyCount: e.isBare ? 0 : await getDirtyCount(e.path),
            }))
          );

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(withDates));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}
