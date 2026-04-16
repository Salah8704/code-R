import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  const allQ = await prisma.question.findMany({ where: { examLike: true }, include: { choices: { orderBy: { position: "asc" } } } });
  if (allQ.length < 10) return NextResponse.json({ error: "Pas assez de questions" }, { status: 422 });
  const shuffled = allQ.sort(()=>Math.random()-0.5).slice(0, Math.min(40, allQ.length));
  const exam = await prisma.examResult.create({ data: { userId, score: 0, totalQ: shuffled.length, items: { create: shuffled.map((q,i)=>({ questionId: q.id, position: i, isCorrect: false })) } } });
  const questions = shuffled.map(q=>({...q, choices: q.choices.map(({isCorrect:_,...c})=>c)}));
  return NextResponse.json({ examId: exam.id, questions });
}