import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId, score: { gt: 0 } }, orderBy: { score: "desc" }, take: 10 });
  if (!weaknesses.length) return NextResponse.json({ traps: [], weaknesses: [] });
  const topTraps = weaknesses.slice(0,5).map(w=>w.key);
  const questions = await prisma.question.findMany({
    where: { trapFamily: { in: topTraps } },
    include: { choices: { orderBy: { position: "asc" } } }, take: 30,
  });
  const trapStats = await Promise.all(topTraps.map(async (trap) => {
    const trapQIds = questions.filter(q=>q.trapFamily===trap).map(q=>q.id);
    if (!trapQIds.length) return null;
    const [total, wrong] = await Promise.all([
      prisma.attempt.count({ where: { userId, questionId: { in: trapQIds } } }),
      prisma.attempt.count({ where: { userId, questionId: { in: trapQIds }, isCorrect: false } }),
    ]);
    const weakness = weaknesses.find(w=>w.key===trap);
    return { trapFamily: trap, score: weakness?.score??0, totalAttempts: total, wrongAttempts: wrong, errorRate: total>0?Math.round(wrong/total*100):0,
      questions: questions.filter(q=>q.trapFamily===trap).map(q=>({ id:q.id, prompt:q.prompt, difficulty:q.difficulty, explanationShort:q.explanationShort, choices:q.choices })) };
  }));
  return NextResponse.json({ traps: trapStats.filter(Boolean), weaknesses });
}