import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ examId: z.string(), answers: z.array(z.object({ questionId: z.string(), chosenChoiceIds: z.array(z.string()), responseTimeMs: z.number().int().positive() })), durationMs: z.number().int().positive().optional() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  let body; try { body = schema.parse(await req.json()); } catch { return NextResponse.json({ error: "Donnees invalides" }, { status: 400 }); }
  const { examId, answers, durationMs } = body;
  const exam = await prisma.examResult.findUnique({ where: { id: examId }, include: { items: true } });
  if (!exam || exam.userId !== userId) return NextResponse.json({ error: "Examen introuvable" }, { status: 404 });
  const questions = await prisma.question.findMany({ where: { id: { in: answers.map(a=>a.questionId) } }, include: { choices: true } });
  const qMap = new Map(questions.map(q=>[q.id,q]));
  let score = 0;
  const attemptCreates = [];
  const itemUpdates = [];
  for (const answer of answers) {
    const q = qMap.get(answer.questionId); if (!q) continue;
    const correctIds = q.choices.filter(c=>c.isCorrect).map(c=>c.id);
    const isCorrect = answer.chosenChoiceIds.length===correctIds.length && answer.chosenChoiceIds.every(id=>correctIds.includes(id));
    if (isCorrect) score++;
    itemUpdates.push({ questionId: answer.questionId, isCorrect });
    attemptCreates.push({ userId, questionId: answer.questionId, chosenChoiceIds: answer.chosenChoiceIds, isCorrect, responseTimeMs: answer.responseTimeMs });
  }
  await Promise.all([
    prisma.examResult.update({ where: { id: examId }, data: { score, durationMs: durationMs??null } }),
    ...itemUpdates.map(u=>prisma.examItem.updateMany({ where: { examResultId: examId, questionId: u.questionId }, data: { isCorrect: u.isCorrect } })),
    prisma.attempt.createMany({ data: attemptCreates, skipDuplicates: true }),
  ]);
  return NextResponse.json({ score, total: exam.totalQ, percentage: Math.round(score/exam.totalQ*100) });
}