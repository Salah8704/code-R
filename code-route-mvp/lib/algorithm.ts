export type AttemptInput = {
  difficulty: number;
  correct: boolean;
  slow: boolean;
  repeatedError: boolean;
};

export function weaknessDelta(input: AttemptInput): number {
  const base = 1 + 0.25 * (input.difficulty - 1);
  let score = 0;
  if (!input.correct) score += 3 * base;
  if (input.correct) score -= 1 * base;
  if (input.slow) score += 1 * base;
  if (!input.correct && input.repeatedError) score += 1.5 * base;
  return Number(score.toFixed(2));
}

export function readinessScore(exams: number[], trapMastery: number, consistency: number, speed: number): number {
  const avg = exams.reduce((a, b) => a + b, 0) / exams.length / 40;
  const raw = 100 * (0.55 * avg + 0.2 * trapMastery + 0.15 * consistency + 0.1 * speed);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function readinessLabel(score: number): string {
  if (score >= 88) return "Très prêt";
  if (score >= 80) return "Prêt";
  if (score >= 65) return "Presque prêt";
  return "Pas prêt";
}

export function shouldForcePause(seriesCompletedInBlock: number): boolean {
  return seriesCompletedInBlock >= 2;
}
