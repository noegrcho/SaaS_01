import { NextRequest, NextResponse } from "next/server";
import { Business } from "@/lib/types";

// ============================================================
// POST /api/ai-summary
// Génère un résumé IA des avis via Groq (free tier)
// Modèle : llama-3.3-70b-versatile (rapide + gratuit)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const business: Business = await request.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

    if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
      return NextResponse.json(
        { error: "Clé API Groq manquante. Ajoute GROQ_API_KEY dans .env.local" },
        { status: 503 }
      );
    }

    // Construction du prompt
    const hasReviews = business.reviews.length > 0;
    const reviewsBlock = hasReviews
      ? business.reviews
          .map((r) => `- ${r.author} (${r.rating}★${r.date ? ", " + r.date : ""}) : "${r.text}"`)
          .join("\n")
      : "Aucun avis disponible.";

    const prompt = `Tu es un assistant commercial qui analyse la présence digitale d'une entreprise locale pour aider un freelance à préparer son argumentaire de vente (création de site web).

## Entreprise analysée
Nom : ${business.name}
Catégorie : ${business.category || "Non précisée"}
${business.description ? `Description : ${business.description}` : ""}
Adresse : ${business.address ?? "Non précisée"}
Note Google : ${business.rating !== null ? `${business.rating}/5 (${business.reviewCount ?? 0} avis)` : "Aucune note"}
Site web : ${business.hasWebsite ? business.website : "AUCUN SITE WEB"}

## Avis clients
${reviewsBlock}

## Ta mission
Génère une analyse courte et percutante en 3 blocs :

**✅ Points forts** (2-3 points max, ce que les clients apprécient)

**⚠️ Points faibles** (2-3 points max, ce qui revient négativement, ou "Aucun avis disponible" si applicable)

**🎯 Opportunité commerciale** (1-2 phrases max : pourquoi cette entreprise a besoin d'un site web professionnel, en quoi ça lui manque concrètement)

Sois direct, concis, en français. Pas de blabla d'introduction.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error("[Groq Error]", err);
      throw new Error(`Groq API erreur ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    const summary = data?.choices?.[0]?.message?.content ?? "Impossible de générer un résumé.";

    return NextResponse.json({ summary });

  } catch (error) {
    console.error("[/api/ai-summary]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
