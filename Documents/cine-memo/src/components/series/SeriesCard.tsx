"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";

interface SeriesCardProps {
  id?: string;
  tmdbId: number;
  name: string;
  posterPath: string | null;
  status?: string;
  rating?: number | null;
  voteAverage?: number;
  onClick?: () => void;
  index?: number;
}

export default function SeriesCard({
  name,
  posterPath,
  status,
  rating,
  voteAverage,
  onClick,
  index = 0,
}: SeriesCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  const statusBadge = status
    ? {
        WATCHED: { label: "✓ Vue", class: "badge-watched" },
        WATCHING: { label: "▶ En cours", class: "badge-watching" },
        TO_WATCH: { label: "⏳ À voir", class: "badge-to-watch" },
      }[status]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="series-card"
    >
      <div
        ref={cardRef}
        className="series-card-inner relative rounded-xl overflow-hidden cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          transition:
            "transform 0.15s ease-out, box-shadow 0.3s ease",
        }}
      >
        {/* Poster Image */}
        <div className="aspect-[2/3] relative">
          <Image
            src={getPosterUrl(posterPath, "w500")}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={!posterPath}
          />

          {/* Gradient Overlay */}
          <div className="gradient-overlay-bottom absolute inset-0" />

          {/* Glow Border on Hover */}
          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-purple-500/30 transition-colors duration-300" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
            {statusBadge && (
              <span
                className={`${statusBadge.class} text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm`}
              >
                {statusBadge.label}
              </span>
            )}
            {voteAverage !== undefined && voteAverage > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-amber-400">
                ★ {voteAverage.toFixed(1)}
              </span>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-white text-sm leading-tight line-clamp-2 drop-shadow-lg">
              {name}
            </h3>
            {rating !== null && rating !== undefined && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-amber-400 text-xs">Ma note :</span>
                <span className="text-amber-400 font-bold text-xs">
                  {rating}/10
                </span>
              </div>
            )}
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
