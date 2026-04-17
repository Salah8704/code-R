import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RawQuestion = { id: string; theme: string; subtheme: string; trap_family: string; difficulty: number; type?: string; prompt: string; choices: { id: string; text: string; is_correct: boolean }[]; explanation_short: string; explanation_long?: string; has_image?: boolean; };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  let data: { questions: RawQuestion[] };
  try { data = await req.json(); if (!Array.isArray(data.questions)) throw new Error(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  let imported = 0, skipped = 0; const errors: string[] = [];
  for (const q of data.questions) {
    try {
      await prisma.question.upsert({ where: { id: q.id }, update: { theme:q.theme, subtheme:q.subtheme, trapFamily:q.trap_family, difficulty:q.difficulty, type:q.type??"qcm", prompt:q.prompt, explanationShort:q.explanation_short, explanationLong:q.explanation_long??q.explanation_short, hasImage:q.has_image??false }, create: { id:q.id, theme:q.theme, subtheme:q.subtheme, trapFamily:q.trap_family, difficulty:q.difficulty, type:q.type??"qcm", prompt:q.prompt, explanationShort:q.explanation_short, explanationLong:q.explanation_long??q.explanation_short, hasImage:q.has_image??false, choices:{ create:q.choices.map((c,i)=>({ id:`${q.id}_${c.id}`, position:i, text:c.text, isCorrect:c.is_correct })) } } });
      imported++;
    } catch(err) { errors.push(`${q.id}: ${err}`); skipped++; }
  }
  return NextResponse.json({ imported, skipped, errors });
}