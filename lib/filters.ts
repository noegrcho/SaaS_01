import { Business, FilterConfig } from "./types";

// ============================================================
// MOTEUR DE FILTRAGE
// Chaque filtre est une fonction pure indépendante.
// Pour ajouter un nouveau filtre → 1 fonction + 1 ligne dans applyFilters()
// ============================================================

// Filtre 1 : Pas de site web
const filterNoWebsite = (b: Business): boolean => !b.hasWebsite;

// Filtre 2 : Note inférieure à X
const filterMaxRating = (b: Business, max: number): boolean =>
  b.rating !== null && b.rating <= max;

// Filtre 3 : Note supérieure à X
const filterMinRating = (b: Business, min: number): boolean =>
  b.rating !== null && b.rating >= min;

// Filtre 4 : Volume d'avis
const filterMinReviews = (b: Business, min: number): boolean =>
  b.reviewCount !== null && b.reviewCount >= min;

const filterMaxReviews = (b: Business, max: number): boolean =>
  b.reviewCount !== null && b.reviewCount <= max;

// Filtre 5 : Pas de téléphone
const filterNoPhone = (b: Business): boolean => !b.phone;

// Filtre 6 : Beaucoup d'avis + mauvaise note (prospect e-réputation idéal)
const filterHighReviewsLowRating = (
  b: Business,
  minReviews: number,
  maxRating: number
): boolean =>
  b.reviewCount !== null &&
  b.rating !== null &&
  b.reviewCount >= minReviews &&
  b.rating <= maxRating;

// ============================================================
// FONCTION PRINCIPALE — applique tous les filtres actifs
// ============================================================

export function applyFilters(
  businesses: Business[],
  filters: FilterConfig
): Business[] {
  return businesses.filter((b) => {
    // Filtre "pas de site web"
    if (filters.noWebsite && !filterNoWebsite(b)) return false;

    // Filtre note max
    if (filters.ratingMax !== null && !filterMaxRating(b, filters.ratingMax))
      return false;

    // Filtre note min
    if (filters.ratingMin !== null && !filterMinRating(b, filters.ratingMin))
      return false;

    // Filtre volume avis min
    if (
      filters.reviewCountMin !== null &&
      !filterMinReviews(b, filters.reviewCountMin)
    )
      return false;

    // Filtre volume avis max
    if (
      filters.reviewCountMax !== null &&
      !filterMaxReviews(b, filters.reviewCountMax)
    )
      return false;

    // Filtre pas de téléphone
    if (filters.noPhone && !filterNoPhone(b)) return false;

    // Filtre e-réputation (beaucoup d'avis, mauvaise note)
    if (
      filters.highReviewsLowRating &&
      !filterHighReviewsLowRating(
        b,
        filters.highReviewsLowRatingThreshold.minReviews,
        filters.highReviewsLowRatingThreshold.maxRating
      )
    )
      return false;

    return true;
  });
}

// ============================================================
// HELPERS
// ============================================================

export function countActiveFilters(filters: FilterConfig): number {
  let count = 0;
  if (filters.noWebsite) count++;
  if (filters.ratingMax !== null) count++;
  if (filters.ratingMin !== null) count++;
  if (filters.reviewCountMin !== null) count++;
  if (filters.reviewCountMax !== null) count++;
  if (filters.noPhone) count++;
  if (filters.highReviewsLowRating) count++;
  return count;
}
