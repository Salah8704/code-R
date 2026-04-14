"use client";
import { useState, useEffect, useCallback } from "react";
export type ReadinessLevel = "pas_pret" | "presque_pret" | "pret" | "tres_pret";
export type DashboardState = "LOADING" | "PAUSE" | "IN_BLOCK" | "BLOCK_DONE" | "EXAM_READY" | "CORRECTIVE" | "IDLE";
export type DashboardData = {
  state: DashboardState; readiness: { score: number; label: ReadinessLevel; details: { examAvg: number; stability: number; trapMastery: number; speedScore: number } };
  activeBlock: { id: string; blockNumber: number; seriesCompleted: number } | null;
  pauseEndsAt: string | null; topWeaknesses: Array<{ key: string; score: number }>;
  recentSeries: Array<{ id: string; score: number | null; mode: string; endedAt: string; plannedCount: number }>;
  nextAction: { label: string; href: string; locked: boolean }; coachMessage: string; globalScore: number; totalSeries: number;
};
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { const res = await fetch("/api/dashboard"); setData(await res.json()); } catch { } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}
