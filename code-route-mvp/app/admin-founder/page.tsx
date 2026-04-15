"use client";
import { useEffect, useState } from "react";
import { BarChart2, Users, Brain, TrendingUp, AlertTriangle, RefreshCw, Database } from "lucide-react";

type Stats = {
  totalUsers: number;
  activeToday: number;
  totalSeries: number;
  totalAttempts: number;
  avgScore: number;
  readyUsers: number;
};

export default function AdminFounderPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "algo" | "content" | "deploy" | "logs">("overview");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: BarChart2 },
    { id: "users" as const, label: "Utilisateurs", icon: Users },
    { id: "algo" as const, label: "Algorithme", icon: Brain },
    { id: "content" as const, label: "Contenu", icon: Database },
    { id: "deploy" as const, label: "Deploiement", icon: TrendingUp },
    { id: "logs" as const, label: "Logs", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-sm font-bold">F</div>
            <div>
              <h1 className="font-bold text-white">Code Route - Admin Fondateur</h1>
              <p className="text-xs text-slate-400">Tableau de bord interne</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Production live</span>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === id ? "bg-brand text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : tab === "overview" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Utilisateurs totaux", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
                { label: "Actifs aujourd'hui", value: stats?.activeToday ?? 0, icon: TrendingUp, color: "text-green-400" },
                { label: "Series completees", value: stats?.totalSeries ?? 0, icon: Brain, color: "text-purple-400" },
                { label: "Reponses totales", value: stats?.totalAttempts ?? 0, icon: Database, color: "text-yellow-400" },
                { label: "Score moyen", value: `${stats?.avgScore ?? 0}%`, icon: BarChart2, color: "text-brand" },
                { label: "Prets pour l'examen", value: stats?.readyUsers ?? 0, icon: AlertTriangle, color: "text-orange-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                  <div className={`flex items-center gap-2 mb-3 ${color}`}>
                    <Icon className="h-4 w-4" />
                    <p className="text-xs font-medium text-slate-400">{label}</p>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <h2 className="font-semibold text-white mb-4">Status systeme</h2>
              <div className="space-y-3">
                {["API Next.js", "Base de donnees PostgreSQL", "Algorithme pedagogique", "Systeme de pause", "Calcul readiness"].map(n => (
                  <div key={n} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{n}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-xs text-green-400">operational</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "algo" ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Algorithme pedagogique adaptatif</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Seuil lenteur", value: "15s" },
                { label: "Series par bloc", value: "2" },
                { label: "Pause obligatoire", value: "30 min" },
                { label: "Analyse tous les", value: "4 series" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-slate-800 p-4">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-xl font-bold text-brand">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Formule delta (faiblesses)</h3>
              <div className="space-y-1.5 text-sm text-slate-300">
                <p>Mauvaise reponse: <span className="text-red-400">+3 x difficulte</span></p>
                <p>Bonne reponse: <span className="text-green-400">-1 x difficulte</span></p>
                <p>Lente (&gt;15s): <span className="text-yellow-400">+1</span></p>
                <p>Erreur repetee: <span className="text-orange-400">+1.5</span></p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <h3 className="text-sm font-medium text-white mb-3">Score Readiness (0-100)</h3>
              <div className="space-y-1.5 text-sm text-slate-300">
                <p>Examens blancs: <span className="text-brand">x 0.40</span></p>
                <p>Stabilite: <span className="text-brand">x 0.25</span></p>
                <p>Maitrise pieges: <span className="text-brand">x 0.25</span></p>
                <p>Vitesse: <span className="text-brand">x 0.10</span></p>
              </div>
            </div>
          </div>
        ) : tab === "deploy" ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Deploiement et Infrastructure</h2>
            <div className="space-y-3">
              {[
                { label: "Hebergeur", value: "Hostinger (drivecode.fr)" },
                { label: "Repository", value: "github.com/Salah8704/code-R" },
                { label: "Branche", value: "main" },
                { label: "Framework", value: "Next.js 15 App Router" },
                { label: "Base de donnees", value: "PostgreSQL + Prisma" },
                { label: "Auth", value: "NextAuth v4" },
                { label: "Node", value: "22.x" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-green-900/30 border border-green-800 p-4">
              <p className="text-sm text-green-400">CI/CD automatique - chaque push sur main declenche un rebuild Hostinger</p>
            </div>
          </div>
        ) : tab === "users" ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Gestion utilisateurs</h2>
              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3 w-3" />Actualiser
              </button>
            </div>
            <p className="text-sm text-slate-400">Pour promouvoir un utilisateur en admin :</p>
            <div className="mt-3 rounded-lg bg-slate-800 p-4 font-mono text-xs text-green-400">
              UPDATE "User" SET role = 'admin' WHERE email = 'email@example.com';
            </div>
            <p className="mt-4 text-xs text-slate-500">Executer en SQL sur la base PostgreSQL Hostinger</p>
          </div>
        ) : tab === "content" ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Gestion du contenu</h2>
            <div className="rounded-lg bg-slate-800 p-4 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-brand">// Modeles Prisma</p>
              <p>Question - 20 questions par serie</p>
              <p>WeaknessScore - faiblesses par userId+key</p>
              <p>Series - historique des revisions</p>
              <p>StudyBlock - groupes de 2 series</p>
              <p>BlockPause - pauses de 30 min</p>
              <p>ReadinessSnapshot - score 0-100</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h2 className="font-semibold text-white mb-4">Logs systeme</h2>
            <p className="text-sm text-slate-400">Logs disponibles via Hostinger Dashboard - Logs d'acces</p>
          </div>
        )}
      </main>
    </div>
  );
}
