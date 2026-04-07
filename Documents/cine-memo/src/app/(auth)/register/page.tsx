"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ToneSelector from "@/components/ai/ToneSelector";
import type { AiTone } from "@/lib/groq";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aiTone, setAiTone] = useState<AiTone>("sarcastique");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !password) {
        setError("Tous les champs sont requis");
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit faire au moins 6 caractères");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, aiTone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      // Auto-login après inscription
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Inscription réussie ! Connectez-vous manuellement.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-[family-name:var(--font-outfit)] text-2xl font-bold text-white mb-2"
          >
            <span className="text-3xl">🎬</span>
            Ciné-Mémo
          </Link>
          <p className="text-slate-400">
            {step === 1
              ? "Créez votre compte"
              : "Choisissez le ton de votre IA"}
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div
              className={`w-8 h-1 rounded-full ${
                step >= 1 ? "bg-purple-500" : "bg-white/10"
              }`}
            />
            <div
              className={`w-8 h-1 rounded-full ${
                step >= 2 ? "bg-purple-500" : "bg-white/10"
              }`}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nom / Pseudo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="Votre pseudo"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="Min. 6 caractères"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Étape suivante →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-white text-lg mb-1">
                  Comment votre IA doit-elle vous parler ?
                </h3>
                <p className="text-slate-400 text-sm mb-5">
                  Ce ton sera utilisé pour tous vos résumés de séries. Vous pourrez
                  le changer plus tard.
                </p>
                <ToneSelector selected={aiTone} onChange={setAiTone} />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-lg glass text-slate-300 font-medium hover:bg-white/10 transition-all"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Inscription...
                    </span>
                  ) : (
                    "Créer mon compte 🎬"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-sm text-slate-400 mt-5">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Se connecter
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
