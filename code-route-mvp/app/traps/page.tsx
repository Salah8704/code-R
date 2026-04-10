"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
type TrapStat={trapFamily:string;score:number;totalAttempts:number;wrongAttempts:number;errorRate:number;questions:{id:string;prompt:string;difficulty:number;explanationShort:string;choices:{id:string;position:number;text:string;isCorrect:boolean}[]}[]};
export default function TrapsPage(){
  const [traps,setTraps]=useState<TrapStat[]>([]);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState<string|null>(null);
  useEffect(()=>{fetch("/api/traps").then(r=>r.json()).then(d=>{setTraps(d.traps??[]);setLoading(false);});},[]);
  if(loading)return<div className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-slate-400">Chargement...</p></div>;
  return(
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4"><Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4"/>Dashboard</Link><span className="text-lg font-bold text-brand">Code Route</span></div></header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3"><AlertTriangle className="h-7 w-7 text-orange-500"/><div><h1 className="text-2xl font-bold text-slate-900">Questions pieges</h1><p className="text-sm text-slate-500">Les pieges que tu rates le plus souvent</p></div></div>
        {traps.length===0?(<div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center"><p className="text-slate-500">Aucun piege detecte.</p><Link href="/quiz" className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Commencer une serie</Link></div>):(
          <div className="space-y-4">{traps.map((trap,i)=>(
            <div key={trap.trapFamily} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button onClick={()=>setExpanded(e=>e===trap.trapFamily?null:trap.trapFamily)} className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">{i+1}</span>
                <div className="flex-1"><p className="font-semibold text-slate-900">{trap.trapFamily.replace(/_/g," ")}</p><p className="text-sm text-slate-500">{trap.errorRate}% d&apos;erreurs sur {trap.totalAttempts} tentatives</p></div>
                <div className="w-20 flex flex-col items-end gap-1"><div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className={trap.errorRate>60?"h-full rounded-full bg-red-400":trap.errorRate>30?"h-full rounded-full bg-orange-400":"h-full rounded-full bg-yellow-400"} style={{width:trap.errorRate+"%"}}/></div><span className="text-xs text-slate-400">{trap.errorRate}%</span></div>
                {expanded===trap.trapFamily?<ChevronUp className="h-4 w-4 text-slate-400"/>:<ChevronDown className="h-4 w-4 text-slate-400"/>}
              </button>
              {expanded===trap.trapFamily&&(<div className="border-t border-slate-100 px-6 py-4">
                <div className="mb-4 rounded-xl bg-orange-50 border border-orange-100 p-4"><p className="text-sm font-medium text-orange-800">Pourquoi tu te trompes ici ?</p><p className="mt-1 text-sm text-orange-700">Ce piege repose sur une regle souvent oubliee. Revise les questions ci-dessous.</p></div>
                <div className="space-y-3">{trap.questions.slice(0,3).map(q=><div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-medium text-slate-800">{q.prompt}</p><div className="mt-2 space-y-1">{q.choices.map(c=><p key={c.id} className={c.isCorrect?"text-xs text-green-700 font-medium":"text-xs text-slate-400"}>{c.isCorrect?"✓":"○"} {c.text}</p>)}</div><p className="mt-2 text-xs italic text-slate-500">{q.explanationShort}</p></div>)}</div>
                <Link href="/quiz" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Faire une serie sur ce piege</Link>
              </div>)}
            </div>
          ))}</div>
        )}
      </div>
    </main>
  );
}