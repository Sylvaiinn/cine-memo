"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import SpoilGuard from "@/components/social/SpoilGuard";

interface SharedSeriesData {
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
  summaries: { id: string; seasonNumber: number; summary: string; tone: string }[];
}

interface SharedProfileData {
  owner: { name: string; avatarUrl: string | null; aiTone: string };
  series: SharedSeriesData[];
  isVisitorLoggedIn: boolean;
}

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SharedProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/social/profile/${token}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setError("Profil non trouvé ou non public");
        }
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-white mb-2">
            {error || "Profil introuvable"}
          </h1>
          <Link href="/" className="text-purple-400 text-sm">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const { owner, series, isVisitorLoggedIn } = data;

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-outfit)] text-lg font-bold text-white flex items-center gap-2"
          >
            <span className="text-xl">🎬</span>
            Ciné-Mémo
          </Link>
          {!isVisitorLoggedIn && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
            >
              Se connecter
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl mx-auto mb-4">
            {owner.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
            Profil de {owner.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {series.length} série{series.length > 1 ? "s" : ""} suivie
            {series.length > 1 ? "s" : ""} • Ton IA :{" "}
            <span className="text-purple-400 capitalize">{owner.aiTone}</span>
          </p>

          {!isVisitorLoggedIn && (
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              💡 Connectez-vous pour activer le filtre anti-spoil intelligent
            </div>
          )}
        </motion.div>

        {/* Series Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {series.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SpoilGuard
                spoilLevel={s.spoilLevel}
                visibleSeasons={s.visibleSeasons}
                totalSeasons={s.totalSeasons}
              >
                <div className="rounded-xl overflow-hidden">
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={getPosterUrl(s.posterPath, "w500")}
                      alt={s.seriesName}
                      fill
                      className="object-cover"
                      unoptimized={!s.posterPath}
                    />
                    <div className="gradient-overlay-bottom absolute inset-0" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {s.seriesName}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Saison {s.currentSeason}/{s.totalSeasons}
                      </p>
                      {s.rating && (
                        <p className="text-amber-400 text-xs mt-0.5">
                          ★ {s.rating}/10
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </SpoilGuard>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
