import { useState, useEffect, useCallback } from "react";

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useAutoRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { refreshKey, lastRefreshed, refresh };
}
