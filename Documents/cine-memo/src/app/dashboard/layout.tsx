"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToneSelector from "@/components/ai/ToneSelector";
import { AI_TONES, type AiTone } from "@/lib/ai-tones";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showTonePanel, setShowTonePanel] = useState(false);
  const [currentTone, setCurrentTone] = useState<AiTone>("sarcastique");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Charger le ton actuel de l'utilisateur
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/tone")
      .then((r) => r.json())
      .then((d) => {
        if (d.aiTone && d.aiTone in AI_TONES) {
          setCurrentTone(d.aiTone as AiTone);
        }
      })
      .catch(() => {});
  }, [status]);

  const handleToneChange = async (tone: AiTone) => {
    setCurrentTone(tone);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/user/tone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const toneLabel = AI_TONES[currentTone].label;

  return (
    <div className="min-h-screen">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-outfit)] text-lg font-bold text-white flex items-center gap-2"
          >
            <span className="text-xl">🎬</span>
            Ciné-Mémo
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tone Button */}
            <button
              onClick={() => setShowTonePanel((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                showTonePanel
                  ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Changer le ton de l'IA"
            >
              <span>{toneLabel.split(" ")[0]}</span>
              <span className="hidden sm:inline text-xs">{toneLabel.split(" ").slice(1).join(" ")}</span>
            </button>

            <span className="text-sm text-slate-400 hidden sm:block">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tone Panel — slide-down sous la navbar */}
        <AnimatePresence>
          {showTonePanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-outfit)] font-semibold text-white text-sm">
                      Ton de l&apos;IA
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Sélectionnez comment l&apos;IA vous résume les séries
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saving && (
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    )}
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-green-400 font-medium"
                      >
                        ✓ Enregistré
                      </motion.span>
                    )}
                    <button
                      onClick={() => setShowTonePanel(false)}
                      className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <ToneSelector selected={currentTone} onChange={handleToneChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
