"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, RefreshCw } from "lucide-react";
type Signals={examCount:number;lastExamScore:number|null;avgExamScore:number|null;consistency:number;speed:number;trapMastery:number;topWeaknesses:{key:string;score:number}[];totalAttempts:number;correctRate:number};
type ReadinessData={score:number;label:string;level:string;signals:Signals};
const CFG={tres_pret:{color:"bg-green-500",text:"text-green-700",bg:"bg-green-50",border:"border-green-200",emoji:"🏆"},pret:{color:"bg-brand",text:"text-brand",bg:"bg-brand/5",border:"border-brand/20",emoji:"✅"},presque_pret:{color:"bg-orange-400",text:"text-orange-700",bg:"bg-orange-50",border:"border-orange-200",emoji:"⚡"},pas_pret:{color:"bg-red-400",text:"text-red-700",bg:"bg-red-50",border:"border-red-200",emoji:"📚"}} as const;
export default function ReadinessPage(){
  const [data,setData]=useState<ReadinessData|null>(null);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  async function fetch_data(){const res=await fetch("/api/readiness");if(res.ok)setData(await res.json());setLoading(false);setRefreshing(false);}
  useEffect(()=>{fetch_data();},[]);
  const refresh=()=>{setRefreshing(true);fetch_data();};
  if(loading)return<div className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-slate-400">Calcul du score...</p></div>;
  const cfg=data?CFG[data.level as keyof typeof CFG]??CFG.pas_pret:CFG.pas_pret;
  return(
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4"><Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4"/>Dashboard</Link><span className="text-lg font-bold text-brand">Code Route</span><button onClick={refresh} disabled={refreshing} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700"><RefreshCw className={"h-4 w-4"+(refreshing?" animate-spin":"")}/> Recalculer</button></div></header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3"><BarChart2 className="h-7 w-7 text-brand"/><h1 className="text-2xl font-bold text-slate-900">Score de preparation</h1></div>
        {data&&(<>
          <div className={"rounded-2xl border p-8 text-center mb-6 "+cfg.border+" "+cfg.bg}>
            <p className="text-6xl mb-2">{cfg.emoji}</p>
            <p className="text-5xl font-extrabold text-slate-900">{data.score}<span className="text-2xl text-slate-400">/100</span></p>
            <p className={"mt-2 text-xl font-semibold "+cfg.text}>{data.label}</p>
            <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/60 max-w-sm mx-auto"><div className={"h-full rounded-full "+cfg.color} style={{width:data.score+"%"}}/></div>
            <div className="mt-3 flex justify-between max-w-sm mx-auto text-xs text-slate-400"><span>Pas pret</span><span>Presque pret</span><span>Pret</span><span>Tres pret</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {[{label:"Examens blancs",value:data.signals.examCount>0?(data.signals.avgExamScore??0)+"/40":"—",sub:data.signals.examCount+" examen(s)",pct:data.signals.avgExamScore?(data.signals.avgExamScore/40)*100:0},
              {label:"Maitrise pieges",value:data.signals.trapMastery+"%",sub:"Score global",pct:data.signals.trapMastery},
              {label:"Regularite",value:data.signals.consistency+"%",sub:"Stabilite scores",pct:data.signals.consistency},
              {label:"Rapidite",value:data.signals.speed+"%",sub:"Vitesse reponse",pct:data.signals.speed}].map(s=>(
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-400">{s.label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-400">{s.sub}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{width:s.pct+"%"}}/></div>
              </div>))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Prochaine etape</h2>
            {(data.level==="tres_pret"||data.level==="pret")?(<><p className="text-sm text-slate-600 mb-4">Ton niveau est suffisant pour passer l&apos;examen !</p><Link href="/booking" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Voir comment reserver</Link></>):(<><p className="text-sm text-slate-600 mb-4">Continue les series et les examens blancs.</p><div className="flex gap-3"><Link href="/quiz" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Faire une serie</Link><Link href="/exam" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Examen blanc</Link></div></>)}
          </div>
        </>)}
      </div>
    </main>
  );
}