import { NextRequest, NextResponse } from "next/server";
import { getSeriesDetails } from "@/lib/tmdb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getSeriesDetails(parseInt(id));
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB series error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
