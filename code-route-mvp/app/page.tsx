import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-brand">Objectif code en 3 semaines</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Révise avec une méthode structurée, simple et adaptative.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            2 séries, pause de 30 minutes, analyse des erreurs, questions pièges et score de préparation.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/dashboard" className="rounded-xl bg-brand px-5 py-3 font-medium text-white">
              Voir le dashboard
            </Link>
            <Link href="/pricing" className="rounded-xl border border-slate-300 px-5 py-3 font-medium">
              Voir les offres
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
