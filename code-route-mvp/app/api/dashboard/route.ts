import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readinessScore, readinessLabel, computeConsistency, speedScore, trapMasteryScore } from "@/lib/algorithm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  const block = await prisma.studyBlock.findFirst({
    where: { userId, status: "active" }, orderBy: { startedAt: "desc" },
    include: { pauses: { where: { status: "active" }, orderBy: { startAt: "desc" }, take: 1 } },
  });
  const allSeries = await prisma.series.findMany({ where: { userId, endedAt: { not: null } }, orderBy: { startedAt: "desc" } });
  const recentAttempts = await prisma.attempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 200 });
  const totalAttempts = recentAttempts.length;
  const correctAttempts = recentAttempts.filter(a=>a.isCorrect).length;
  const globalAccuracy = totalAttempts>0?Math.round(correctAttempts/totalAttempts*40):0;
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" }, take: 5 });
  const exams = await prisma.examResult.findMany({ where: { userId }, orderBy: { completedAt: "desc" }, take: 10 });
  const examScores = exams.map(e=>e.score);
  const trapMastery = trapMasteryScore(weaknesses);
  const consistency = computeConsistency(examScores.length?examScores:[globalAccuracy]);
  const avgMs = recentAttempts.length>0?recentAttempts.reduce((a,b)=>a+b.responseTimeMs,0)/recentAttempts.length:10000;
  const speed = speedScore(avgMs);
  const rScore = readinessScore(examScores.length?examScores:[globalAccuracy], trapMastery, consistency, speed);
  const rLabel = readinessLabel(rScore);
  const activePause = block?.pauses?.[0];
  const pauseActive = activePause ? new Date() < activePause.endAt : false;
  return NextResponse.json({
    currentBlock: block ? { id: block.id, blockNumber: block.blockNumber, seriesCompleted: block.seriesCompleted } : null,
    pause: pauseActive ? { active: true, resumeAt: activePause!.endAt } : { active: false },
    globalScore: globalAccuracy, readinessScore: rScore, readinessLabel: rLabel,
    totalSeries: allSeries.length,
    topTraps: weaknesses.map(w=>({ name: w.key, score: Math.round(w.score) })),
    nextAction: pauseActive ? "Pause en cours. Repose-toi !" : block && block.seriesCompleted<2 ? "Fais ta deuxieme serie pour terminer le bloc." : "Commence un nouveau bloc.",
  });
}