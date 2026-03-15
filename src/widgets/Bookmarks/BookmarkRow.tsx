import type { BookmarkEntry } from "../../api/bookmarks";
import "./BookmarkRow.css";

interface BookmarkRowProps {
  bookmark: BookmarkEntry;
}

function truncateUrl(url: string, maxLength = 50): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > maxLength
      ? display.slice(0, maxLength) + "..."
      : display;
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength) + "..." : url;
  }
}

export function BookmarkRow({ bookmark }: BookmarkRowProps) {
  return (
    <div className="bm-row">
      <div className="bm-main-col">
        <div className="bm-title-line">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bm-link"
            title={bookmark.url}
          >
            {bookmark.name}
          </a>
          <span className="bm-visit-count">{bookmark.visitCount} visits</span>
        </div>
        <div className="bm-meta">
          {bookmark.folderPath && (
            <span className="bm-folder">{bookmark.folderPath}</span>
          )}
          <span className="bm-url">{truncateUrl(bookmark.url)}</span>
        </div>
      </div>
    </div>
  );
}
