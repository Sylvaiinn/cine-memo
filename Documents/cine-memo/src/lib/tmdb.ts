// ── TMDB API Client ──
// Proxy server-side pour protéger la clé API

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "fr-FR");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache 1 heure
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Types TMDB ──
export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  popularity: number;
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBSeries[];
  total_pages: number;
  total_results: number;
}

// ── API Functions ──
export async function searchSeries(query: string): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>("/search/tv", { query });
}

export async function getSeriesDetails(id: number): Promise<TMDBSeries> {
  return tmdbFetch<TMDBSeries>(`/tv/${id}`, {
    append_to_response: "seasons",
  });
}

export async function getSeasonDetails(seriesId: number, seasonNumber: number): Promise<TMDBSeason> {
  return tmdbFetch<TMDBSeason>(`/tv/${seriesId}/season/${seasonNumber}`);
}

export async function getTrending(): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>("/trending/tv/week");
}

export async function getPopular(): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>("/tv/popular");
}

// ── Image Helpers ──
export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string {
  if (!path) return "/images/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280"): string {
  if (!path) return "/images/no-backdrop.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
