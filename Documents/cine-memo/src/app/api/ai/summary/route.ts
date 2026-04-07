import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSummary, type AiTone } from "@/lib/groq";
import { getSeriesDetails, getSeasonDetails } from "@/lib/tmdb";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { userSeriesId, seasonNumber } = await req.json();

  if (!userSeriesId || seasonNumber === undefined) {
    return NextResponse.json(
      { error: "userSeriesId et seasonNumber requis" },
      { status: 400 }
    );
  }

  // Vérifier que la série appartient à l'utilisateur
  const userSeries = await prisma.userSeries.findFirst({
    where: { id: userSeriesId, userId },
  });

  if (!userSeries) {
    return NextResponse.json({ error: "Série non trouvée" }, { status: 404 });
  }

  // ── GARDE ANTI-SPOIL ──
  // Ne pas générer de résumé si la série est "TO_WATCH"
  if (userSeries.status === "TO_WATCH") {
    return NextResponse.json(
      { error: "🔒 Anti-spoil : ajoutez cette série en cours pour débloquer les résumés" },
      { status: 403 }
    );
  }

  // Ne pas générer au-delà de la saison courante si "WATCHING"
  if (userSeries.status === "WATCHING" && seasonNumber > userSeries.currentSeason) {
    return NextResponse.json(
      { error: "🔒 Anti-spoil : vous n'avez pas encore vu cette saison" },
      { status: 403 }
    );
  }

  // Récupérer le ton de l'utilisateur
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tone = (user?.aiTone || "sarcastique") as AiTone;

  // Vérifier si un résumé existe déjà pour ce ton
  const existing = await prisma.aISummary.findFirst({
    where: { userSeriesId, seasonNumber, tone },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  // Générer le résumé via Groq
  try {
    const seriesDetails = await getSeriesDetails(userSeries.tmdbSeriesId);
    const seasonDetails = await getSeasonDetails(
      userSeries.tmdbSeriesId,
      seasonNumber
    );

    const summary = await generateSummary(
      seriesDetails.name,
      seriesDetails.overview,
      seasonNumber,
      seasonDetails.episode_count,
      tone
    );

    const saved = await prisma.aISummary.create({
      data: {
        userSeriesId,
        seasonNumber,
        tone,
        summary,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du résumé" },
      { status: 500 }
    );
  }
}
