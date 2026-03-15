import { useTopBookmarks } from "../../hooks/useTopBookmarks";
import { WidgetCard } from "../WidgetCard";
import { BookmarkRow } from "./BookmarkRow";

interface BookmarksWidgetProps {
  refreshKey: number;
}

export function BookmarksWidget({ refreshKey }: BookmarksWidgetProps) {
  const { data, loading, error } = useTopBookmarks(refreshKey);

  return (
    <WidgetCard
      title="Most Used Bookmarks"
      loading={loading}
      error={error}
      onRetry={() => window.dispatchEvent(new Event("dashboard-refresh"))}
    >
      {data.length === 0 ? (
        <div className="widget-empty">No bookmarks found</div>
      ) : (
        data.map((b) => <BookmarkRow key={b.url} bookmark={b} />)
      )}
    </WidgetCard>
  );
}
