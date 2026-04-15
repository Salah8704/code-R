// app/api/traps/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = session.user.id;
  const weaknesses = await prisma.weaknessScore.findMany({ where: { userId }, orderBy: { score: "desc" }, take: 8 });
  if (weaknesses.length === 0) return NextResponse.json({ traps: [], global: { correctRate: 0, totalAttempts: 0 } });
  const [totalAttempts, correctAttempts] = await Promise.all([prisma.attempt.count({ where: { userId } }), prisma.attempt.count({ where: { userId, isCorrect: true } })]);
  const correctRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const traps = await Promise.all(weaknesses.map(async w => {
    const field = w.keyType === "theme" ? "theme" : w.keyType === "subtheme" ? "subtheme" : "trapFamily";
    const questions = await prisma.question.findMany({ where: { [field]: w.key }, select: { id: true, prompt: true, trapFamily: true, explanationShort: true, difficulty: true }, take: 5 });
    const qIds = questions.map(q => q.id);
    const [total, wrong] = await Promise.all([prisma.attempt.count({ where: { userId, questionId: { in: qIds } } }), prisma.attempt.count({ where: { userId, questionId: { in: qIds }, isCorrect: false } })]);
    return { key: w.key, keyType: w.keyType, score: w.score, totalAttempts: total, wrongAttempts: wrong, recentQuestions: questions };
  }));
  traps.sort((a, b) => { const ra = a.totalAttempts > 0 ? a.wrongAttempts / a.totalAttempts : 0; const rb = b.totalAttempts > 0 ? b.wrongAttempts / b.totalAttempts : 0; return rb - ra; });
  return NextResponse.json({ traps, global: { correctRate, totalAttempts } });
}
