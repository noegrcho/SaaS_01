import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocalLeads — Trouve des prospects sans site web",
  description:
    "Recherche des entreprises locales sans site internet. Génère une liste de prospects qualifiés en 30 secondes et exporte en CSV ou Excel.",
  keywords: ["leads locaux", "prospection", "site web", "freelance", "side hustle"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
