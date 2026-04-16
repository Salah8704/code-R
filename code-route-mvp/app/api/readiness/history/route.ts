// app/api/readiness/history/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });
  const snapshots = await prisma.readinessSnapshot.findMany({ where: { userId: session.user.id }, orderBy: { computedAt: "asc" }, take: 20, select: { score: true, computedAt: true, level: true } });
  return NextResponse.json({ snapshots });
}
