# Most Used Bookmarks Widget

## Context

The user wants a dashboard widget showing their top 10 most-visited bookmarked pages. They use Microsoft Edge. Edge stores bookmarks in a JSON file and browsing history in a SQLite database. By cross-referencing bookmarked URLs with visit counts from history, we can rank bookmarks by actual usage. Only bookmarks under the **Bookmarks bar** (and its subfolders) should be considered.

## Approach

**Server side (Vite plugin):** Read Edge's `Bookmarks` JSON to get all bookmark-bar URLs, copy Edge's `History` SQLite DB to a temp file (avoids lock while Edge is running), query visit counts for those URLs, return top 10 sorted by visits.

**Client side:** Standard api client -> hook -> widget pattern matching existing widgets.

## New Files

### 1. `plugins/edgeBookmarksApi.ts` — Vite plugin

- Register endpoint `GET /api/local/bookmarks`
- Read `{USERPROFILE}/AppData/Local/Microsoft/Edge/User Data/Default/Bookmarks` (JSON)
- Navigate to `root.roots.bookmark_bar`, recursively extract all `type: "url"` entries with folder path
- Copy `{USERPROFILE}/AppData/Local/Microsoft/Edge/User Data/Default/History` to `os.tmpdir()/edge-history-{timestamp}.db`
- Open temp copy with `better-sqlite3`
- Query: `SELECT url, visit_count FROM urls WHERE url IN (...)` filtered to bookmark URLs
- Merge visit counts onto bookmark entries, sort desc, return top 10
- Clean up temp file
- If History copy fails, return bookmarks with `visitCount: 0` (graceful degradation)

### 2. `src/api/bookmarks.ts` — API client

```ts
export interface BookmarkEntry {
  name: string;
  url: string;
  folderPath: string;
  visitCount: number;
}
export async function fetchTopBookmarks(): Promise<BookmarkEntry[]>
```

### 3. `src/hooks/useTopBookmarks.ts` — Hook

Standard `refreshKey` pattern matching `useWorktrees.ts`.

### 4. `src/widgets/Bookmarks/BookmarksWidget.tsx` — Widget

Uses `WidgetCard` with title "Most Used Bookmarks". Maps entries to `BookmarkRow`.

### 5. `src/widgets/Bookmarks/BookmarkRow.tsx` + `.css` — Row component

Each row shows:
- Bookmark name (clickable link to URL)
- Visit count badge (pill)
- Folder path + truncated URL in meta line

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Import and register `edgeBookmarksApi` plugin |
| `src/App.tsx` | Import and render `BookmarksWidget` in the left column under Sprint Items |

## Dependencies

Install `better-sqlite3` + `@types/better-sqlite3` via pnpm (native SQLite bindings, fast synchronous access).

**Fallback:** If `better-sqlite3` has native build issues, use `sql.js` (pure WASM, no native compilation needed).

## Verification

- Widget loads and shows up to 10 bookmarks from the Bookmarks bar
- Visit counts reflect actual Edge browsing history
- Bookmarks in subfolders are included with their folder path shown
- Widget gracefully shows bookmarks with 0 visits if History DB can't be copied
- Clicking a bookmark opens the URL in a new tab
- Refresh button re-reads the files (picks up new history)
