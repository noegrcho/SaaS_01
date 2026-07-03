"use client";

import { useLeadsStore } from "@/store/useLeadsStore";
import { countActiveFilters } from "@/lib/filters";

export default function FilterPanel() {
  const { filters, updateFilter, resetFilters, rawBusinesses } = useLeadsStore();
  const activeCount = countActiveFilters(filters);

  if (rawBusinesses.length === 0) return null;

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Filtres</h3>
          {activeCount > 0 && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {activeCount} actif{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Tout réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-5">

        {/* ---- Filtre 1 : Sans site web (MVP) ---- */}
        <FilterToggle
          label="Sans site web"
          description="Prospects idéaux pour vendre un site"
          badge="MVP"
          checked={filters.noWebsite}
          onChange={(v) => updateFilter("noWebsite", v)}
        />

        {/* ---- Filtre 2 : Sans téléphone ---- */}
        <FilterToggle
          label="Sans numéro de téléphone"
          description="Renseignement incomplet sur Google"
          checked={filters.noPhone}
          onChange={(v) => updateFilter("noPhone", v)}
        />

        {/* ---- Filtre 3 : Note faible ---- */}
        <div>
          <label className="text-sm font-medium text-slate-200">
            Note maximum
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Vendre de la gestion e-réputation
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={filters.ratingMax ?? 5}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                updateFilter("ratingMax", v === 5 ? null : v);
              }}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-indigo-400 w-14 text-right font-mono">
              {filters.ratingMax !== null ? `≤ ${filters.ratingMax}★` : "Tous"}
            </span>
          </div>
        </div>

        {/* ---- Filtre 4 : E-réputation (avis élevés + note faible) ---- */}
        <FilterToggle
          label="Mauvaise réputation malgré de nombreux avis"
          description={`≥ ${filters.highReviewsLowRatingThreshold.minReviews} avis et ≤ ${filters.highReviewsLowRatingThreshold.maxRating}★`}
          checked={filters.highReviewsLowRating}
          onChange={(v) => updateFilter("highReviewsLowRating", v)}
        />

      </div>
    </div>
  );
}

// ---- Composant Toggle réutilisable ----
interface FilterToggleProps {
  label: string;
  description?: string;
  badge?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function FilterToggle({ label, description, badge, checked, onChange }: FilterToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          {badge && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
          checked ? "bg-indigo-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
