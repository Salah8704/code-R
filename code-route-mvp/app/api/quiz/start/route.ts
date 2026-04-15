// app/api/quiz/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { shouldForcePause, getOrCreateActiveBlock } from "@/services/algorithm.service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = session.user.id;
  const pauseStatus = await shouldForcePause(userId);
  if (pauseStatus.forced) return NextResponse.json({ error: "Pause active", pauseEndsAt: pauseStatus.pauseEndsAt }, { status: 423 });
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" }, take: 5 });
  const weakTraps = weaknesses.filter(w => w.keyType === "trapFamily").map(w => w.key);
  let questions = [];
  if (weakTraps.length > 0) {
    const weakQ = await prisma.question.findMany({ where: { trapFamily: { in: weakTraps } }, include: { choices: { orderBy: { position: "asc" } } }, take: 12 });
    questions.push(...weakQ);
  }
  if (questions.length < 20) {
    const fill = await prisma.question.findMany({ where: { id: { notIn: questions.map(q => q.id) } }, include: { choices: { orderBy: { position: "asc" } } }, take: 20 - questions.length });
    questions.push(...fill);
  }
  questions = questions.sort(() => Math.random() - 0.5).slice(0, 20);
  const blockId = await getOrCreateActiveBlock(userId);
  const series = await prisma.series.create({ data: { userId, mode:"training", plannedCount: questions.length, studyBlockId: blockId, items: { create: questions.map((q, idx) => ({ questionId: q.id, position: idx })) } } });
  const sanitized = questions.map(q => ({...q, choices: q.choices.map(({ isCorrect: _, ...c }) => c) }));
  return NextResponse.json({ seriesId: series.id, questions: sanitized, mode: weaknesses.length>0?"corrective":"training", topWeaknesses: weaknesses.slice(0,3) });
}
