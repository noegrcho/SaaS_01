// ============================================================
// TYPES CENTRAUX — tout le projet tourne autour de Business
// ============================================================

export interface BusinessReview {
  author: string;
  rating: number;
  text: string;
  date?: string;
}

export interface Business {
  // Identité
  id: string;
  name: string;
  category: string;
  description: string | null;

  // Contact
  phone: string | null;
  address: string | null;
  website: string | null;

  // Réputation Google
  rating: number | null;       // ex: 4.2
  reviewCount: number | null;  // ex: 87
  reviews: BusinessReview[];   // textes bruts (pour résumé IA)

  // Identifiant Google (pour lien Maps)
  placeId: string | null;

  // Statut calculé (enrichi après récupération)
  hasWebsite: boolean;
  websiteVerified: boolean;

  // Métadonnées
  sourceQuery: string;
  fetchedAt: string;
}

// ============================================================
// FILTRES DYNAMIQUES — extensibles sans toucher au reste
// ============================================================

export interface FilterConfig {
  noWebsite: boolean;
  ratingMin: number | null;
  ratingMax: number | null;
  reviewCountMin: number | null;
  reviewCountMax: number | null;
  noPhone: boolean;
  highReviewsLowRating: boolean;
  highReviewsLowRatingThreshold: {
    minReviews: number;
    maxRating: number;
  };
}

export const DEFAULT_FILTERS: FilterConfig = {
  noWebsite: true,
  ratingMin: null,
  ratingMax: null,
  reviewCountMin: null,
  reviewCountMax: null,
  noPhone: false,
  highReviewsLowRating: false,
  highReviewsLowRatingThreshold: {
    minReviews: 20,
    maxRating: 3.5,
  },
};

// ============================================================
// API TYPES
// ============================================================

export interface SearchRequest {
  profession: string;
  city: string;
  country?: string;
}

export interface SearchResponse {
  businesses: Business[];
  total: number;
  query: string;
  source: "serpapi" | "mock";
  error?: string;
}

export interface WebsiteCheckRequest {
  url: string;
  businessId: string;
}

export interface WebsiteCheckResponse {
  businessId: string;
  url: string;
  isAlive: boolean;
  statusCode?: number;
  error?: string;
}
