import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — Liste des séries de l'utilisateur
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const series = await prisma.userSeries.findMany({
    where: { userId },
    include: { summaries: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(series);
}

// POST — Ajouter une série
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { tmdbSeriesId, seriesName, posterPath, status, totalSeasons } =
    await req.json();

  if (!tmdbSeriesId || !seriesName) {
    return NextResponse.json(
      { error: "tmdbSeriesId et seriesName sont requis" },
      { status: 400 }
    );
  }

  try {
    const series = await prisma.userSeries.create({
      data: {
        userId,
        tmdbSeriesId,
        seriesName,
        posterPath,
        status: status || "TO_WATCH",
        totalSeasons: totalSeasons || 0,
      },
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cette série est déjà dans votre liste" },
        { status: 409 }
      );
    }
    throw error;
  }
}
