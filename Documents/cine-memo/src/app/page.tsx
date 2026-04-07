"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-outfit)] text-xl font-bold text-white flex items-center gap-2"
          >
            <span className="text-2xl">🎬</span>
            Ciné-Mémo
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Mon Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse-glow" />
              Propulsé par l&apos;IA — Llama 4 Scout
            </div>

            <h1 className="font-[family-name:var(--font-outfit)] text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Votre mémoire{" "}
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                séries
              </span>
              ,<br />
              augmentée par l&apos;
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                IA
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Suivez vos séries, générez des résumés personnalisés avec le ton
              de votre choix, et partagez votre profil sans spoiler vos amis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-xl glass text-slate-200 font-medium text-lg hover:bg-white/10 transition-all"
              >
                Découvrir ↓
              </Link>
            </div>
          </motion.div>

          {/* Floating Cards Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="flex justify-center gap-4 sm:gap-6">
              {[
                { emoji: "🎭", tone: "Sarcastique", color: "from-purple-500/20 to-violet-500/20" },
                { emoji: "🏴‍☠️", tone: "Pirate", color: "from-amber-500/20 to-orange-500/20" },
                { emoji: "🎓", tone: "Professeur", color: "from-blue-500/20 to-cyan-500/20" },
              ].map((card, i) => (
                <motion.div
                  key={card.tone}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`glass rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${card.color}`}
                >
                  <div className="text-3xl sm:text-4xl mb-3">{card.emoji}</div>
                  <p className="text-white font-[family-name:var(--font-outfit)] font-semibold text-sm sm:text-base">
                    Ton {card.tone}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-bold text-white text-center mb-16"
          >
            Tout ce dont vous avez besoin
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🤖",
                title: "Résumés IA Personnalisés",
                description:
                  "Choisissez votre ton : Sarcastique, Pirate, Professeur... L'IA résume chaque saison à votre manière.",
              },
              {
                icon: "🔒",
                title: "Anti-Spoil Intelligent",
                description:
                  "Partagez votre profil. Le système compare vos avancements et masque automatiquement les spoilers.",
              },
              {
                icon: "🎯",
                title: "IA Critic",
                description:
                  "Obtenez une analyse humoristique de vos goûts et des recommandations personnalisées.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 hover:bg-white/5 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-white text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-slate-500 text-sm">
          <span>© 2026 Ciné-Mémo</span>
          <span>Propulsé par TMDB & Groq</span>
        </div>
      </footer>
    </main>
  );
}
