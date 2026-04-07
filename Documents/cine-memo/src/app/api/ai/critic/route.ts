import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCritic, type AiTone } from "@/lib/groq";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tone = (user?.aiTone || "sarcastique") as AiTone;

  const series = await prisma.userSeries.findMany({
    where: { userId },
    select: { seriesName: true, status: true, rating: true },
  });

  if (series.length < 2) {
    return NextResponse.json({
      critic: "Ajoutez au moins 2 séries à votre liste pour obtenir une critique personnalisée ! 🎬",
    });
  }

  try {
    const critic = await generateCritic(
      series.map((s) => ({
        name: s.seriesName,
        status: s.status,
        rating: s.rating,
      })),
      tone
    );

    return NextResponse.json({ critic });
  } catch (error) {
    console.error("AI critic error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la critique" },
      { status: 500 }
    );
  }
}
