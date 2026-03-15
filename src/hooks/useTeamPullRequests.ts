import { useState, useEffect, useRef } from "react";
import { fetchTeamReviewPullRequests } from "../api/pullRequests";
import { enrichPullRequests, type PRViewModel } from "./prUtils";

export function useTeamPullRequests(refreshKey: number) {
  const [data, setData] = useState<PRViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasFetched.current) setLoading(true);
      setError(null);
      try {
        const prs = await fetchTeamReviewPullRequests();
        const enriched = await enrichPullRequests(prs);
        if (!cancelled) setData(enriched);
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
