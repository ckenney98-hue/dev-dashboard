import type { Plugin } from "vite";
import { readFile, copyFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir, homedir } from "os";
import Database from "better-sqlite3";

interface RawBookmark {
  type: "url" | "folder";
  name: string;
  url?: string;
  children?: RawBookmark[];
}

interface BookmarkEntry {
  name: string;
  url: string;
  folderPath: string;
  visitCount: number;
}

function extractBookmarks(
  node: RawBookmark,
  folderPath: string,
  results: BookmarkEntry[]
): void {
  if (node.type === "url" && node.url) {
    results.push({
      name: node.name,
      url: node.url,
      folderPath,
      visitCount: 0,
    });
  }
  if (node.children) {
    const nextPath = folderPath ? `${folderPath}/${node.name}` : node.name;
    for (const child of node.children) {
      extractBookmarks(child, nextPath, results);
    }
  }
}

export function edgeBookmarksApi(): Plugin {
  return {
    name: "edge-bookmarks-api",
    configureServer(server) {
      server.middlewares.use("/api/local/bookmarks", async (_req, res) => {
        try {
          const edgeDir = join(
            homedir(),
            "AppData/Local/Microsoft/Edge/User Data/Default"
          );
          const bookmarksPath = join(edgeDir, "Bookmarks");
          const historyPath = join(edgeDir, "History");

          const raw = await readFile(bookmarksPath, "utf-8");
          const data = JSON.parse(raw);

          const bookmarkBar = data.roots?.bookmark_bar;
          if (!bookmarkBar) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify([]));
            return;
          }

          const bookmarks: BookmarkEntry[] = [];
          extractBookmarks(bookmarkBar, "", bookmarks);

          if (bookmarks.length === 0) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify([]));
            return;
          }

          // Copy History DB to avoid lock while Edge is running
          const tempPath = join(tmpdir(), `edge-history-${Date.now()}.db`);
          let visitCounts = new Map<string, number>();

          try {
            await copyFile(historyPath, tempPath);
            const db = new Database(tempPath, { readonly: true });

            const urls = bookmarks.map((b) => b.url);
            const placeholders = urls.map(() => "?").join(",");
            const rows = db
              .prepare(
                `SELECT url, visit_count FROM urls WHERE url IN (${placeholders})`
              )
              .all(...urls) as { url: string; visit_count: number }[];

            for (const row of rows) {
              visitCounts.set(row.url, row.visit_count);
            }

            db.close();
          } catch {
            // Graceful degradation: return bookmarks with 0 visits
          } finally {
            try {
              await unlink(tempPath);
            } catch {
              // temp file cleanup is best-effort
            }
          }

          for (const b of bookmarks) {
            b.visitCount = visitCounts.get(b.url) ?? 0;
          }

          bookmarks.sort((a, b) => b.visitCount - a.visitCount);
          const top10 = bookmarks.slice(0, 10);

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(top10));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}
