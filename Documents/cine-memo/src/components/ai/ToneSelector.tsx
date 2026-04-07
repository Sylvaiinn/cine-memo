"use client";

import { AI_TONES, type AiTone } from "@/lib/ai-tones";
import { motion } from "framer-motion";

interface ToneSelectorProps {
  selected: AiTone;
  onChange: (tone: AiTone) => void;
}

export default function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(Object.entries(AI_TONES) as [AiTone, (typeof AI_TONES)[AiTone]][]).map(
        ([key, tone], index) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onChange(key)}
            className={`tone-card glass rounded-xl p-5 text-left ${
              selected === key ? "selected" : ""
            }`}
          >
            <div className="text-2xl mb-2">{tone.label.split(" ")[0]}</div>
            <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-white text-sm mb-1">
              {tone.label.split(" ").slice(1).join(" ")}
            </h3>
            <p className="text-slate-400 text-xs">{tone.description}</p>
            {selected === key && (
              <motion.div
                layoutId="tone-check"
                className="mt-3 flex items-center gap-1.5 text-purple-400 text-xs font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sélectionné
              </motion.div>
            )}
          </motion.button>
        )
      )}
    </div>
  );
}
