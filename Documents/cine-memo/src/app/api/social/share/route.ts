import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — Créer un lien de partage
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // Vérifier si un profil partagé existe déjà
  const existing = await prisma.sharedProfile.findFirst({
    where: { ownerId: userId, isPublic: true },
  });

  if (existing) {
    return NextResponse.json({ shareToken: existing.shareToken });
  }

  const profile = await prisma.sharedProfile.create({
    data: { ownerId: userId },
  });

  return NextResponse.json({ shareToken: profile.shareToken }, { status: 201 });
}

// DELETE — Supprimer le lien de partage
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  await prisma.sharedProfile.deleteMany({
    where: { ownerId: userId },
  });

  return NextResponse.json({ success: true });
}
