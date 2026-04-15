"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function PauseScreen({ pauseEndsAt }) {
  const [remaining, setRemaining] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(pauseEndsAt).getTime() - Date.now();
      if (diff <= 0) { setDone(true); setRemaining("00:00"); return; }
      const m=Math.floor(diff/60000), s=Math.floor((diff%60000)/1000);
      setRemaining(`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[pauseEndsAt]);
  const resumeTime=new Date(pauseEndsAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 text-center">
      {done ? (
        <div><p>Pause terminée !</p><Link href="/quiz"<Reprendre</Link></div>
      ) : (
        <div>
          <h3>30 min de pause</h3>
          <div className="text-5xl font-mono font-bold text-orange-500">{remaining}</div>
          <p>Reprise à <strong>{resumeTime}</strong></p>
        </div>
      )}
    </div>
  );
}
