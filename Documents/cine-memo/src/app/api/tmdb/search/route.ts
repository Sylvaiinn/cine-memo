import { NextRequest, NextResponse } from "next/server";
import { searchSeries } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchSeries(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
