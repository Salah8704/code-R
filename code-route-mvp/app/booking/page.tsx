import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";
export const metadata = { title: "Reserver son examen du code | Code Route", description: "Tu es pret ? Voici comment reserver ton examen du code de la route." };
const OPERATORS = [
  { name:"En Voiture Simone", description:"Reservation en ligne rapide, centres partout en France.", url:"https://www.envoituresimone.com" },
  { name:"Permisecole", description:"Accompagnement complet et reservation simplifiee.", url:"https://www.permisecole.com" },
  { name:"iCar", description:"Reseau national d'auto-ecoles avec reservation en ligne.", url:"https://www.icar.fr" },
];
const STEPS = ["Verifie que ton score de preparation est a 75+","Choisis un operateur agree","Cree ton compte sur le site de l'operateur","Selecte un centre d'examen proche","Reserve une date disponible","Le jour J : presente-toi 15 minutes avant"];
export default function BookingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4"><Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4"/>Dashboard</Link><span className="text-lg font-bold text-brand">Code Route</span></div></header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Reserver l&apos;examen du code</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Comment ca se passe ?</h2>
          <ol className="space-y-3">{STEPS.map((step,i)=><li key={i} className="flex items-start gap-3"><span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">{i+1}</span><span className="text-sm text-slate-700">{step}</span></li>)}</ol>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Infos pratiques</h2>
          <div className="grid gap-4 sm:grid-cols-2">{[{label:"Duree",value:"30 minutes"},{label:"Questions",value:"40 questions"},{label:"Seuil",value:"35/40"},{label:"Format",value:"QCM tablette"},{label:"Piece d'identite",value:"Obligatoire"},{label:"Tarif",value:"~30 EUR"}].map(info=><div key={info.label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{info.label}</p><p className="mt-0.5 font-semibold text-slate-900">{info.value}</p></div>)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Operateurs agrees</h2>
          <div className="space-y-3">{OPERATORS.map(op=><a key={op.name} href={op.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-brand hover:bg-brand/5 transition-colors group"><div><p className="font-semibold text-slate-900 group-hover:text-brand">{op.name}</p><p className="text-sm text-slate-500">{op.description}</p></div><ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand flex-shrink-0"/></a>)}</div>
        </div>
      </div>
    </main>
  );
}