"use client";
// app/pause/page.tsx — Expérience de pause pédagogique

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, BookOpen, ChevronRight } from "lucide-react";

const TIPS = [
  { icon: "🚦", title: "Priorité à droite", content: "En l'absence de panneau, le véhicule venant de ta droite est prioritaire, même sur une voie plus petite." },
  { icon: "🔵", title: "Ligne continue", content: "Une ligne continue sur ta voie interdit absolument de la franchir pour dépasser. Même si personne ne vient en face." },
  { icon: "⚠️", title: "Feu orange", content: "Le feu orange ne signifie pas 'accélère avant le rouge'. Il signifie 'arrête-toi si tu peux le faire en sécurité'." },
  { icon: "🍺", title: "Alcoolémie novice", content: "Pour un conducteur en période probatoire : 0.2 g/L maximum (contre 0.5 g/L pour les conducteurs confirmés)." },
  { icon: "📏", title: "Distance de sécurité", content: "À 90 km/h, la distance de sécurité minimale est de 75 mètres — soit environ 3 secondes de réaction." },
  { icon: "🔦", title: "Feux en ville", content: "Feux de position le soir en ville ? Non. Il faut les feux de croisement. Les feux de position seuls sont insuffisants." },
];

export default function PausePage() {
  const searchParams = useSearchParams();
  const rawUntil = searchParams.get("until");
  const pauseEndsAt = rawUntil ? new Date(decodeURIComponent(rawUntil)) : null;

  const [remaining, setRemaining] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pauseEndsAt) return;
    const total = 30 * 60 * 1000;
    const tick = () => {
      const diff = pauseEndsAt.getTime() - Date.now();
      if (diff <= 0) { setIsDone(true); setRemaining("00:00"); setProgress(100); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      setProgress(Math.min(100, Math.max(0, ((total - diff) / total) * 100)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pauseEndsAt]);

  const tip = TIPS[tipIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-xl flex items-center justify-between">
          <span className="font-bold text-brand text-lg">Code Route</span>
          <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-medium">
            Pause active
          </span>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-xl w-full px-6 py-10 space-y-6">
        {!isDone ? (
          <div className="rounded-2xl bg-white border-2 border-orange-200 overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-orange-800 font-semibold mb-1">
                <Brain className="h-5 w-5" />
                Pause de consolidation
              </div>
              <p className="text-xs text-orange-600">Ton cerveau est en train d'enregistrer les informations</p>
            </div>
            <div className="px-6 py-8 text-center space-y-4">
              <div className="font-mono text-6xl font-bold text-slate-800 tabular-nums tracking-tight">
                {remaining}
              </div>
              {pauseEndsAt && (
                <p className="text-sm text-slate-500">
                  Reprise prevue a{" "}
                  <strong className="text-slate-800">
                    {pauseEndsAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </strong>
                </p>
              )}
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-400">{Math.round(progress)}% de la pause ecoulee</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border-2 border-green-300 p-8 text-center space-y-4">
            <p className="text-xl font-bold text-green-700">Pause terminee !</p>
            <p className="text-sm text-slate-500">Ton cerveau a eu le temps de consolider. Tu es pret a continuer.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-6 py-3 text-sm font-bold mt-2">
              Reprendre les revisions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-brand" />
            <p className="font-semibold text-slate-800 text-sm">Pourquoi cette pause est obligatoire ?</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Apres deux series intensives, ton cerveau entre dans une phase de consolidation memorielle.
            Forcer une troisieme serie immediatement deteriore la retention. Cette contrainte fait partie de la methode.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Le saviez-vous ?</p>
            </div>
            <button onClick={() => setTipIdx(i => (i + 1) % TIPS.length)} className="text-xs text-brand hover:underline">
              Suivant
            </button>
          </div>
          <div className="px-5 py-4">
            <p className="text-2xl mb-2">{tip.icon}</p>
            <p className="font-semibold text-slate-800 mb-1.5">{tip.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{tip.content}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Ce que tu peux faire maintenant</p>
          {[
            { href: "/traps", icon: "⚠️", label: "Reviser mes pieges", desc: "Consulter tes erreurs frequentes" },
            { href: "/readiness", icon: "📊", label: "Voir ma progression", desc: "Score et niveau de preparation" },
          ].map(({ href, icon, label, desc }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-white transition-colors">
              <span className="text-xl">{icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
