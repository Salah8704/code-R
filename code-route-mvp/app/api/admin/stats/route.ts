import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const [totalUsers, totalSeries, totalAttempts, readyUsers, recentActive] = await Promise.all([
    prisma.user.count(),
    prisma.series.count({ where: { endedAt: { not: null } } }),
    prisma.attempt.count(),
    prisma.readinessSnapshot.count({
      where: { level: { in: ["pret", "tres_pret"] } },
    }),
    prisma.attempt.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  const scores = await prisma.series.findMany({
    where: { endedAt: { not: null }, score: { not: null } },
    select: { score: true },
    take: 100,
    orderBy: { endedAt: "desc" },
  });

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, x) => s + (x.score ?? 0), 0) / scores.length)
    : 0;

  return NextResponse.json({
    totalUsers,
    activeToday: recentActive.length,
    totalSeries,
    totalAttempts,
    avgScore,
    readyUsers,
  });
}
