import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAntiSpoilProfile } from "@/lib/anti-spoil";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Trouver le profil partagé
  const sharedProfile = await prisma.sharedProfile.findUnique({
    where: { shareToken: token },
    include: {
      owner: {
        select: { id: true, name: true, avatarUrl: true, aiTone: true },
      },
    },
  });

  if (!sharedProfile || !sharedProfile.isPublic) {
    return NextResponse.json(
      { error: "Profil non trouvé ou non public" },
      { status: 404 }
    );
  }

  // Récupérer l'ID du visiteur (s'il est connecté)
  const session = await getServerSession(authOptions);
  const visitorId = session?.user
    ? (session.user as { id: string }).id
    : null;

  // Appliquer le filtre anti-spoil
  const filteredSeries = await getAntiSpoilProfile(
    sharedProfile.ownerId,
    visitorId
  );

  return NextResponse.json({
    owner: sharedProfile.owner,
    series: filteredSeries,
    isVisitorLoggedIn: !!visitorId,
  });
}
