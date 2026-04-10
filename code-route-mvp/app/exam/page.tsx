"use client";
import{useState,useCallback,useEffect}from"react";
import{useRouter}from"next/navigation";
import Link from"next/link";
import{Clock,CheckCircle,ArrowLeft,Trophy}from"lucide-react";
type Choice={id:string;position:number;text:string};
type Question={id:string;prompt:string;theme:string;choices:Choice[]};
type Answer={questionId:string;chosenChoiceIds:string[];responseTimeMs:number};
type Phase="intro"|"exam"|"result";
export default function ExamPage(){
  const router=useRouter();
  const[phase,setPhase]=useState<Phase>("intro");
  const[examId,setExamId]=useState("");
  const[questions,setQuestions]=useState<Question[]>([]);
  const[current,setCurrent]=useState(0);
  const[selected,setSelected]=useState<string[]>([]);
  const[answers,setAnswers]=useState<Answer[]>([]);
  const[qStart,setQStart]=useState(0);
  const[examStart,setExamStart]=useState(0);
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState<{score:number;total:number;percentage:number}|null>(null);
  const[timeLeft,setTimeLeft]=useState(40*60);
  useEffect(()=>{if(phase!=="exam")return;const id=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(id);return 0;}return t-1;}),1000);return()=>clearInterval(id);},[phase]);
  const startExam=useCallback(async()=>{
    setLoading(true);
    const res=await fetch("/api/exam/start",{method:"POST"});
    if(!res.ok){setLoading(false);return;}
    const data=await res.json();
    setExamId(data.examId);setQuestions(data.questions);setCurrent(0);setAnswers([]);setSelected([]);setQStart(Date.now());setExamStart(Date.now());setTimeLeft(40*60);setPhase("exam");setLoading(false);
  },[]);
  async function submitExam(all:Answer[]){
    setLoading(true);
    const res=await fetch("/api/exam/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({examId,answers:all,durationMs:Date.now()-examStart})});
    setResult(await res.json());setPhase("result");setLoading(false);
  }
  function handleNext(){
    const ans:Answer={questionId:questions[current].id,chosenChoiceIds:selected,responseTimeMs:Date.now()-qStart};
    const newAnswers=[...answers,ans];setAnswers(newAnswers);
    if(current>=questions.length-1){submitExam(newAnswers);}
    else{setCurrent(c=>c+1);setSelected([]);setQStart(Date.now());}
  }
  const tColor=timeLeft<300?"text-red-500":timeLeft<600?"text-orange-500":"text-slate-600";
  const tMin=Math.floor(timeLeft/60),tSec=(timeLeft%60).toString().padStart(2,"0");
  if(phase==="intro")return<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 mb-6"><ArrowLeft className="h-4 w-4"/>Dashboard</Link><Trophy className="h-10 w-10 text-brand mb-4"/><h1 className="text-2xl font-bold text-slate-900">Examen blanc</h1><p className="mt-2 text-slate-500">40 questions · 40 minutes · Conditions reelles</p><button onClick={startExam} disabled={loading} className="mt-8 w-full rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{loading?"Preparation...":"Lancer l'examen"}</button></div></div>;
  if(phase==="result"&&result){const m=result.score>=35?"✓ Recu !":result.score>=30?"Limite":"Insuffisant";const mc=result.score>=35?"text-green-600":result.score>=30?"text-orange-500":"text-red-600";return<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center"><Trophy className="mx-auto h-12 w-12 text-brand mb-4"/><h2 className="text-2xl font-bold text-slate-900">Resultat</h2><p className="mt-4 text-6xl font-extrabold text-slate-900">{result.score}<span className="text-2xl text-slate-400">/{result.total}</span></p><p className={"mt-2 text-xl font-semibold "+mc}>{m}</p><p className="mt-1 text-slate-500">Seuil : 35/40</p><div className="mt-8 flex flex-col gap-3"><button onClick={()=>setPhase("intro")} className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Refaire un examen</button><Link href="/dashboard" className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">Dashboard</Link><Link href="/readiness" className="text-sm text-brand hover:underline">Voir mon score →</Link></div></div></div>;}
  const q=questions[current];if(!q)return null;
  const progress=(current+1)/questions.length*100;
  return<main className="min-h-screen bg-slate-50"><header className="sticky top-0 z-10 border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3"><span className="text-sm font-medium text-slate-600">{current+1}/{questions.length}</span><div className={"flex items-center gap-1.5 font-mono text-sm font-bold "+tColor}><Clock className="h-4 w-4"/>{tMin}:{tSec}</div><span className="text-sm text-slate-400">Examen blanc</span></div><div className="h-1 bg-slate-100"><div className="h-full bg-brand transition-all" style={{width:progress+"%"}}/></div></header>
  <div className="mx-auto max-w-2xl px-4 py-8"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">{q.theme.replace(/_/g," ")}</p><p className="text-lg font-semibold text-slate-900 leading-snug">{q.prompt}</p><div className="mt-6 space-y-3">{q.choices.map(c=><button key={c.id} onClick={()=>setSelected(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} className={"w-full rounded-xl border p-4 text-left text-sm font-medium transition-all "+(selected.includes(c.id)?"border-brand bg-brand/5 text-brand":"border-slate-200 text-slate-700 hover:border-slate-300")}><span className="flex items-center gap-3"><span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs">{String.fromCharCode(65+c.position)}</span>{c.text}</span></button>)}</div></div>
  <div className="mt-4 flex justify-end"><button onClick={handleNext} disabled={loading} className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{current>=questions.length-1?(loading?"Calcul...":"Terminer"):"Suivant →"}</button></div></div></main>;
}