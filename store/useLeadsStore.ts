"use client";

import { create } from "zustand";
import { Business, FilterConfig, DEFAULT_FILTERS } from "@/lib/types";
import { applyFilters } from "@/lib/filters";

interface LeadsStore {
  // ---- Données brutes (toujours préservées) ----
  rawBusinesses: Business[];
  
  // ---- Recherche ----
  isLoading: boolean;
  error: string | null;
  lastQuery: string;
  dataSource: "serpapi" | "mock" | null;

  // ---- Filtres ----
  filters: FilterConfig;

  // ---- Résultats filtrés (dérivés) ----
  filteredBusinesses: Business[];

  // ---- Actions ----
  setResults: (businesses: Business[], source: "serpapi" | "mock", query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilter: <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => void;
  resetFilters: () => void;
  updateBusinessWebsite: (id: string, isAlive: boolean) => void;
  clearResults: () => void;
}

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  rawBusinesses: [],
  isLoading: false,
  error: null,
  lastQuery: "",
  dataSource: null,
  filters: DEFAULT_FILTERS,
  filteredBusinesses: [],

  setResults: (businesses, source, query) => {
    const { filters } = get();
    set({
      rawBusinesses: businesses,
      filteredBusinesses: applyFilters(businesses, filters),
      dataSource: source,
      lastQuery: query,
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  updateFilter: (key, value) => {
    const { rawBusinesses } = get();
    const newFilters = { ...get().filters, [key]: value };
    set({
      filters: newFilters,
      filteredBusinesses: applyFilters(rawBusinesses, newFilters),
    });
  },

  resetFilters: () => {
    const { rawBusinesses } = get();
    set({
      filters: DEFAULT_FILTERS,
      filteredBusinesses: applyFilters(rawBusinesses, DEFAULT_FILTERS),
    });
  },

  updateBusinessWebsite: (id, isAlive) => {
    const { rawBusinesses, filters } = get();
    const updated = rawBusinesses.map((b) =>
      b.id === id
        ? { ...b, hasWebsite: isAlive, websiteVerified: true }
        : b
    );
    set({
      rawBusinesses: updated,
      filteredBusinesses: applyFilters(updated, filters),
    });
  },

  clearResults: () =>
    set({
      rawBusinesses: [],
      filteredBusinesses: [],
      lastQuery: "",
      dataSource: null,
      error: null,
    }),
}));
