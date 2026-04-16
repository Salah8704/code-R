// app/api/quiz/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { finalizeSeries, shouldForcePause } from "@/services/algorithm.service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });
  const userId = session.user.id;
  const { seriesId } = await req.json();
  if (!seriesId) return NextResponse.json({ error: "seriesId requis" }, { status: 400 });
  const result = await finalizeSeries(seriesId);
  const pauseStatus = await shouldForcePause(userId);
  return NextResponse.json({ ...result, pauseActive: pauseStatus.forced, pauseEndsAt: pauseStatus.pauseEndsAt });
}
