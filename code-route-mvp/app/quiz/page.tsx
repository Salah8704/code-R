"use client";
import{useEffect,useState,useCallback}from"react";
import{useRouter}from"next/navigation";
import Link from"next/link";
import{CheckCircle,XCircle,ChevronRight,Clock,ArrowLeft}from"lucide-react";
type Choice={id:string;position:number;text:string};
type Question={id:string;prompt:string;difficulty:number;theme:string;choices:Choice[]};
type AnswerResult={isCorrect:boolean;correctChoiceIds:string[];explanationShort:string;explanationLong?:string|null};
type State="loading"|"question"|"correction"|"complete"|"error"|"paused";
export default function QuizPage(){
  const router=useRouter();
  const[state,setState]=useState<State>("loading");
  const[questions,setQuestions]=useState<Question[]>([]);
  const[current,setCurrent]=useState(0);
  const[seriesId,setSeriesId]=useState("");
  const[selected,setSelected]=useState<string[]>([]);
  const[result,setResult]=useState<AnswerResult|null>(null);
  const[startTime,setStartTime]=useState(0);
  const[score,setScore]=useState(0);
  const[pauseUntil,setPauseUntil]=useState<string|null>(null);
  const start=useCallback(async()=>{
    setState("loading");
    const res=await fetch("/api/quiz/start",{method:"POST"});
    if(res.status===423){const d=await res.json();setPauseUntil(d.pauseUntil);setState("paused");return;}
    if(!res.ok){setState("error");return;}
    const data=await res.json();
    setSeriesId(data.seriesId);setQuestions(data.questions);setCurrent(0);setScore(0);setSelected([]);setResult(null);setStartTime(Date.now());setState("question");
  },[]);
  useEffect(()=>{start();},[start]);
  async function submit(){
    if(!selected.length)return;
    const q=questions[current];
    const res=await fetch("/api/quiz/answer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({seriesId,questionId:q.id,chosenChoiceIds:selected,responseTimeMs:Date.now()-startTime})});
    const data:AnswerResult=await res.json();
    setResult(data);if(data.isCorrect)setScore(s=>s+1);setState("correction");
  }
  async function next(){
    if(current>=questions.length-1){
      const res=await fetch("/api/quiz/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({seriesId})});
      const data=await res.json();
      if(data.blockComplete&&data.pauseUntil){setPauseUntil(data.pauseUntil);setState("paused");}
      else setState("complete");return;
    }
    setCurrent(c=>c+1);setSelected([]);setResult(null);setStartTime(Date.now());setState("question");
  }
  if(state==="loading")return<div className="flex min-h-screen items-center justify-center bg-slate-50"><Clock className="h-8 w-8 animate-pulse text-slate-400"/></div>;
  if(state==="error")return<div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><p className="text-red-600">Erreur</p><button onClick={start} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white">Reessayer</button></div></div>;
  if(state==="paused"&&pauseUntil){
    const[rem,setRem]=useState("");
    useEffect(()=>{const t=()=>{const d=new Date(pauseUntil).getTime()-Date.now();if(d<=0){setRem("Terminee!");return;}setRem(Math.floor(d/60000)+":"+(Math.floor(d%60000/1000)).toString().padStart(2,"0"));};t();const id=setInterval(t,1000);return()=>clearInterval(id);},[]);
    return<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="w-full max-w-md rounded-2xl border border-orange-200 bg-white p-8 text-center shadow-sm"><Clock className="mx-auto h-12 w-12 text-orange-400 mb-4"/><h2 className="text-2xl font-bold text-slate-900">Pause obligatoire</h2><p className="mt-2 text-sm text-slate-500">Ton cerveau a besoin de consolider.</p><p className="mt-6 font-mono text-5xl font-extrabold text-brand">{rem}</p><p className="mt-2 text-sm text-slate-500">Reprise a {new Date(pauseUntil).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</p><div className="mt-6 rounded-xl bg-slate-50 p-4 text-left"><p className="text-sm text-slate-500">Les pauses entre sessions augmentent la retention de 30 a 40%.</p></div><button onClick={()=>router.push("/dashboard")} className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Voir mon dashboard</button></div></div>;
  }
  if(state==="complete")return<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><CheckCircle className="mx-auto h-12 w-12 text-brand mb-4"/><h2 className="text-2xl font-bold text-slate-900">Serie terminee !</h2><p className="mt-2 text-4xl font-extrabold text-brand">{score}/{questions.length}</p><div className="mt-6 flex flex-col gap-3"><button onClick={start} className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Faire la deuxieme serie</button><Link href="/dashboard" className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">Voir le dashboard</Link></div></div></div>;
  const q=questions[current];if(!q)return null;
  const progress=(current+1)/questions.length*100;
  return(<main className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3"><Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4"/>Dashboard</Link><span className="text-sm font-medium text-slate-600">{current+1}/{questions.length}</span><span className="text-sm font-medium text-brand">{score} correct</span></div><div className="h-1 bg-slate-100"><div className="h-full bg-brand transition-all" style={{width:progress+"%"}}/></div></header>
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">{q.theme.replace(/_/g," ")}</span><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">Diff {q.difficulty}/3</span></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold leading-snug text-slate-900">{q.prompt}</p>
        <div className="mt-6 space-y-3">{q.choices.map(c=>{const sel=selected.includes(c.id);const show=state==="correction";const corr=result?.correctChoiceIds.includes(c.id);const wrong=show&&sel&&!corr;let cls="w-full rounded-xl border p-4 text-left text-sm font-medium transition-all ";if(show){if(corr)cls+="border-green-400 bg-green-50 text-green-800";else if(wrong)cls+="border-red-400 bg-red-50 text-red-800";else cls+="border-slate-200 bg-slate-50 text-slate-400";}else{cls+=sel?"border-brand bg-brand/5 text-brand":"border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";}
          return<button key={c.id} className={cls} onClick={()=>state==="question"&&setSelected(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} disabled={state==="correction"}><div className="flex items-center gap-3"><span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs">{String.fromCharCode(65+c.position)}</span><span>{c.text}</span>{show&&corr&&<CheckCircle className="ml-auto h-4 w-4 text-green-500"/>}{show&&wrong&&<XCircle className="ml-auto h-4 w-4 text-red-500"/>}</div></button>;})}
        </div>
        {state==="correction"&&result&&<div className={"mt-6 rounded-xl p-4 "+(result.isCorrect?"bg-green-50 border border-green-200":"bg-red-50 border border-red-200")}><p className={"font-semibold "+(result.isCorrect?"text-green-800":"text-red-800")}>{result.isCorrect?"✓ Bonne reponse !":"✗ Mauvaise reponse"}</p><p className="mt-1 text-sm text-slate-700">{result.explanationShort}</p></div>}
      </div>
      <div className="mt-6">{state==="question"&&<button onClick={submit} disabled={!selected.length} className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">Valider</button>}
      {state==="correction"&&<button onClick={next} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark">{current>=questions.length-1?"Terminer":"Suivant"}<ChevronRight className="h-5 w-5"/></button>}</div>
    </div>
  </main>);
}