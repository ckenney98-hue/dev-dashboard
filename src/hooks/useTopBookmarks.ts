import { useState, useEffect, useRef } from "react";
import { fetchTopBookmarks, type BookmarkEntry } from "../api/bookmarks";

export function useTopBookmarks(refreshKey: number) {
  const [data, setData] = useState<BookmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasFetched.current) setLoading(true);
      setError(null);
      try {
        const bookmarks = await fetchTopBookmarks();
        if (!cancelled) setData(bookmarks);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) {
          setLoading(false);
          hasFetched.current = true;
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { data, loading, error };
}
