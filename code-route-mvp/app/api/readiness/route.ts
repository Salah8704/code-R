import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readinessScore, readinessLabel, readinessLevel, computeConsistency, speedScore, trapMasteryScore } from "@/lib/algorithm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  const exams = await prisma.examResult.findMany({ where: { userId }, orderBy: { completedAt: "desc" }, take: 10 });
  const examScores = exams.map((e) => e.score);
  const consistency = computeConsistency(examScores);
  const attempts = await prisma.attempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100, select: { responseTimeMs: true, isCorrect: true } });
  const avgResponseMs = attempts.length > 0 ? attempts.reduce((a, b) => a + b.responseTimeMs, 0) / attempts.length : 10000;
  const speed = speedScore(avgResponseMs);
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" } });
  const trapMastery = trapMasteryScore(weaknesses);
  const score = readinessScore(examScores, trapMastery, consistency, speed);
  const label = readinessLabel(score);
  const level = readinessLevel(score);
  const signals = {
    examCount: exams.length, lastExamScore: exams[0]?.score ?? null,
    avgExamScore: examScores.length > 0 ? Math.round(examScores.reduce((a,b)=>a+b,0)/examScores.length) : null,
    consistency: Math.round(consistency*100), speed: Math.round(speed*100), trapMastery: Math.round(trapMastery*100),
    topWeaknesses: weaknesses.slice(0,3).map(w=>({key:w.key,score:Math.round(w.score)})),
    totalAttempts: attempts.length, correctRate: attempts.length>0?Math.round(attempts.filter(a=>a.isCorrect).length/attempts.length*100):0,
  };
  await prisma.readinessSnapshot.create({ data: { userId, score, level, signals } });
  return NextResponse.json({ score, label, level, signals });
}