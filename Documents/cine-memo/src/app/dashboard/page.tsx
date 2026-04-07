"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SeriesCard from "@/components/series/SeriesCard";
import SearchBar from "@/components/series/SearchBar";
import MarkdownText from "@/components/ui/MarkdownText";
import type { TMDBSeries } from "@/lib/tmdb";

interface UserSeriesData {
  id: string;
  tmdbSeriesId: number;
  seriesName: string;
  posterPath: string | null;
  status: string;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  rating: number | null;
}

type FilterTab = "ALL" | "WATCHING" | "WATCHED" | "TO_WATCH";

export default function DashboardPage() {
  const [series, setSeries] = useState<UserSeriesData[]>([]);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showCritic, setShowCritic] = useState(false);
  const [critic, setCritic] = useState("");
  const [criticLoading, setCriticLoading] = useState(false);

  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch("/api/series");
      if (res.ok) {
        const data = await res.json();
        setSeries(data);
      }
    } catch (err) {
      console.error("Failed to fetch series:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const handleAddSeries = async (tmdbSeries: TMDBSeries) => {
    setAdding(true);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbSeriesId: tmdbSeries.id,
          seriesName: tmdbSeries.name,
          posterPath: tmdbSeries.poster_path,
          status: "TO_WATCH",
          totalSeasons: tmdbSeries.number_of_seasons || 0,
        }),
      });

      if (res.ok) {
        fetchSeries();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch("/api/social/share", { method: "POST" });
      const data = await res.json();
      const link = `${window.location.origin}/share/${data.shareToken}`;
      setShareLink(link);
      await navigator.clipboard.writeText(link);
    } catch {
      alert("Erreur lors de la création du lien");
    }
  };

  const handleCritic = async () => {
    setShowCritic(true);
    setCriticLoading(true);
    try {
      const res = await fetch("/api/ai/critic");
      const data = await res.json();
      setCritic(data.critic || data.error);
    } catch {
      setCritic("Erreur lors de la génération de la critique");
    } finally {
      setCriticLoading(false);
    }
  };

  const filtered =
    filter === "ALL" ? series : series.filter((s) => s.status === filter);

  const stats = {
    total: series.length,
    watching: series.filter((s) => s.status === "WATCHING").length,
    watched: series.filter((s) => s.status === "WATCHED").length,
    toWatch: series.filter((s) => s.status === "TO_WATCH").length,
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "Toutes", count: stats.total },
    { key: "WATCHING", label: "▶ En cours", count: stats.watching },
    { key: "WATCHED", label: "✓ Vues", count: stats.watched },
    { key: "TO_WATCH", label: "⏳ À voir", count: stats.toWatch },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold text-white">
            Mon Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {stats.total} série{stats.total > 1 ? "s" : ""} suivie
            {stats.total > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCritic}
            className="px-4 py-2.5 rounded-lg glass text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            🎯 IA Critic
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-sm font-medium text-purple-300 hover:bg-purple-600/30 transition-all"
          >
            🔗 Partager
          </button>
        </div>
      </div>

      {/* Share Link Toast */}
      <AnimatePresence>
        {shareLink && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-white text-sm font-medium">
                ✅ Lien copié dans le presse-papier !
              </p>
              <p className="text-slate-400 text-xs mt-1 break-all">
                {shareLink}
              </p>
            </div>
            <button
              onClick={() => setShareLink("")}
              className="text-slate-400 hover:text-white ml-4"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Critic Panel */}
      <AnimatePresence>
        {showCritic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-outfit)] font-semibold text-white flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Analyse IA de vos goûts
              </h2>
              <button
                onClick={() => setShowCritic(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {criticLoading ? (
              <div className="space-y-3">
                <div className="h-4 rounded animate-shimmer" />
                <div className="h-4 rounded animate-shimmer w-3/4" />
                <div className="h-4 rounded animate-shimmer w-1/2" />
              </div>
            ) : (
              <MarkdownText text={critic} className="text-slate-300 text-sm" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <SearchBar onSelect={handleAddSeries} />
        {adding && (
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.key
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}{" "}
            <span className="text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-white mb-2">
            {filter === "ALL"
              ? "Aucune série encore !"
              : "Aucune série dans cette catégorie"}
          </h3>
          <p className="text-slate-400 text-sm">
            Utilisez la barre de recherche pour ajouter vos premières séries
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((s, i) => (
            <SeriesCard
              key={s.id}
              id={s.id}
              tmdbId={s.tmdbSeriesId}
              name={s.seriesName}
              posterPath={s.posterPath}
              status={s.status}
              rating={s.rating}
              index={i}
              onClick={() =>
                (window.location.href = `/dashboard/series/${s.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
