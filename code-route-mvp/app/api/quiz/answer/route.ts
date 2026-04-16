// app/api/quiz/answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateWeaknessScores } from "@/services/algorithm.service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });
  const userId = session.user.id;
  const { questionId, chosenChoiceIds, responseTimeMs } = await req.json();
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId }, include: { choices: true } });
  const correctIds=question.choices.filter(c=>c.isCorrect).map(c=>c.id);
  const isCorrect=chosenChoiceIds.length===correctIds.length&&chosenChoiceIds.every(id=>correctIds.includes(id));
  const attempt=await prisma.attempt.create({data:{userId,questionId,chosenChoiceIds,isCorrect,responseTimeMs}});
  await updateWeaknessScores(userId,question,isCorrect,responseTimeMs);
  return NextResponse.json({isCorrect,correctChoiceIds:correctIds,explanationShort:question.explanationShort,explanationLong:question.explanationLong,attemptId:attempt.id});
}
