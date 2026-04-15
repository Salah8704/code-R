"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Clock, Target, Shield } from "lucide-react";

type ReadinessData = {
  score: number;
  label: "pas_pret" | "presque_pret" | "pret" | "tres_pret";
  details: { examAvg: number; stability: number; trapMastery: number; speedScore: number };
};

const LEVEL_CONFIG = {
  pas_pret: { label: "Pas encore pret", emoji: "📚", color: "text-red-600", bg: "bg-red-50", border: "border-red-300", ring: "stroke-red-400", narrative: "Tu en es au debut de ta progression. Le systeme a identifie tes lacunes et va les travailler methodiquement.", threshold: 50, nextStep: "Continue les series quotidiennes. Le score montera rapidement avec la regularite." },
  presque_pret: { label: "Presque pret", emoji: "⚡", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300", ring: "stroke-orange-400", narrative: "Tu as les bases. Quelques themes restent fragiles mais la dynamique est bonne. Reste concentre sur les series correctives.", threshold: 70, nextStep: "Cible tes pieges principaux lors des 2-3 prochains blocs." },
  pret: { label: "Pret", emoji: "✅", color: "text-green-600", bg: "bg-green-50", border: "border-green-300", ring: "stroke-green-500", narrative: "Tu as atteint le niveau examen. Tu reussis regulierement tes series et tu maitrises les pieges essentiels.", threshold: 85, nextStep: "Fais 1-2 examens blancs pour confirmer. Si tu depasses 85% en examen blanc, tu es pret." },
  tres_pret: { label: "Tres pret", emoji: "🏆", color: "text-brand", bg: "bg-teal-50", border: "border-teal-300", ring: "stroke-brand", narrative: "Niveau excellent. Tes scores sont stables, tu reponds rapidement et tu maitrises les pieges. Tu peux te presenter avec confiance.", threshold: 100, nextStep: "Reserve ton examen. Tu es objectivement pret." },
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

  const cfg = data ? LEVEL_CONFIG[data.label] : LEVEL_CONFIG.pas_pret;
  const score = data?.score ?? 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-2xl flex items-center gap-3 px-6 py-3">
          <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900">Score de preparation</h1>
            <p className="text-xs text-slate-400">Mis a jour apres chaque serie</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-5">
        <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative inline-flex items-center justify-center w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9"/>
                  <circle cx="60" cy="60" r={r} fill="none" strokeWidth="9"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    className={cfg.ring}
                    style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-4xl font-bold text-slate-900 font-mono">{score}</div>
                  <div className="text-sm text-slate-400">/100</div>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-2xl font-bold mb-1">{cfg.emoji} {cfg.label}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{cfg.narrative}</p>
                <div className={`inline-block rounded-xl border px-4 py-2.5 text-sm font-medium ${cfg.border} bg-white`}>
                  <p className="text-xs text-slate-400 mb-0.5">Prochaine etape</p>
                  <p className="text-slate-700">{cfg.nextStep}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Comment ce score est calcule</p>
          <div className="grid grid-cols-2 gap-3">
            <DetailBar label="Examens blancs" value={data?.details.examAvg ?? 0} icon={Target} desc="Moyenne de tes derniers examens blancs (40% du score)" />
            <DetailBar label="Stabilite" value={data?.details.stability ?? 0} icon={Shield} desc="Regularite de tes resultats (25% du score)" />
            <DetailBar label="Maitrise des pieges" value={data?.details.trapMastery ?? 0} icon={TrendingUp} desc="Niveau sur les points problematiques (25% du score)" />
            <DetailBar label="Vitesse de reponse" value={data?.details.speedScore ?? 0} icon={Clock} desc="Rapidite moyenne par question (10% du score)" />
          </div>
        </div>

        {history.length > 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-700 mb-4">Evolution du score</p>
            <div className="flex items-end gap-2 h-24">
              {history.slice(-10).map((snap, i, arr) => {
                const pct = snap.score / 100;
                const isLatest = i === arr.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative" style={{ height: "80px" }}>
                      <div className={`absolute bottom-0 w-full rounded-t-md transition-all ${isLatest ? "bg-brand" : "bg-slate-200"}`} style={{ height: `${pct * 80}px` }} />
                    </div>
                    {isLatest && <span className="text-xs font-mono text-brand font-bold">{snap.score}</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">{history.length} mesure{history.length > 1 ? "s" : ""} enregistree{history.length > 1 ? "s" : ""}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(data?.label === "pret" || data?.label === "tres_pret") ? (
            <>
              <Link href="/exam" className="flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 text-sm font-bold hover:bg-brand-dark transition-all">
                Faire un examen blanc
              </Link>
              <Link href="/booking" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Reserver l'examen officiel
              </Link>
            </>
          ) : (
            <Link href="/quiz" className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3.5 text-sm font-bold hover:bg-slate-800 transition-all">
              Faire une serie pour progresser
            </Link>
          )}
          <Link href="/traps" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Voir mes pieges detailles
          </Link>
        </div>
      </main>
    </div>
  );
}
