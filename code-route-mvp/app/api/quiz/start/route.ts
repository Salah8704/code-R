import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { shouldForcePause } from "@/lib/algorithm";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  let block = await prisma.studyBlock.findFirst({ where: { userId, status: "active" }, orderBy: { startedAt: "desc" } });
  if (block && shouldForcePause(block.seriesCompleted)) {
    const pause = await prisma.blockPause.findFirst({ where: { studyBlockId: block.id, status: "active" } });
    if (pause && new Date() < pause.endAt) return NextResponse.json({ pauseUntil: pause.endAt }, { status: 423 });
    await prisma.studyBlock.update({ where: { id: block.id }, data: { status: "completed", endedAt: new Date() } });
    block = null;
  }
  if (!block) {
    const blockCount = await prisma.studyBlock.count({ where: { userId } });
    block = await prisma.studyBlock.create({ data: { userId, blockNumber: blockCount+1 } });
  }
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" }, take: 5 });
  const weakKeys = weaknesses.map(w=>w.key);
  const seriesInBlock = await prisma.series.findMany({ where: { studyBlockId: block.id }, include: { items: { select: { questionId: true } } } });
  const seenIds = seriesInBlock.flatMap(s=>s.items.map(i=>i.questionId));
  let questions = weakKeys.length ? await prisma.question.findMany({ where: { trapFamily: { in: weakKeys }, id: { notIn: seenIds } }, take: 10, include: { choices: { orderBy: { position: "asc" } } } }) : [];
  if (questions.length < 20) {
    const existing = questions.map(q=>q.id);
    const fill = await prisma.question.findMany({ where: { id: { notIn: [...seenIds,...existing] } }, take: 20-questions.length, include: { choices: { orderBy: { position: "asc" } } } });
    questions = [...questions,...fill];
  }
  if (questions.length < 20) {
    const existing = questions.map(q=>q.id);
    const fill = await prisma.question.findMany({ where: { id: { notIn: existing } }, take: 20-questions.length, include: { choices: { orderBy: { position: "asc" } } } });
    questions = [...questions,...fill];
  }
  questions = questions.sort(()=>Math.random()-0.5).slice(0,20);
  const series = await prisma.series.create({ data: { userId, mode: "training", plannedCount: questions.length, studyBlockId: block.id, items: { create: questions.map((q,i)=>({ questionId: q.id, position: i })) } } });
  const sanitized = questions.map(q=>({...q, choices: q.choices.map(({isCorrect:_,...c})=>c)}));
  return NextResponse.json({ seriesId: series.id, blockId: block.id, questions: sanitized });
}