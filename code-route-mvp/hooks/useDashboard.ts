// hooks/useDashboard.ts
"use client";
import { useState, useEffect, useCallback } from "react";

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { const res = await fetch("/api/dashboard"); setData(await res.json()); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}
