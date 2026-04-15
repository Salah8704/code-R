"use client";
// app/readiness/page.tsx — Score de préparation narratif

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Clock, Target, Shield } from "lucide-react";

type ReadinessData = {
  score: number;
  label: "pas_pret" | "presque_pret" | "pret" | "tres_pret";
  details: { examAvg: number; stability: number; trapMastery: number; speedScore: number };
};

const LEVEL_CONFIG = {
  pas_pret: {
    label: "Pas encore prêt",
    emoji: "📚",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-300",
    ring: "stroke-red-400",
    narrative: "Tu en es au début de ta progression. C'est normal — tout le monde passe par là. Le système a identifié tes lacunes et va les travailler méthodiquement.",
    threshold: 50,
    nextStep: "Continue les séries quotidiennes. Le score montera rapidement avec la régularité.",
  },
  presque_pret: {
    label: "Presque prêt",
    emoji: "⚡",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-300",
    ring: "stroke-orange-400",
    narrative: "Tu as les bases. Quelques thèmes restent fragiles mais la dynamique est bonne. Reste concentré sur les séries correctives.",
    threshold: 70,
    nextStep: "Cible tes pièges principaux lors des 2-3 prochains blocs.",
  },
  pret: {
    label: "Prêt",
    emoji: "✅",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-300",
    ring: "stroke-green-500",
    narrative: "Tu as atteint le niveau examen. Tu réussis régulièrement tes séries et tu maîtrises les pièges essentiels.",
    threshold: 85,
    nextStep: "Fais 1-2 examens blancs pour confirmer. Si tu dépasses 85% en examen blanc, tu es prêt.",
  },
  tres_pret: {
    label: "Très prêt",
    emoji: "🏆",
    color: "text-brand",
    bg: "bg-teal-50",
    border: "border-teal-300",
    ring: "stroke-brand",
    narrative: "Niveau excellent. Tes scores sont stables, tu réponds rapidement et tu maîtrises les pièges. Tu peux te présenter avec confiance.",
    threshold: 100,
    nextStep: "Réserve ton examen. Tu es objectivement prêt.",
  },
};

function DetailBar({ label, value, icon: Icon, desc }: { label: string; value: number; icon: any; desc: string }) {
  const pct = Math.round(value);
  const color = pct >= 70 ? "bg-green-400" : pct >= 45 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <span className={`ml-auto font-mono text-sm font-bold ${pct >= 70 ? "text-green-600" : pct >= 45 ? "text-orange-600" : "text-red-600"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-2">{desc}</p>
    </div>
  );
}

export default function ReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ score: number; computedAt: string }>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/readiness").then(r => r.json()),
      fetch("/api/readiness/history").then(r => r.json()).catch(() => ({ snapshots: [] })),
    ]).then(([rd, hist]) => {
      setData(rd);
      setHistory(hist.snapshots ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Clock className="h-8 w-8 animate-spin text-brand" />
    </div>
  );
