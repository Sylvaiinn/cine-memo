// ── Groq LLM Client ── (serveur uniquement)
import Groq from "groq-sdk";
import { AI_TONES, type AiTone } from "./ai-tones";

export { AI_TONES, type AiTone };

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Initialisation lazy — évite l'instanciation au chargement du module côté client
let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

// ── Génération de résumé ──
export async function generateSummary(
  seriesName: string,
  seriesOverview: string,
  seasonNumber: number,
  episodeCount: number,
  tone: AiTone
): Promise<string> {
  const toneConfig = AI_TONES[tone];

  const response = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: toneConfig.systemPrompt,
      },
      {
        role: "user",
        content: `Résume la saison ${seasonNumber} de la série "${seriesName}".

Contexte de la série : ${seriesOverview}
Cette saison contient ${episodeCount} épisodes.

Instructions :
- Fais un résumé captivant de 150-250 mots
- Respecte strictement le ton demandé
- Mentionne les moments clés et les retournements de situation
- Ne spoile PAS les saisons suivantes
- Sois divertissant et engageant`,
      },
    ],
    temperature: 0.85,
    max_tokens: 600,
  });

  return response.choices[0]?.message?.content || "Résumé indisponible.";
}

// ── Critique du profil ──
export async function generateCritic(
  seriesList: { name: string; status: string; rating: number | null }[],
  tone: AiTone
): Promise<string> {
  const toneConfig = AI_TONES[tone];
  const seriesText = seriesList
    .map((s) => `- ${s.name} (${s.status}${s.rating ? `, note: ${s.rating}/10` : ""})`)
    .join("\n");

  const response = await getGroq().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: toneConfig.systemPrompt,
      },
      {
        role: "user",
        content: `Analyse ce profil de spectateur de séries et fais une critique humoristique personnalisée :

Séries suivies :
${seriesText}

Instructions :
- Fais une analyse du "type de spectateur" (ex: "Le binge-watcher compulsif", "L'intellectuel du canapé")
- Commente les goûts avec humour (en restant bienveillant)
- Propose 3 recommandations personnalisées basées sur ces goûts
- Format : paragraphe d'analyse (~150 mots) puis 3 recommandations avec justification
- Respecte strictement le ton demandé`,
      },
    ],
    temperature: 0.9,
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content || "Critique indisponible.";
}
