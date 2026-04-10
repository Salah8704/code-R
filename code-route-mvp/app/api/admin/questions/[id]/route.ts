import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  try { await prisma.question.delete({ where: { id: params.id } }); return NextResponse.json({ deleted: true }); }
  catch { return NextResponse.json({ error: "Question introuvable" }, { status: 404 }); }
}