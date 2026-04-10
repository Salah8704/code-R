"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const FREE = ["5 series par mois","Questions de base","Score de preparation"];
const PREMIUM = ["Series illimitees","540 questions","Algorithme adaptatif","Questions pieges","Analyse des erreurs","Score avance","Support prioritaire"];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!session) { router.push("/auth/register"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) { setError(data.error ?? "Erreur"); setLoading(false); return; }
      window.location.href = data.url;
    } catch { setError("Erreur reseau."); setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"><Link href="/" className="text-lg font-bold text-brand">Code Route</Link><Link href="/auth/register" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Commencer</Link></div></nav>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center"><h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Un tarif simple</h1><p className="mt-3 text-slate-500">Commence gratuitement. Passe premium pour tout debloquer.</p></div>
        {error && <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</div>}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-medium text-slate-500">Gratuit</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-900">0 EUR</p>
            <ul className="mt-6 space-y-3">{FREE.map(f=><li key={f} className="flex items-center gap-2.5 text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-slate-400"/>{f}</li>)}</ul>
            <Link href="/auth/register" className="mt-8 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Commencer gratuitement</Link>
          </div>
          <div className="relative rounded-2xl border-2 border-brand bg-white p-8 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Recommande</span></div>
            <p className="text-sm font-medium text-brand">Premium</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-900">19 EUR</p>
            <p className="text-slate-400">par mois sans engagement</p>
            <ul className="mt-6 space-y-3">{PREMIUM.map(f=><li key={f} className="flex items-center gap-2.5 text-sm text-slate-700"><CheckCircle className="h-4 w-4 text-brand"/>{f}</li>)}</ul>
            <button onClick={handleCheckout} disabled={loading} className="mt-8 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{loading?"Redirection...":"Passer a Premium"}</button>
          </div>
        </div>
      </div>
    </main>
  );
}