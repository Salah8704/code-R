import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const [totalUsers, totalSeries, totalAttempts, readyUsers, recentActive] = await Promise.all([
    prisma.user.count(),
    prisma.series.count({ where: { endedAt: { not: null } } }),
    prisma.attempt.count(),
    prisma.readinessSnapshot.count({ where: { level: { in: ["pret", "tres_pret"] } } }),
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

  return NextResponse.json({ totalUsers, activeToday: recentActive.length, totalSeries, totalAttempts, avgScore, readyUsers });
}
