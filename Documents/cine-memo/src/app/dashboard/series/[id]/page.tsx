"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPosterUrl, getBackdropUrl } from "@/lib/tmdb";
import MarkdownText from "@/components/ui/MarkdownText";

interface SeriesDetailData {
  id: string;
  tmdbSeriesId: number;
  seriesName: string;
  posterPath: string | null;
  status: string;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  rating: number | null;
  summaries: { id: string; seasonNumber: number; summary: string; tone: string }[];
}

interface TMDBDetailData {
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  genres: { id: number; name: string }[];
  seasons: {
    season_number: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
  }[];
}

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [series, setSeries] = useState<SeriesDetailData | null>(null);
  const [tmdb, setTmdb] = useState<TMDBDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState<number | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/series");
        if (res.ok) {
          const allSeries = await res.json();
          const found = allSeries.find((s: SeriesDetailData) => s.id === id);
          if (found) {
            setSeries(found);
            // Fetch TMDB details
            const tmdbRes = await fetch(`/api/tmdb/series/${found.tmdbSeriesId}`);
            if (tmdbRes.ok) {
              setTmdb(await tmdbRes.json());
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!series) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/series/${series.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSeries((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const updateProgress = async (season: number) => {
    if (!series) return;
    try {
      const res = await fetch(`/api/series/${series.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSeason: season, status: "WATCHING" }),
      });
      if (res.ok) {
        setSeries((prev) =>
          prev ? { ...prev, currentSeason: season, status: "WATCHING" } : null
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateSummary = async (seasonNumber: number) => {
    if (!series) return;
    setSummaryLoading(seasonNumber);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSeriesId: series.id, seasonNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeries((prev) => {
          if (!prev) return null;
          const existing = prev.summaries.find(
            (s) => s.seasonNumber === seasonNumber
          );
          if (existing) return prev;
          return {
            ...prev,
            summaries: [...prev.summaries, data],
          };
        });
      } else {
        alert(data.error || "Erreur");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setSummaryLoading(null);
    }
  };

  const deleteSeries = async () => {
    if (!series || !confirm("Supprimer cette série de votre liste ?")) return;
    try {
      await fetch(`/api/series/${series.id}`, { method: "DELETE" });
      window.location.href = "/dashboard";
    } catch {
      alert("Erreur");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Série non trouvée</p>
        <Link href="/dashboard" className="text-purple-400 text-sm mt-2 inline-block">
          ← Retour au dashboard
        </Link>
      </div>
    );
  }

  const statusOptions = [
    { value: "TO_WATCH", label: "⏳ À voir", class: "badge-to-watch" },
    { value: "WATCHING", label: "▶ En cours", class: "badge-watching" },
    { value: "WATCHED", label: "✓ Vue", class: "badge-watched" },
  ];

  return (
    <div className="space-y-8">
      {/* Backdrop Hero */}
      {tmdb?.backdrop_path && (
        <div className="relative -mx-6 -mt-8 h-64 sm:h-80 overflow-hidden">
          <Image
            src={getBackdropUrl(tmdb.backdrop_path)}
            alt={series.seriesName}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="gradient-overlay-full absolute inset-0" />
        </div>
      )}

      {/* Series Info Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Poster */}
        <div className="w-40 flex-shrink-0">
          <div className="aspect-[2/3] relative rounded-xl overflow-hidden glow-purple">
            <Image
              src={getPosterUrl(series.posterPath, "w500")}
              alt={series.seriesName}
              fill
              className="object-cover"
              unoptimized={!series.posterPath}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <Link
              href="/dashboard"
              className="text-purple-400 text-sm hover:text-purple-300 mb-2 inline-block"
            >
              ← Dashboard
            </Link>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold text-white">
              {series.seriesName}
            </h1>
            {tmdb && (
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                <span>★ {tmdb.vote_average?.toFixed(1)}</span>
                <span>•</span>
                <span>{tmdb.first_air_date?.split("-")[0]}</span>
                <span>•</span>
                <span>{tmdb.number_of_seasons} saisons</span>
                {tmdb.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="px-2 py-0.5 rounded-full bg-white/5 text-xs"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {tmdb?.overview && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
              {tmdb.overview}
            </p>
          )}

          {/* Status Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStatus(opt.value)}
                disabled={statusUpdating}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  series.status === opt.value
                    ? `${opt.class} ring-1 ring-current`
                    : "glass text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={deleteSeries}
              className="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all ml-auto"
            >
              🗑 Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Seasons Grid with AI Summaries */}
      <div>
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-white mb-4">
          Saisons & Résumés IA
        </h2>

        <div className="space-y-4">
          {(tmdb?.seasons || [])
            .filter((s) => s.season_number > 0)
            .map((season) => {
              const summary = series.summaries.find(
                (s) => s.seasonNumber === season.season_number
              );
              const isLocked =
                series.status === "TO_WATCH" ||
                (series.status === "WATCHING" &&
                  season.season_number > series.currentSeason);
              const isCurrent =
                series.status === "WATCHING" &&
                season.season_number === series.currentSeason;

              return (
                <motion.div
                  key={season.season_number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: season.season_number * 0.05 }}
                  className={`glass rounded-xl p-5 ${
                    isCurrent ? "ring-1 ring-purple-500/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {season.poster_path && (
                        <div className="w-12 h-16 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={getPosterUrl(season.poster_path, "w185")}
                            alt={season.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-medium text-sm">
                          {season.name}
                        </h3>
                        <p className="text-slate-400 text-xs">
                          {season.episode_count} épisodes
                        </p>
                        {isCurrent && (
                          <span className="inline-block mt-1 text-xs text-purple-400 font-medium">
                            📍 En cours
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isLocked && season.season_number > series.currentSeason && (
                        <button
                          onClick={() => updateProgress(season.season_number)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white glass transition-all"
                        >
                          J&apos;en suis là
                        </button>
                      )}
                      {isLocked ? (
                        <span className="text-xs text-slate-500 px-3 py-1.5">
                          🔒 Anti-spoil
                        </span>
                      ) : summary ? (
                        <span className="text-xs text-green-400 px-3 py-1.5">
                          ✓ Résumé disponible
                        </span>
                      ) : (
                        <button
                          onClick={() => generateSummary(season.season_number)}
                          disabled={summaryLoading === season.season_number}
                          className="px-3 py-1.5 rounded-lg text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all disabled:opacity-50"
                        >
                          {summaryLoading === season.season_number ? (
                            <span className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                              Génération...
                            </span>
                          ) : (
                            "🤖 Générer résumé"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Content */}
                  <AnimatePresence>
                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-white/5"
                      >
                        <MarkdownText text={summary.summary} className="text-slate-300 text-sm" />
                        <span className="inline-block mt-2 text-xs text-slate-500">
                          Ton : {summary.tone}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
