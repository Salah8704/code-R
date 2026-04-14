// lib/adminGuard.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  return { userId: session.user.id };
}
