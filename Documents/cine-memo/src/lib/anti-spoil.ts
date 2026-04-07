// ── Anti-Spoil Logic ──
// compare progression between two users to determine what can be shown

import { prisma } from "./prisma";

export interface SpoilFilteredSeries {
  id: string;
  tmdbSeriesId: number;
  seriesName: string;
  posterPath: string | null;
  status: string;
  currentSeason: number;
  totalSeasons: number;
  rating: number | null;
  spoilLevel: "SAFE" | "PARTIAL" | "NOT_STARTED" | "NOT_TRACKED";
  visibleSeasons: number;
  summaries: {
    id: string;
    seasonNumber: number;
    summary: string;
    tone: string;
  }[];
}

export async function getAntiSpoilProfile(
  ownerId: string,
  visitorId: string | null
): Promise<SpoilFilteredSeries[]> {
  // Charger les séries du propriétaire avec résumés
  const ownerSeries = await prisma.userSeries.findMany({
    where: { userId: ownerId },
    include: {
      summaries: {
        orderBy: { seasonNumber: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Si pas de visiteur connecté → mode public, aucun résumé
  if (!visitorId) {
    return ownerSeries.map((series) => ({
      id: series.id,
      tmdbSeriesId: series.tmdbSeriesId,
      seriesName: series.seriesName,
      posterPath: series.posterPath,
      status: series.status,
      currentSeason: series.currentSeason,
      totalSeasons: series.totalSeasons,
      rating: series.rating,
      spoilLevel: "NOT_TRACKED" as const,
      visibleSeasons: 0,
      summaries: [],
    }));
  }

  // Charger les séries du visiteur
  const visitorSeries = await prisma.userSeries.findMany({
    where: { userId: visitorId },
  });

  const visitorMap = new Map(
    visitorSeries.map((s) => [s.tmdbSeriesId, s])
  );

  return ownerSeries.map((series) => {
    const visitorProgress = visitorMap.get(series.tmdbSeriesId);

    // L'ami n'a pas cette série
    if (!visitorProgress) {
      return {
        id: series.id,
        tmdbSeriesId: series.tmdbSeriesId,
        seriesName: series.seriesName,
        posterPath: series.posterPath,
        status: series.status,
        currentSeason: series.currentSeason,
        totalSeasons: series.totalSeasons,
        rating: series.rating,
        spoilLevel: "NOT_STARTED" as const,
        visibleSeasons: 0,
        summaries: [],
      };
    }

    // L'ami a tout vu → tout montrer
    if (visitorProgress.status === "WATCHED") {
      return {
        id: series.id,
        tmdbSeriesId: series.tmdbSeriesId,
        seriesName: series.seriesName,
        posterPath: series.posterPath,
        status: series.status,
        currentSeason: series.currentSeason,
        totalSeasons: series.totalSeasons,
        rating: series.rating,
        spoilLevel: "SAFE" as const,
        visibleSeasons: series.totalSeasons,
        summaries: series.summaries.map((s) => ({
          id: s.id,
          seasonNumber: s.seasonNumber,
          summary: s.summary,
          tone: s.tone,
        })),
      };
    }

    // Comparer saison par saison
    const maxVisibleSeason = visitorProgress.currentSeason;
    const safeSummaries = series.summaries
      .filter((s) => s.seasonNumber <= maxVisibleSeason)
      .map((s) => ({
        id: s.id,
        seasonNumber: s.seasonNumber,
        summary: s.summary,
        tone: s.tone,
      }));

    return {
      id: series.id,
      tmdbSeriesId: series.tmdbSeriesId,
      seriesName: series.seriesName,
      posterPath: series.posterPath,
      status: series.status,
      currentSeason: series.currentSeason,
      totalSeasons: series.totalSeasons,
      rating: series.rating,
      spoilLevel:
        maxVisibleSeason < series.currentSeason
          ? ("PARTIAL" as const)
          : ("SAFE" as const),
      visibleSeasons: maxVisibleSeason,
      summaries: safeSummaries,
    };
  });
}
