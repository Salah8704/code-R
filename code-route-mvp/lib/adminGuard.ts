import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  return null;
}
