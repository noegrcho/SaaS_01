import { Business, BusinessReview } from "./types";

// ============================================================
// PARSER SERPAPI
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSerpApiResults(data: any, query: string): Business[] {
  const results = data?.local_results ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.map((r: any, index: number): Business => {
    const website = r.website ?? null;

    // Avis bruts (SerpAPI les retourne parfois dans local_results)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews: BusinessReview[] = (r.reviews_data ?? []).map((rv: any) => ({
      author: rv.username ?? rv.name ?? "Anonyme",
      rating: rv.rating ?? 0,
      text: rv.description ?? rv.snippet ?? "",
      date: rv.date ?? undefined,
    })).filter((rv: BusinessReview) => rv.text.length > 0);

    return {
      id: `${query}-${index}-${r.place_id ?? Math.random()}`,
      name: r.title ?? "Nom inconnu",
      category: r.type ?? "",
      description: r.description ?? null,

      phone: r.phone ?? null,
      address: r.address ?? null,
      website,

      rating: r.rating ?? null,
      reviewCount: r.reviews ?? null,
      reviews,

      placeId: r.place_id ?? null,

      hasWebsite: !!website,
      websiteVerified: false,

      sourceQuery: query,
      fetchedAt: new Date().toISOString(),
    };
  });
}

// ============================================================
// DONNÉES MOCK (dev local sans clé API)
// ============================================================

export function generateMockBusinesses(
  profession: string,
  city: string
): Business[] {
  const now = new Date().toISOString();
  const query = `${profession} ${city}`;

  const businesses: Partial<Business>[] = [
    {
      name: `${profession} Dupont`,
      phone: "06 12 34 56 78",
      address: `12 rue de la Paix, ${city}`,
      website: null,
      rating: 4.2,
      reviewCount: 34,
      description: `Artisan ${profession.toLowerCase()} depuis plus de 15 ans, spécialisé dans les interventions d'urgence et les travaux de rénovation.`,
      placeId: "mock_place_1",
      reviews: [
        { author: "Marie L.", rating: 5, text: "Intervention rapide, travail impeccable. Je recommande vivement !", date: "Il y a 2 semaines" },
        { author: "Jean-Pierre M.", rating: 4, text: "Bon artisan, un peu cher mais le travail est de qualité.", date: "Il y a 1 mois" },
        { author: "Sophie T.", rating: 4, text: "Très professionnel, ponctuel et soigneux.", date: "Il y a 2 mois" },
      ],
    },
    {
      name: `Entreprise Martin ${profession}`,
      phone: "04 78 90 12 34",
      address: `5 avenue Jean Jaurès, ${city}`,
      website: "https://martin-plomberie.fr",
      rating: 3.8,
      reviewCount: 12,
      description: null,
      placeId: "mock_place_2",
      reviews: [
        { author: "Claude B.", rating: 3, text: "Correct mais les délais n'ont pas été respectés.", date: "Il y a 3 semaines" },
      ],
    },
    {
      name: `${profession} Express ${city}`,
      phone: null,
      address: `Zone Industrielle Nord, ${city}`,
      website: null,
      rating: 2.5,
      reviewCount: 8,
      description: `Service de ${profession.toLowerCase()} disponible 7j/7.`,
      placeId: "mock_place_3",
      reviews: [
        { author: "Patrick D.", rating: 1, text: "Pas du tout satisfait. Travail bâclé et facture gonflée.", date: "Il y a 1 semaine" },
        { author: "Nathalie R.", rating: 3, text: "Moyen. Rien d'exceptionnel.", date: "Il y a 1 mois" },
        { author: "Luc P.", rating: 2, text: "Devis très élevé pour un travail rapide.", date: "Il y a 2 mois" },
      ],
    },
    {
      name: `Sarl ${profession} Lefebvre`,
      phone: "06 98 76 54 32",
      address: `87 boulevard Gambetta, ${city}`,
      website: null,
      rating: 4.8,
      reviewCount: 156,
      description: `Leader régional dans le domaine du ${profession.toLowerCase()}, notre équipe de 8 techniciens qualifiés intervient sur tous types de chantiers.`,
      placeId: "mock_place_4",
      reviews: [
        { author: "Isabelle K.", rating: 5, text: "Excellent ! La meilleure entreprise de la région. Très professionnel du début à la fin.", date: "Il y a 3 jours" },
        { author: "Marc A.", rating: 5, text: "Équipe sérieuse, travail propre et tarifs honnêtes.", date: "Il y a 1 semaine" },
        { author: "Anne-Sophie V.", rating: 5, text: "On fait appel à eux depuis 5 ans, toujours aussi fiables.", date: "Il y a 2 semaines" },
      ],
    },
    {
      name: `${city} ${profession} Service`,
      phone: "09 70 12 34 56",
      address: `3 impasse des Lilas, ${city}`,
      website: "https://example-old-site.com",
      rating: 3.1,
      reviewCount: 67,
      description: null,
      placeId: "mock_place_5",
      reviews: [],
    },
    {
      name: `Atelier ${profession} Moreau`,
      phone: "06 45 67 89 01",
      address: `Place du Marché, ${city}`,
      website: null,
      rating: null,
      reviewCount: null,
      description: `Artisan indépendant, ${profession.toLowerCase()} certifié RGE.`,
      placeId: "mock_place_6",
      reviews: [],
    },
    {
      name: `Pro ${profession} ${city}`,
      phone: "04 56 78 90 12",
      address: `15 rue Victor Hugo, ${city}`,
      website: null,
      rating: 3.3,
      reviewCount: 28,
      description: null,
      placeId: "mock_place_7",
      reviews: [
        { author: "François B.", rating: 3, text: "Service correct mais communication difficile.", date: "Il y a 2 mois" },
      ],
    },
    {
      name: `Bernard & Fils ${profession}`,
      phone: null,
      address: `22 chemin des Vignes, ${city}`,
      website: null,
      rating: 4.0,
      reviewCount: 5,
      description: `Entreprise familiale depuis 1987. Spécialiste des installations et dépannages.`,
      placeId: "mock_place_8",
      reviews: [
        { author: "Henri G.", rating: 4, text: "Entreprise sérieuse, père et fils très compétents.", date: "Il y a 4 mois" },
      ],
    },
  ];

  return businesses.map((b, index): Business => ({
    id: `mock-${index}-${Date.now()}`,
    name: b.name!,
    category: profession,
    description: b.description ?? null,
    phone: b.phone ?? null,
    address: b.address ?? null,
    website: b.website ?? null,
    rating: b.rating ?? null,
    reviewCount: b.reviewCount ?? null,
    reviews: b.reviews ?? [],
    placeId: b.placeId ?? null,
    hasWebsite: !!b.website,
    websiteVerified: false,
    sourceQuery: query,
    fetchedAt: now,
  }));
}
