"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, RefreshCw } from "lucide-react";

type Signals = {
  examCount: number;
  lastExamScore: number | null;
  avgExamScore: number | null;
  consistency: number;
  speed: number;
  trapMastery: number;
  topWeaknesses: { key: string; score: number }[];
  totalAttempts: number;
  correctRate: number;
};

type ReadinessData = {
  score: number;
  label: string;
  level: string;
  signals: Signals;
};

const LEVEL_CONFIG = {
  tres_pret:    { color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200", emoji: "🏆" },
  pret:         { color: "bg-brand",     text: "text-brand",     bg: "bg-brand/5",  border: "border-brand/20", emoji: "✅" },
  presque_pret: { color: "bg-orange-400",text: "text-orange-700",bg: "bg-orange-50",border: "border-orange-200",emoji: "⚡" },
  pas_pret:     { color: "bg-red-400",   text: "text-red-700",   bg: "bg-red-50",   border: "border-red-200",  emoji: "📚" },
} as const;

export default function ReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchReadiness() {
    const res = await fetch("/api/readiness");
    if (res.ok) setData(await res.json());
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchReadiness(); }, []);

  const refresh = () => { setRefreshing(true); fetchReadiness(); };

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-400">Calcul du score…</p>
    </main>
  );

  const cfg = data ? LEVEL_CONFIG[data.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.pas_pret : LEVEL_CONFIG.pas_pret;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-lg font-bold text-brand">Code Route</span>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Recalculer
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <BarChart2 className="h-7 w-7 text-brand" />
          <h1 className="text-2xl font-bold text-slate-900">Score de préparation</h1>
        </div>

        {data ? (
          <>
            {/* Score principal */}
            <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-8 text-center mb-6`}>
              <p className="text-6xl mb-2">{cfg.emoji}</p>
              <p className={`text-5xl font-extrabold text-slate-900`}>
                {data.score}<span className="text-2xl text-slate-400">/100</span>
              </p>
              <p className={`mt-2 text-xl font-semibold ${cfg.text}`}>{data.label}</p>

              {/* Barre de progression */}
              <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/60 max-w-sm mx-auto">
                <div
                  className={`h-full rounded-full ${cfg.color} transition-all duration-700`}
                  style={{ width: `${data.score}%` }}
                />
              </div>

              {/* Niveaux */}
              <div className="mt-3 flex justify-between max-w-sm mx-auto text-xs text-slate-400">
                <span>Pas prêt</span>
                <span>Presque prêt</span>
                <span>Prêt</span>
                <span>Très prêt</span>
              </div>
            </div>

            {/* Signaux détaillés */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <SignalCard
                label="Examens blancs"
                value={data.signals.examCount > 0 ? `${data.signals.avgExamScore ?? 0}/40` : "—"}
                sub={`${data.signals.examCount} examen${data.signals.examCount > 1 ? "s" : ""} passé${data.signals.examCount > 1 ? "s" : ""}`}
                pct={data.signals.avgExamScore ? (data.signals.avgExamScore / 40) * 100 : 0}
              />
              <SignalCard
                label="Maîtrise des pièges"
                value={`${data.signals.trapMastery}%`}
                sub="Score de maîtrise global"
                pct={data.signals.trapMastery}
              />
              <SignalCard
                label="Régularité"
                value={`${data.signals.consistency}%`}
                sub="Stabilité de tes scores"
                pct={data.signals.consistency}
              />
              <SignalCard
                label="Rapidité"
                value={`${data.signals.speed}%`}
                sub="Vitesse de réponse"
                pct={data.signals.speed}
              />
            </div>

            {/* Stats globales */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-4">Statistiques globales</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.signals.totalAttempts}</p>
                  <p className="text-sm text-slate-400">Réponses données</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{data.signals.correctRate}%</p>
                  <p className="text-sm text-slate-400">Taux de réussite global</p>
                </div>
              </div>
            </div>

            {/* Faiblesses */}
            {data.signals.topWeaknesses.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4">À travailler en priorité</h2>
                <div className="space-y-3">
                  {data.signals.topWeaknesses.map((w) => (
                    <div key={w.key} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-slate-700 capitalize">{w.key.replace(/_/g, " ")}</span>
                      <div className="w-24 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, (w.score / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-6 text-right">{w.score}</span>
                    </div>
                  ))}
                </div>
                <Link href="/traps" className="mt-4 inline-block text-sm text-brand hover:underline">
                  Voir les questions pièges →
                </Link>
              </div>
            )}

            {/* CTA selon niveau */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900 mb-2">Prochaine étape</h2>
              {data.level === "tres_pret" || data.level === "pret" ? (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Ton niveau est suffisant pour passer l&apos;examen. Tu peux réserver ta date !
                  </p>
                  <Link href="/booking" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
                    Voir comment réserver l&apos;examen →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Continue à faire des séries et des examens blancs. Ton score progresse à chaque session.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/quiz" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
                      Faire une série
                    </Link>
                    <Link href="/exam" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      Examen blanc
                    </Link>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-slate-400">Impossible de charger le score.</p>
        )}
      </div>
    </main>
  );
}

function SignalCard({ label, value, sub, pct }: { label: string; value: string; sub: string; pct: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
