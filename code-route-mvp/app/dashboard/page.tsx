"use client";
import{useEffect,useState}from"react";
import{useSession,signOut}from"next-auth/react";
import Link from"next/link";
import{BarChart2,Clock,Zap,AlertTriangle,LogOut,Play,Trophy,BookOpen,Target,ChevronRight}from"lucide-react";
type D={currentBlock:{id:string;blockNumber:number;seriesCompleted:number}|null;pause:{active:boolean;resumeAt?:string};globalScore:number;readinessScore:number;readinessLabel:string;totalSeries:number;topTraps:{name:string;score:number}[];nextAction:string};
function PC({resumeAt}:{resumeAt:string}){const[r,setR]=useState("");useEffect(()=>{const t=()=>{const d=new Date(resumeAt).getTime()-Date.now();if(d<=0){setR("Terminee!");return;}setR(Math.floor(d/60000)+":"+(Math.floor(d%60000/1000)).toString().padStart(2,"0"));};t();const id=setInterval(t,1000);return()=>clearInterval(id);},[resumeAt]);return<span className="font-mono text-xl font-bold text-orange-600">{r}</span>;}
export default function DashboardPage(){
  const{data:session}=useSession();
  const[data,setData]=useState<D|null>(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/dashboard").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading)return<div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-slate-400">Chargement...</div></div>;
  const canStart=!data?.pause.active;
  return(
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-bold text-brand">Code Route</Link>
          <nav className="hidden md:flex items-center gap-1">
            {[{href:"/quiz",label:"Series"},{href:"/exam",label:"Examen"},{href:"/traps",label:"Pieges"},{href:"/readiness",label:"Score"},{href:"/booking",label:"Reserver"}].map(l=><Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">{l.label}</Link>)}
          </nav>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-400 sm:block">{session?.user.email}</span><button onClick={()=>signOut({callbackUrl:"/"})} className="text-slate-400 hover:text-slate-700"><LogOut className="h-4 w-4"/></button></div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {data?.pause.active&&data.pause.resumeAt&&(<div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5"><div className="flex flex-col sm:flex-row sm:items-center gap-4"><Clock className="h-7 w-7 text-orange-400 flex-shrink-0"/><div className="flex-1"><p className="font-semibold text-orange-800">Pause en cours — reprend dans <PC resumeAt={data.pause.resumeAt}/></p><p className="text-sm text-orange-600 mt-0.5">La consolidation memorielle se produit pendant le repos.</p></div><div className="flex gap-2"><Link href="/traps" className="rounded-lg border border-orange-300 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100">Mes pieges</Link><Link href="/readiness" className="rounded-lg border border-orange-300 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100">Mon score</Link></div></div></div>)}
        {data&&(<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-brand px-6 py-5 text-white"><div><p className="text-sm opacity-70">Prochaine action</p><p className="mt-0.5 font-semibold">{data.nextAction}</p></div>{canStart?<Link href="/quiz" className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand whitespace-nowrap"><Play className="h-4 w-4"/>Commencer</Link>:<span className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm text-white/60"><Clock className="h-4 w-4"/>En pause</span>}</div>)}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[{icon:<Target className="h-5 w-5"/>,label:"Preparation",value:data?data.readinessScore+"/100":"—",sub:data?.readinessLabel,href:"/readiness"},{icon:<Zap className="h-5 w-5"/>,label:"Bloc actuel",value:data?.currentBlock?"Bloc "+data.currentBlock.blockNumber:"—",sub:data?.currentBlock?data.currentBlock.seriesCompleted+"/2 series":"Aucun"},{icon:<BarChart2 className="h-5 w-5"/>,label:"Score moyen",value:data?data.globalScore+"/40":"—",sub:"toutes series"},{icon:<Clock className="h-5 w-5"/>,label:"Series faites",value:data?data.totalSeries+"":"0",sub:"au total"}].map(s=>s.href?<Link key={s.label} href={s.href} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand transition-colors"><div className="flex items-center gap-2 text-slate-400">{s.icon}<span className="text-xs">{s.label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>{s.sub&&<p className="text-xs text-slate-400">{s.sub}</p>}</Link>:<div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-400">{s.icon}<span className="text-xs">{s.label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>{s.sub&&<p className="text-xs text-slate-400">{s.sub}</p>}</div>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">{data?.currentBlock?"Bloc "+data.currentBlock.blockNumber:"Aucun bloc actif"}</h2>
            {data?.currentBlock?(<><div className="flex gap-3">{[1,2].map(n=><div key={n} className={"flex h-16 flex-1 items-center justify-center rounded-xl text-sm font-medium "+(n<=data.currentBlock!.seriesCompleted?"bg-brand text-white":"border border-dashed border-slate-300 text-slate-400")}>{n<=data.currentBlock!.seriesCompleted?"✓ Serie "+n:"Serie "+n}</div>)}</div>{!data.pause.active&&data.currentBlock.seriesCompleted<2&&<Link href="/quiz" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-brand text-brand px-4 py-2.5 text-sm font-medium hover:bg-brand/5"><Play className="h-4 w-4"/>Serie {data.currentBlock.seriesCompleted+1}</Link>}</>):(<div className="text-center py-4"><Link href="/quiz" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"><Play className="h-4 w-4"/>Commencer</Link></div>)}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Acces rapide</h2>
            <div className="space-y-2">{[{href:"/exam",icon:<Trophy className="h-4 w-4"/>,label:"Examen blanc",sub:"40 questions"},{href:"/traps",icon:<AlertTriangle className="h-4 w-4"/>,label:"Mes pieges",sub:"Analyse erreurs"},{href:"/readiness",icon:<Target className="h-4 w-4"/>,label:"Score de preparation",sub:"Suis ta progression"},{href:"/booking",icon:<BookOpen className="h-4 w-4"/>,label:"Reserver l'examen",sub:"Quand tu es pret"}].map(item=><Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 group"><div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white">{item.icon}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div><ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand"/></Link>)}</div>
          </div>
        </div>
        {data&&data.topTraps.length>0&&(<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/><h2 className="font-semibold text-slate-900">Points faibles</h2></div><Link href="/traps" className="text-sm text-brand hover:underline">Voir tout</Link></div><div className="space-y-3">{data.topTraps.slice(0,5).map(trap=><div key={trap.name} className="flex items-center gap-3"><span className="w-44 truncate text-sm text-slate-600 capitalize">{trap.name.replace(/_/g," ")}</span><div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-400" style={{width:Math.min(100,trap.score/30*100)+"%"}}/></div><span className="text-xs text-slate-400 w-6 text-right">{trap.score}</span></div>)}</div></div>)}
        {data&&data.totalSeries===0&&(<div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center"><Zap className="mx-auto h-8 w-8 text-slate-300 mb-3"/><p className="font-medium text-slate-700">Pret a commencer ?</p><Link href="/quiz" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"><Play className="h-4 w-4"/>Premiere serie</Link></div>)}
      </div>
    </main>
  );
}