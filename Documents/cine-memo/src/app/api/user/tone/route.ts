import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AI_TONES, type AiTone } from "@/lib/ai-tones";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiTone: true },
  });

  return NextResponse.json({ aiTone: user?.aiTone ?? "sarcastique" });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { tone } = await req.json();

  if (!tone || !(tone in AI_TONES)) {
    return NextResponse.json({ error: "Ton invalide" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  await prisma.user.update({
    where: { id: userId },
    data: { aiTone: tone as AiTone },
  });

  return NextResponse.json({ aiTone: tone });
}
