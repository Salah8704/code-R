// services/algorithm.service.ts
import { prisma } from "@/lib/prisma";
import type { Question } from "@prisma/client";

const SLOW_THRESHOLD_MS = 15_000;
const SERIES_PER_BLOCK = 2;
const PAUSE_MINUTES = 30;
const ANALYSIS_EVERY = 4;

export async function updateWeaknessScores(userId: string, question: Question, isCorrect: boolean, responseTimeMs: number): Promise<void> {
  const isSlow = responseTimeMs > SLOW_THRESHOLD_MS;
  const prev = await prisma.attempt.findFirst({ where: { userId, questionId: question.id, isCorrect: false }, orderBy: { createdAt: "desc" } });
  const isRepeatedError = !isCorrect && !!prev;
  const diffWeight = 1 + 0.25 * (question.difficulty - 1);
  let delta = 0;
  if (!isCorrect) delta += 3 * diffWeight;
  if (isCorrect) delta -= 1 * diffWeight;
  if (isSlow) delta += 1;
  if (isRepeatedError) delta += 1.5;
  const keys = [
    { key: question.theme, type: "theme" as const },
    { key: question.subtheme, type: "subtheme" as const },
    { key: question.trapFamily, type: "trapFamily" as const },
  ];
  await Promise.all(keys.map(({ key, type }) => upsertWeaknessScore(userId, key, type, Number(delta.toFixed(2)))));
}

async function upsertWeaknessScore(userId: string, key: string, keyType: string, delta: number): Promise<void> {
  const existing = await prisma.weaknessScore.findUnique({ where: { userId_key: { userId, key } } });
  const newScore = Math.max(0, (existing?.score ?? 0) + delta);
  await prisma.weaknessScore.upsert({
    where: { userId_key: { userId, key } },
    update: { score: newScore, updatedAt: new Date() },
    create: { userId, key, keyType, score: Math.max(0, delta) },
  });
}

export async function finalizesSeries(seriesId: string): Promise<{ score: number; avgResponseTimeMs: number; dominantTraps: string[]; blockComplete: boolean; pauseCreated: boolean }> {
  const series = await prisma.series.findUniqueOrThrow({ where: { id: seriesId }, include: { items: { include: { question: true } } } });
  const attempts = await prisma.attempt.findMany({ where: { userId: series.userId, questionId: { in: series.items.map((i) => i.questionId) }, createdAt: { gte: series.startedAt } }, orderBy: { createdAt: "asc" } });
  const correct = attempts.filter((a) => a.isCorrect).length;
  const total = series.items.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgResponseTimeMs = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.responseTimeMs, 0) / attempts.length) : 0;
  const wrongAttempts = attempts.filter((a) => !a.isCorrect);
  const trapCount: Record<string, number> = {};
  for (const a of wrongAttempts) {
    const q = series.items.find((i) => i.questionId === a.questionId)?.question;
    if (q) trapCount[q.trapFamily] = (trapCount[q.trapFamily] ?? 0) + 1;
  }
  const dominantTraps = Object.entries(trapCount).sort(([, a], [, b]) => b - a).slice(0, 3).map(([t]) => t);
  await prisma.series.update({ where: { id: seriesId }, data: { endedAt: new Date(), score } });
  let blockComplete = false, pauseCreated = false;
  if (series.studyBlockId) {
    const block = await prisma.studyBlock.update({ where: { id: series.studyBlockId }, data: { seriesCompleted: { increment: 1 } } });
    if (block.seriesCompleted >= SERIES_PER_BLOCK) {
      blockComplete = true;
      pauseCreated = await createPauseWindow(series.userId, series.studyBlockId);
      await prisma.studyBlock.update({ where: { id: series.studyBlockId }, data: { status: "paused", endedAt: new Date() } });
    }
  }
  const cc = await prisma.series.count({ where: { userId: series.userId, endedAt: { not: null } } });
  if (cc % ANALYSIS_EVERY === 0) await analyzeProgress(series.userId);
  return { score, avgResponseTimeMs, dominantTraps, blockComplete, pauseCreated };
}

export async function shouldForcePause(userId: string): Promise<{ forced: boolean; pauseEndsAt: Date | null }> {
  const p = await prisma.blockPause.findFirst({ where: { userId, status: "active", endAt: { gt: new Date() } }, orderBy: { startAt: "desc" } });
  if (p) return { forced: true, pauseEndsAt: p.endAt };
  return { forced: false, pauseEndsAt: null };
}

