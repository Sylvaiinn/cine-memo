import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — Modifier le statut/progression d'une série
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const body = await req.json();

  const series = await prisma.userSeries.findFirst({
    where: { id, userId },
  });

  if (!series) {
    return NextResponse.json({ error: "Série non trouvée" }, { status: 404 });
  }

  const updated = await prisma.userSeries.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.currentSeason !== undefined && {
        currentSeason: body.currentSeason,
      }),
      ...(body.currentEpisode !== undefined && {
        currentEpisode: body.currentEpisode,
      }),
      ...(body.rating !== undefined && { rating: body.rating }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE — Retirer une série
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const series = await prisma.userSeries.findFirst({
    where: { id, userId },
  });

  if (!series) {
    return NextResponse.json({ error: "Série non trouvée" }, { status: 404 });
  }

  await prisma.userSeries.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
