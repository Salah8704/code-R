import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Réserver son examen du code | Code Route",
  description: "Tu es prêt ? Voici comment réserver ton examen du code de la route auprès d'un opérateur agréé.",
};

const OPERATORS = [
  {
    name: "En Voiture Simone",
    description: "Réservation en ligne rapide, centres partout en France.",
    url: "https://www.envoituresimone.com",
  },
  {
    name: "Permisecole",
    description: "Accompagnement complet et réservation simplifiée.",
    url: "https://www.permisecole.com",
  },
  {
    name: "iCar",
    description: "Réseau national d'auto-écoles avec réservation en ligne.",
    url: "https://www.icar.fr",
  },
];

const STEPS = [
  "Vérifie que ton score de préparation est à 75+ (niveau Prêt)",
  "Choisis un opérateur agréé parmi la liste ci-dessous",
  "Crée ton compte sur le site de l'opérateur",
  "Sélectionne un centre d'examen proche de chez toi",
  "Réserve une date disponible",
  "Le jour J : présente-toi 15 minutes avant l'heure",
];

export default function BookingPage() {
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
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 mb-4">
            <CheckCircle className="h-4 w-4" />
            Tu sembles prêt pour l&apos;examen !
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Réserver l&apos;examen du code</h1>
          <p className="mt-2 text-slate-500">
            L&apos;examen du code de la route se passe auprès d&apos;opérateurs agréés par l&apos;État.
            Voici les étapes et les liens pour réserver.
          </p>
        </div>

        {/* Étapes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Comment ça se passe ?</h2>
          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Infos pratiques */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Infos pratiques</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Durée de l'examen", value: "30 minutes" },
              { label: "Nombre de questions", value: "40 questions" },
              { label: "Seuil de réussite", value: "35/40 (5 erreurs max)" },
              { label: "Format", value: "QCM sur tablette" },
              { label: "Pièce d'identité", value: "Obligatoire" },
              { label: "Tarif moyen", value: "30 € environ" },
            ].map((info) => (
              <div key={info.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400">{info.label}</p>
                <p className="mt-0.5 font-semibold text-slate-900">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Opérateurs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Opérateurs agréés</h2>
          <div className="space-y-3">
            {OPERATORS.map((op) => (
              <a
                key={op.name}
                href={op.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-brand hover:bg-brand/5 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-brand transition-colors">{op.name}</p>
                  <p className="text-sm text-slate-500">{op.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/readiness" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Mon score de préparation
          </Link>
          <Link href="/exam" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
            Dernier examen blanc
          </Link>
        </div>
      </div>
    </main>
  );
}