export async function getOrCreateActiveBlock(userId: string): Promise<string> {
  let block = await prisma.studyBlock.findFirst({ where: { userId, status: "active" }, orderBy: { startedAt: "desc" } });
  if (!block) {
    const c = await prisma.studyBlock.count({ where: { userId } });
    block = await prisma.studyBlock.create({ data: { userId, blockNumber: c + 1, status: "active", seriesCompleted: 0 } });
  }
  return block.id;
}

async function createPauseWindow(userId: string, studyBlockId: string): Promise<boolean> {
  const e = await prisma.blockPause.findFirst({ where: { userId, studyBlockId, status: "active" } });
  if (e) return false;
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + PAUSE_MINUTES * 60 * 1000);
  await prisma.blockPause.create({ data: { userId, studyBlockId, startAt, endAt, status: "active", respected: false } });
  return true;
}

export async function analyzeProgress(userId: string): Promise<{ topTraps: string[]; topSubthemes: string[] }> {
  const rs = await prisma.series.findMany({ where: { userId, endedAt: { not: null } }, orderBy: { endedAt: "desc" }, take: 4, include: { items: { include: { question: true } } } });
  const qIds = rs.flatMap((s) => s.items.map((i) => i.questionId));
  const attempts = await prisma.attempt.findMany({ where: { userId, questionId: { in: qIds }, isCorrect: false }, include: { question: true } });
  const tc: Record<string, number> = {}, sc: Record<string, number> = {};
  for (const a of attempts) {
    tc[a.question.trapFamily] = (tc[a.question.trapFamily] ?? 0) + 1;
    sc[a.question.subtheme] = (sc[a.question.subtheme] ?? 0) + 1;
  }
  const topTraps = Object.entries(tc).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k]) => k);
  const topSubthemes = Object.entries(sc).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
  if (topTraps.length > 0) await generateCorrectiveSeries(userId, topTraps, topSubthemes);
  return { topTraps, topSubthemes };
}

export async function generateCorrectiveSeries(userId: string, topTraps: string[], topSubthemes: string[]): Promise<string> {
  const pq = await prisma.question.findMany({ where: { trapFamily: topTraps[0] }, take: 15 });
  const rq = await prisma.question.findMany({ where: { OR: [{ trapFamily: { in: topTraps.slice(1) } }, { subtheme: { in: topSubthemes } }] }, take: 11 });
  const gq = await prisma.question.findMany({ where: { id: { notIn: [...pq.map((q) => q.id), ...rq.map((q) => q.id)] } }, take: 9 });
  const selected = [...shuffle(pq).slice(0, 10), ...shuffle(rq).slice(0, 6), ...shuffle(gq).slice(0, 4)];
  const bId = await getOrCreateActiveBlock(userId);
  const series = await prisma.series.create({ data: { userId, mode: "corrective", plannedCount: selected.length, studyBlockId: bId, items: { create: selected.map((q, i) => ({ questionId: q.id, position: i })) } } });
  return series.id;
}

export async function computeReadiness(userId: string): Promise<{ score: number; label: "pas_pret" | "presque_pret" | "pret" | "tres_pret"; details: { examAvg: number; stability: number; trapMastery: number; speedScore: number } }> {
  const es = await prisma.series.findMany({ where: { userId, mode: "exam", endedAt: { not: null } }, orderBy: { endedAt: "desc" }, take: 5 });
  const examAvg = es.length > 0 ? es.reduce((s, x) => s + (x.score ?? 0), 0) / es.length : 0;
  const stability = computeStability(es.map((s) => s.score ?? 0));
  const ws = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" }, take: 10 });
  const trapMastery = Math.max(0, 100 - (ws.length > 0 ? ws.reduce((s, w) => s + w.score, 0) / ws.length : 0) * 5);
  const ra = await prisma.attempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  const avgMs = ra.length > 0 ? ra.reduce((s, a) => s + a.responseTimeMs, 0) / ra.length : SLOW_THRESHOLD_MS;
  const speedScore = Math.max(0, Math.min(100, ((20_000 - avgMs) / 15_000) * 100));
  const score = Math.round(0.4 * examAvg + 0.25 * stability + 0.25 * trapMastery + 0.1 * speedScore);
  const label = score >= 85 ? "tres_pret" : score >= 70 ? "pret" : score >= 50 ? "presque_pret" : "pas_pret";
  await prisma.readinessSnapshot.create({ data: { userId, score, level: label, signals: { examAvg, stability, trapMastery,opeedScore: speedScore } } });
  return { score, label, details: { examAvg, stability, trapMastery, speedScore } };
}

function computeStability(scores: number[]): number {
  if (scores.length < 2) return 50;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / scores.length;
  return Math.max(0, Math.min(100, 100 - Math.sqrt(variance) * 2));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
