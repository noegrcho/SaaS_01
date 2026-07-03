import { NextRequest, NextResponse } from "next/server";
import { WebsiteCheckRequest, WebsiteCheckResponse } from "@/lib/types";

// ============================================================
// POST /api/check-website
// Vérifie si un site web répond (HEAD request rapide)
// Utilisé pour les entreprises qui ont une URL listée
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: WebsiteCheckRequest = await request.json();
    const { url, businessId } = body;

    if (!url || !businessId) {
      return NextResponse.json(
        { error: "url et businessId sont requis." },
        { status: 400 }
      );
    }

    // Normalisation de l'URL
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      normalizedUrl = `https://${url}`;
    }

    try {
      const checkResponse = await fetch(normalizedUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000), // 8 secondes max
        redirect: "follow",
        headers: {
          // Simuler un vrai navigateur pour éviter les refus 403
          "User-Agent":
            "Mozilla/5.0 (compatible; LocalLeadsBot/1.0; +https://localleads.app)",
        },
      });

      const response: WebsiteCheckResponse = {
        businessId,
        url: normalizedUrl,
        isAlive: checkResponse.status < 400,
        statusCode: checkResponse.status,
      };

      return NextResponse.json(response);
    } catch (fetchError) {
      // Timeout, DNS failure, connexion refusée → site mort/inexistant
      const response: WebsiteCheckResponse = {
        businessId,
        url: normalizedUrl,
        isAlive: false,
        error:
          fetchError instanceof Error ? fetchError.message : "Unreachable",
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("[/api/check-website] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne." },
      { status: 500 }
    );
  }
}
