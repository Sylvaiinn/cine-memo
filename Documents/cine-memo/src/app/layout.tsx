import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ciné-Mémo | Dashboard Séries Immersif",
  description:
    "Suivez vos séries avec des résumés générés par IA et un système anti-spoil social. Votre mémoire séries, augmentée par l'intelligence artificielle.",
  keywords: ["séries", "tv", "résumés", "IA", "anti-spoil", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[var(--cinema-black)] text-slate-200 antialiased font-[family-name:var(--font-inter)]">
        <div className="cinema-bg" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
