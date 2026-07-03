"use client";

import { useState } from "react";
import { useLeadsStore } from "@/store/useLeadsStore";
import { SearchResponse } from "@/lib/types";

interface SearchFormProps {
  disabled?: boolean;
  onBlockedClick?: () => void;
  onQuotaExceeded?: (plan: string) => void;
  onSearchSettled?: () => void;
}

export default function SearchForm({ disabled = false, onBlockedClick, onQuotaExceeded, onSearchSettled }: SearchFormProps) {
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const { isLoading, setLoading, setResults, setError, clearResults } =
    useLeadsStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) { onBlockedClick?.(); return; }
    if (!profession.trim() || !city.trim()) return;

    clearResults();
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: profession.trim(), city: city.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403 && err.quotaExceeded) {
          onQuotaExceeded?.(err.plan ?? "free");
          setError(err.error ?? "Quota de recherches atteint.");
          return;
        }
        throw new Error(err.error ?? "Erreur lors de la recherche");
      }

      const data: SearchResponse = await res.json();
      setResults(data.businesses, data.source, data.query);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur s'est produite."
      );
    } finally {
      setLoading(false);
      onSearchSettled?.();
    }
  };

  const examples = [
    ["Plombier", "Lyon"],
    ["Électricien", "Bordeaux"],
    ["Coiffeur", "Nantes"],
    ["Boulanger", "Marseille"],
  ];

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        {/* Champ Métier */}
        <div className="flex-1">
          <label
            htmlFor="profession"
            className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
          >
            Métier
          </label>
          <input
            id="profession"
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="ex : Plombier"
            required
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Champ Ville */}
        <div className="flex-1">
          <label
            htmlFor="city"
            className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
          >
            Ville
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="ex : Lyon"
            required
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Bouton */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading || !profession.trim() || !city.trim()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Recherche…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </>
            )}
          </button>
        </div>
      </form>

      {/* Exemples rapides */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-slate-500">Essayer :</span>
        {examples.map(([p, c]) => (
          <button
            key={`${p}-${c}`}
            onClick={() => {
              setProfession(p);
              setCity(c);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            {p} à {c}
          </button>
        ))}
      </div>
    </div>
  );
}