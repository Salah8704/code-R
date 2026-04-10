import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const choiceSchema = z.object({ text: z.string().min(1), isCorrect: z.boolean() });
const questionSchema = z.object({ theme: z.string().min(1), subtheme: z.string().min(1), trapFamily: z.string().min(1), difficulty: z.number().int().min(1).max(3), type: z.string().default("qcm"), prompt: z.string().min(1), explanationShort: z.string().min(1), explanationLong: z.string().optional(), hasImage: z.boolean().default(false), choices: z.array(choiceSchema).min(2) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  const questions = await prisma.question.findMany({ orderBy: { createdAt: "desc" }, include: { choices: { orderBy: { position: "asc" } } }, take: 200 });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  let body; try { body = questionSchema.parse(await req.json()); } catch(err) { return NextResponse.json({ error: "Donnees invalides", details: err }, { status: 400 }); }
  const id = `q_${Date.now()}`;
  const question = await prisma.question.create({ data: { id, theme: body.theme, subtheme: body.subtheme, trapFamily: body.trapFamily, difficulty: body.difficulty, type: body.type, prompt: body.prompt, explanationShort: body.explanationShort, explanationLong: body.explanationLong??body.explanationShort, hasImage: body.hasImage, choices: { create: body.choices.map((c,i)=>({ id: `${id}_${i}`, position: i, text: c.text, isCorrect: c.isCorrect })) } }, include: { choices: true } });
  return NextResponse.json(question, { status: 201 });
}