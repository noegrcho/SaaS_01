import { NextRequest, NextResponse } from "next/server";
import { parseSerpApiResults, generateMockBusinesses } from "@/lib/parsers";
import { SearchRequest, SearchResponse, Business } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// ============================================================
// POST /api/search
// Récupère jusqu'à 60 résultats (3 pages × 20) en parallèle
// ============================================================

const PAGES_TO_FETCH = 3; // 3 × 20 = 60 résultats max
const FREE_PLAN_RESULTS_LIMIT = 3; // plan gratuit : 3 résultats max par recherche

async function fetchOnePage(
  q: string,
  start: number,
  apiKey: string
): Promise<Business[]> {
  const params = new URLSearchParams({
    engine: "google_maps",
    q,
    type: "search",
    hl: "fr",
    gl: "fr",
    start: String(start),
    api_key: apiKey,
  });

  const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    console.warn(`[SerpAPI] page start=${start} → HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();

  // SerpAPI retourne un tableau vide ou absent quand il n'y a plus de résultats
  if (!data?.local_results?.length) return [];

  return parseSerpApiResults(data, q);
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth + quota (plan + crédits de recherche en base) ─────
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Connecte-toi pour lancer une recherche." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // S'assure que le profil existe (filet de sécurité si le trigger
    // SQL n'avait pas encore tourné pour ce compte).
    let { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const { data: created } = await admin
        .from("profiles")
        .insert({ id: user.id, email: user.email })
        .select("plan")
        .single();
      profile = created;
    }

    const plan = profile?.plan ?? "free";

    const body: SearchRequest = await request.json();
    const { profession, city, country = "France" } = body;

    if (!profession || !city) {
      return NextResponse.json(
        { error: "Paramètres manquants : profession et city sont requis." },
        { status: 400 }
      );
    }

    // Consommation atomique du crédit : la fonction SQL décrémente
    // `searches_remaining` UNIQUEMENT s'il en reste, et renvoie false
    // sinon. Impossible de dépasser le quota, même en cas de requêtes
    // simultanées.
    const { data: creditConsumed, error: rpcError } = await admin.rpc(
      "consume_search_credit",
      { uid: user.id }
    );

    if (rpcError) {
      console.error("[/api/search] consume_search_credit error:", rpcError);
      return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }

    if (!creditConsumed) {
      return NextResponse.json(
        {
          error:
            plan === "free"
              ? "Ton essai gratuit est terminé. Abonne-toi pour continuer à chercher des leads."
              : "Tu as atteint la limite de recherches de ton forfait.",
          quotaExceeded: true,
          plan,
        },
        { status: 403 }
      );
    }

    const isFreeSearch = plan === "free"; // résultats limités à 3 sur le plan gratuit

    const query = `${profession} ${city}`;
    const SERPAPI_KEY = process.env.SERPAPI_KEY?.trim();

    // ---- Mode MOCK ----
    if (!SERPAPI_KEY || SERPAPI_KEY === "YOUR_SERPAPI_KEY") {
      console.log(`[MOCK] ${query}`);
      let mockData = generateMockBusinesses(profession, city);
      if (isFreeSearch) mockData = mockData.slice(0, FREE_PLAN_RESULTS_LIMIT);
      return NextResponse.json({
        businesses: mockData,
        total: mockData.length,
        query,
        source: "mock",
      } as SearchResponse);
    }

    // ---- Mode PRODUCTION : 3 pages en parallèle ----
    const serpQuery = `${profession} ${city} ${country}`;
    console.log(`[SerpAPI] Recherche "${serpQuery}" — ${PAGES_TO_FETCH} pages en parallèle`);

    const pageStarts = Array.from({ length: PAGES_TO_FETCH }, (_, i) => i * 20);

    const pageResults = await Promise.allSettled(
      pageStarts.map((start) => fetchOnePage(serpQuery, start, SERPAPI_KEY))
    );

    // Fusionner les résultats, dédupliquer par place_id ou par nom+adresse
    const seen = new Set<string>();
    const businesses: Business[] = [];

    for (const result of pageResults) {
      if (result.status === "rejected") {
        console.warn("[SerpAPI] Une page a échoué :", result.reason);
        continue;
      }
      for (const b of result.value) {
        // Clé de dédup : place_id si dispo, sinon nom normalisé
        const key = b.placeId ?? `${b.name}__${b.address}`;
        if (!seen.has(key)) {
          seen.add(key);
          businesses.push(b);
        }
      }
    }

    console.log(`[SerpAPI] ${businesses.length} résultats uniques récupérés`);

    const finalBusinesses = isFreeSearch
      ? businesses.slice(0, FREE_PLAN_RESULTS_LIMIT)
      : businesses;

    return NextResponse.json({
      businesses: finalBusinesses,
      total: finalBusinesses.length,
      query,
      source: "serpapi",
    } as SearchResponse);

  } catch (error) {
    console.error("[/api/search] Erreur:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inattendue.",
        businesses: [],
        total: 0,
        query: "",
        source: "mock",
      } as SearchResponse,
      { status: 500 }
    );
  }
}