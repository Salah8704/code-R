// app/api/readiness/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { computeReadiness } from "@/services/algorithm.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const data = await computeReadiness(session.user.id);
  return NextResponse.json(data);
}
