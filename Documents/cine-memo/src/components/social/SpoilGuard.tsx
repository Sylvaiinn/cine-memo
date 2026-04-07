"use client";

import { motion } from "framer-motion";

interface SpoilGuardProps {
  spoilLevel: "SAFE" | "PARTIAL" | "NOT_STARTED" | "NOT_TRACKED";
  visibleSeasons: number;
  totalSeasons: number;
  children: React.ReactNode;
}

export default function SpoilGuard({
  spoilLevel,
  visibleSeasons,
  totalSeasons,
  children,
}: SpoilGuardProps) {
  if (spoilLevel === "SAFE") {
    return <>{children}</>;
  }

  const messages = {
    NOT_TRACKED: "🔒 Connectez-vous pour voir les détails",
    NOT_STARTED: "🆕 Vous n'avez pas encore commencé cette série",
    PARTIAL: `🔒 Spoiler Alert ! Vous en êtes à la saison ${visibleSeasons}/${totalSeasons}`,
  };

  return (
    <div className="spoil-container rounded-xl overflow-hidden">
      {/* Blurred content */}
      <div className="spoil-blur">{children}</div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="spoil-overlay glass-strong rounded-xl"
        onClick={(e) => {
          e.stopPropagation();
          const el = e.currentTarget;
          el.classList.add("animate-shake");
          setTimeout(() => el.classList.remove("animate-shake"), 500);
        }}
      >
        <div className="text-center px-6 py-8">
          <div className="text-4xl mb-3">
            {spoilLevel === "NOT_STARTED" ? "🎬" : "🔐"}
          </div>
          <p className="text-white font-[family-name:var(--font-outfit)] font-semibold mb-2">
            {messages[spoilLevel]}
          </p>
          <p className="text-slate-400 text-sm">
            {spoilLevel === "PARTIAL"
              ? "Rattrapez votre retard pour voir les résumés !"
              : spoilLevel === "NOT_STARTED"
              ? "Ajoutez cette série à votre liste pour comparer"
              : "Créez un compte pour profiter de l'anti-spoil"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
