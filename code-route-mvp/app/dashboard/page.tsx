import { getDashboardMock } from "@/lib/mock";

export default function DashboardPage() {
  const data = getDashboardMock();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-bold">Dashboard élève</h1>
            <p className="mt-2 text-slate-600">
              Bloc actuel : {data.currentBlock.seriesCompleted}/2 séries terminées
            </p>
            {data.pause.active ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900">
                Pause en cours. Reprise à {data.pause.resumeAt}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">
                Tu peux lancer une nouvelle série.
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard label="Score global" value={`${data.globalScore}/100`} />
            <StatCard label="Readiness" value={data.readinessLabel} />
            <StatCard label="Dernier examen blanc" value={`${data.lastExam}/40`} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Pièges à retravailler</h2>
            <ul className="mt-4 space-y-3">
              {data.topTraps.map((trap) => (
                <li key={trap.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>{trap.name}</span>
                  <span className="font-medium">{trap.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Prochaine action</h2>
            <p className="mt-3 text-slate-600">{data.nextAction}</p>
            <button className="mt-4 w-full rounded-xl bg-brand px-4 py-3 font-medium text-white">
              Lancer une série
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Méthode</h2>
            <p className="mt-3 text-sm text-slate-600">
              2 séries puis pause de 30 minutes pour laisser le cerveau assimiler les réponses.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
