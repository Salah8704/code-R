// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { computeReadiness, shouldForcePause } from "@/services/algorithm.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = session.user.id;

  const pauseStatus = await shouldForcePause(userId);
  const readiness = await computeReadiness(userId);

  const activeBlock = await prisma.studyBlock.findFirst({
    where: { userId, status: "active" }, orderBy: { startedAt: "desc" },
  });
  const topWeaknesses = await prisma.weaknessScore.findMany({
    where: { userId }, orderBy: { score: "desc" }, take: 5,
  });
  const recentSeries = await prisma.series.findMany({
    where: { userId, endedAt: { not: null } }, orderBy: { endedAt: "desc" },
    take: 5, select: { id: true, score: true, mode: true, endedAt: true, plannedCount: true },
  });
  const totalSeries = await prisma.series.count({ where: { userId, endedAt: { not: null } } });
  const allScores = await prisma.series.findMany({
    where: { userId, endedAt: { not: null }, mode: { notIn: ["corrective"] } },
    select: { score: true },
  });
  const globalScore = allScores.length > 0
    ? Math.round(allScores.reduce((s, x) => s + (x.score ?? 0), 0) / allScores.length)
    : 0;

  let state = "IDLE";
  let nextAction = { label: "Commencer ma première série", href: "/quiz", locked: false };
  let coachMessage = "Bienvenue ! Commençons par évaluer ton niveau.";

  if (pauseStatus.forced) {
    state = "PAUSE";
    nextAction = { label: "Pause obligatoire en cours", href: "/pause", locked: true };
    coachMessage = "Ton cerveau consolide ce qu'il vient d'apprendre.";
  } else if (readiness.score >= 85) {
    state = "EXAM_READY";
    nextAction = { label: "Faire un examen blanc", href: "/exam", locked: false };
    coachMessage = "Tu es prêt à passer l'examen ! Fais un dernier examen blanc.";
  } else if (activeBlock && activeBlock.seriesCompleted < 2) {
    state = "IN_BLOCK";
    const serieNum = activeBlock.seriesCompleted + 1;
    nextAction = { label: `Faire la série ${serieNum}/2`, href: "/quiz", locked: false };
    coachMessage = `Tu es en plein bloc ${activeBlock.blockNumber}. Encore une série pour le terminer.`;
  } else if (totalSeries > 0) {
    state = "BLOCK_DONE";
    nextAction = { label: "Démarrer un nouveau bloc", href: "/quiz", locked: false };
    coachMessage = "Excellent ! Tu as terminé ce bloc. Prêt pour le suivant ?";
  }

  return NextResponse.json({
    state, readiness,
    activeBlock: activeBlock ? { id: activeBlock.id, blockNumber: activeBlock.blockNumber, seriesCompleted: activeBlock.seriesCompleted } : null,
    pauseEndsAt: pauseStatus.pauseEndsAt, topWeaknesses, recentSeries,
    nextAction, coachMessage, globalScore, totalSeries,
  });
}
