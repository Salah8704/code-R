"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronUp, Zap } from "lucide-react";

type TrapStat = {
  trapFamily: string;
  score: number;
  totalAttempts: number;
  wrongAttempts: number;
  errorRate: number;
  questions: {
    id: string;
    prompt: string;
    difficulty: number;
    explanationShort: string;
    choices: { id: string; position: number; text: string; isCorrect: boolean }[];
  }[];
};

export default function TrapsPage() {
  const [traps, setTraps] = useState<TrapStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/traps")
      .then((r) => r.json())
      .then((d) => { setTraps(d.traps ?? []); setLoading(false); });
  }, []);

  const toggle = (key: string) => setExpanded((e) => (e === key ? null : key));

  const trapLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-400">Chargement…</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-lg font-bold text-brand">Code Route</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Questions pièges</h1>
            <p className="text-sm text-slate-500">Les pièges que tu rates le plus souvent</p>
          </div>
        </div>

        {traps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Zap className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <p className="text-slate-500">Aucun piège détecté pour l&apos;instant.</p>
            <p className="mt-1 text-sm text-slate-400">
              Fais quelques séries et reviens ici voir tes points faibles.
            </p>
            <Link href="/quiz" className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              Commencer une série
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {traps.map((trap, i) => (
              <div key={trap.trapFamily} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Header */}
                <button
                  onClick={() => toggle(trap.trapFamily)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{trapLabel(trap.trapFamily)}</p>
                    <p className="text-sm text-slate-500">
                      {trap.errorRate}% d&apos;erreurs · {trap.wrongAttempts}/{trap.totalAttempts} réponses incorrectes
                    </p>
                  </div>
                  {/* Error rate bar */}
                  <div className="hidden sm:flex w-24 flex-col items-end gap-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          trap.errorRate > 60 ? "bg-red-400" :
                          trap.errorRate > 30 ? "bg-orange-400" : "bg-yellow-400"
                        }`}
                        style={{ width: `${trap.errorRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{trap.errorRate}%</span>
                  </div>
                  {expanded === trap.trapFamily
                    ? <ChevronUp className="h-4 w-4 text-slate-400" />
                    : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {/* Expanded content */}
                {expanded === trap.trapFamily && (
                  <div className="border-t border-slate-100 px-6 py-4">
                    <div className="mb-4 rounded-xl bg-orange-50 border border-orange-100 p-4">
                      <p className="text-sm font-medium text-orange-800">
                        💡 Pourquoi tu te trompes souvent ici ?
                      </p>
                      <p className="mt-1 text-sm text-orange-700">
                        Ce piège repose sur une règle souvent oubliée ou mal mémorisée.
                        Révise les questions ci-dessous et concentre-toi sur les explications.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {trap.questions.slice(0, 3).map((q) => (
                        <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-800">{q.prompt}</p>
                          <div className="mt-2 space-y-1">
                            {q.choices.map((c) => (
                              <p
                                key={c.id}
                                className={`text-xs ${c.isCorrect ? "text-green-700 font-medium" : "text-slate-400"}`}
                              >
                                {c.isCorrect ? "✓" : "○"} {c.text}
                              </p>
                            ))}
                          </div>
                          <p className="mt-2 text-xs italic text-slate-500">{q.explanationShort}</p>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/quiz"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Faire une série sur ce piège
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
