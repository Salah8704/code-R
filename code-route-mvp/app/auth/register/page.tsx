"use client";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, password }) });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); setLoading(false); return; }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-bold text-brand">← Code Route</Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Creer un compte</h1>
        {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" placeholder="8 caracteres minimum" /></div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {loading ? "Creation..." : "Creer mon compte"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Deja un compte ? <Link href="/auth/login" className="font-medium text-brand hover:underline">Se connecter</Link></p>
      </div>
    </main>
  );
}