import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { weaknessDelta } from "@/lib/algorithm";
import { z } from "zod";

const schema = z.object({ seriesId: z.string(), questionId: z.string(), chosenChoiceIds: z.array(z.string()), responseTimeMs: z.number().int().positive() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  let body; try { body = schema.parse(await req.json()); } catch { return NextResponse.json({ error: "Donnees invalides" }, { status: 400 }); }
  const { questionId, chosenChoiceIds, responseTimeMs } = body;
  const question = await prisma.question.findUnique({ where: { id: questionId }, include: { choices: true } });
  if (!question) return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
  const correctIds = question.choices.filter(c=>c.isCorrect).map(c=>c.id);
  const isCorrect = chosenChoiceIds.length===correctIds.length && chosenChoiceIds.every(id=>correctIds.includes(id));
  const prevAttempt = await prisma.attempt.findFirst({ where: { userId, questionId, isCorrect: false }, orderBy: { createdAt: "desc" } });
  const slow = responseTimeMs > 15000;
  const repeatedError = !isCorrect && !!prevAttempt;
  await prisma.attempt.create({ data: { userId, questionId, chosenChoiceIds, isCorrect, responseTimeMs } });
  const delta = weaknessDelta({ difficulty: question.difficulty, correct: isCorrect, slow, repeatedError });
  await prisma.weaknessScore.upsert({
    where: { userId_key: { userId, key: question.trapFamily } },
    update: { score: { increment: delta }, updatedAt: new Date() },
    create: { userId, key: question.trapFamily, score: Math.max(0, delta) },
  });
  return NextResponse.json({ isCorrect, correctChoiceIds: correctIds, explanationShort: question.explanationShort, explanationLong: question.explanationLong });
}