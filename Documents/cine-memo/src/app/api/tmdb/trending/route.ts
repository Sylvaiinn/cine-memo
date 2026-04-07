import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB trending error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
