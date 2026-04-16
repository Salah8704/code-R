import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = await req.json() as {
    seriesId: string;
    answers: { questionId: string; chosenChoiceIds: string[]; responseTimeMs: number }[];
  };

  const { seriesId, answers } = body;

  const results = await Promise.all(
    answers.map(async (answer: { questionId: string; chosenChoiceIds: string[]; responseTimeMs: number }) => {
      const question = await prisma.question.findUniqueOrThrow({
        where: { id: answer.questionId },
        include: { choices: true },
      });
      const correctIds: string[] = question.choices
        .filter((c) => c.isCorrect)
        .map((c) => c.id);
      const isCorrect: boolean =
        answer.chosenChoiceIds.length === correctIds.length &&
        answer.chosenChoiceIds.every((id: string) => correctIds.includes(id));

      await prisma.attempt.create({
        data: {
          userId,
          questionId: answer.questionId,
          chosenChoiceIds: answer.chosenChoiceIds,
          isCorrect,
          responseTimeMs: answer.responseTimeMs,
        },
      });
      return { questionId: answer.questionId, isCorrect, correctIds };
    })
  );

  const score = Math.round(
    (results.filter((r) => r.isCorrect).length / results.length) * 100
  );

  await prisma.series.update({
    where: { id: seriesId },
    data: { endedAt: new Date(), score },
  });

  return NextResponse.json({ results, score });
}
