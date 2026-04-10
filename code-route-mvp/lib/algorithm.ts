export type AttemptInput = { difficulty: number; correct: boolean; slow: boolean; repeatedError: boolean; };
export function weaknessDelta(input: AttemptInput): number {
  const base = 1 + 0.25*(input.difficulty-1); let score = 0;
  if (!input.correct) score += 3*base; if (input.correct) score -= 1*base;
  if (input.slow) score += 1*base; if (!input.correct && input.repeatedError) score += 1.5*base;
  return Number(score.toFixed(2));
}
export function readinessScore(examScores: number[], trapMastery: number, consistency: number, speed: number): number {
  if (!examScores.length) return 0;
  const avg = examScores.reduce((a,b)=>a+b,0)/examScores.length/40;
  return Math.max(0,Math.min(100,Math.round(100*(0.55*avg+0.2*trapMastery+0.15*consistency+0.1*speed))));
}
export type ReadinessLevel = "pas_pret"|"presque_pret"|"pret"|"tres_pret";
export function readinessLevel(score: number): ReadinessLevel {
  if (score>=88) return "tres_pret"; if (score>=75) return "pret"; if (score>=55) return "presque_pret"; return "pas_pret";
}
export function readinessLabel(score: number): string {
  const map: Record<ReadinessLevel,string> = { tres_pret:"Tres pret", pret:"Pret", presque_pret:"Presque pret", pas_pret:"Pas encore pret" };
  return map[readinessLevel(score)];
}
export function shouldForcePause(seriesCompletedInBlock: number): boolean { return seriesCompletedInBlock >= 2; }
export function shouldTriggerAnalysis(total: number): boolean { return total>0 && total%4===0; }
export function computeConsistency(scores: number[]): number {
  if (scores.length<2) return 0.5;
  const avg = scores.reduce((a,b)=>a+b,0)/scores.length;
  const stdDev = Math.sqrt(scores.reduce((a,b)=>a+Math.pow(b-avg,2),0)/scores.length);
  return Math.max(0,Math.min(1,1-stdDev/10));
}
export function speedScore(avgMs: number): number {
  const s = avgMs/1000; if (s<=5) return 1; if (s>=20) return 0; return 1-(s-5)/15;
}
export function trapMasteryScore(ws: {score:number}[]): number {
  if (!ws.length) return 0.5;
  return Math.max(0,Math.min(1,1-ws.reduce((a,w)=>a+w.score,0)/ws.length/30));
}