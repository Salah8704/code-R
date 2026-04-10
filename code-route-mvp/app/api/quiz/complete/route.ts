import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { shouldForcePause } from "@/lib/algorithm";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const userId = session.user.id;
  const { seriesId } = await req.json();
  const series = await prisma.series.findUnique({ where: { id: seriesId } });
  if (!series || series.userId !== userId) return NextResponse.json({ error: "Serie introuvable" }, { status: 404 });
  await prisma.series.update({ where: { id: seriesId }, data: { endedAt: new Date() } });
  const block = await prisma.studyBlock.update({ where: { id: series.studyBlockId! }, data: { seriesCompleted: { increment: 1 } } });
  if (shouldForcePause(block.seriesCompleted)) {
    const pauseStart = new Date();
    const pauseEnd = new Date(pauseStart.getTime() + 30*60*1000);
    const pause = await prisma.blockPause.create({ data: { userId, studyBlockId: block.id, startAt: pauseStart, endAt: pauseEnd, status: "active" } });
    return NextResponse.json({ blockComplete: true, pauseUntil: pause.endAt, pauseId: pause.id });
  }
  return NextResponse.json({ blockComplete: false, seriesCompleted: block.seriesCompleted });
}