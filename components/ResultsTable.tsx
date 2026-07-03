"use client";

import { useState, useCallback } from "react";
import { useLeadsStore } from "@/store/useLeadsStore";
import { Business } from "@/lib/types";

// ============================================================
// HELPERS
// ============================================================

function buildMapsUrl(business: Business): string {
  if (business.placeId && !business.placeId.startsWith("mock_")) {
    return `https://www.google.com/maps/place/?q=place_id:${business.placeId}`;
  }
  const q = encodeURIComponent(`${business.name} ${business.address ?? ""}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// ============================================================
// MAIN TABLE COMPONENT
// ============================================================

export default function ResultsTable() {
  const { filteredBusinesses, rawBusinesses, isLoading, error, lastQuery, dataSource } =
    useLeadsStore();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 text-sm">Recherche en cours…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium">Erreur</p>
        <p className="text-slate-500 text-sm text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (rawBusinesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-slate-500">Lance une recherche pour voir les résultats</p>
      </div>
    );
  }

  if (filteredBusinesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">Aucun résultat pour ces filtres</p>
        <p className="text-slate-500 text-sm">{rawBusinesses.length} entreprises trouvées — ajuste tes filtres</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-sm text-slate-400">
          <span className="text-white font-semibold">{filteredBusinesses.length}</span>{" "}
          résultat{filteredBusinesses.length > 1 ? "s" : ""} pour{" "}
          <span className="text-indigo-400 font-medium">{lastQuery}</span>
          {rawBusinesses.length !== filteredBusinesses.length && (
            <span className="text-slate-600"> (sur {rawBusinesses.length} trouvés)</span>
          )}
        </p>
        {dataSource === "mock" && (
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Mode démo
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 text-left border-b border-slate-700/60">
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Entreprise</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Téléphone</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Adresse</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Site web</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredBusinesses.map((business) => (
              <BusinessRow
                key={business.id}
                business={business}
                onOpenDetail={() => setSelectedBusiness(business)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale de détail */}
      {selectedBusiness && (
        <DetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </>
  );
}

// ============================================================
// BUSINESS ROW
// ============================================================

function BusinessRow({
  business,
  onOpenDetail,
}: {
  business: Business;
  onOpenDetail: () => void;
}) {
  const mapsUrl = buildMapsUrl(business);

  return (
    <tr className="bg-slate-900/40 hover:bg-slate-800/40 transition-colors group">
      {/* Nom */}
      <td className="px-4 py-3.5">
        <div className="font-medium text-white">{business.name}</div>
        {business.category && (
          <div className="text-xs text-slate-500 mt-0.5">{business.category}</div>
        )}
      </td>

      {/* Téléphone — nowrap pour éviter la coupure */}
      <td className="px-4 py-3.5">
        {business.phone ? (
          <a
            href={`tel:${business.phone}`}
            className="text-slate-300 hover:text-white transition-colors font-mono text-xs whitespace-nowrap"
          >
            {business.phone}
          </a>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>

      {/* Adresse — cliquable → Google Maps */}
      <td className="px-4 py-3.5 max-w-xs">
        {business.address ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-400 text-xs leading-relaxed line-clamp-2 transition-colors flex items-start gap-1 group/addr"
          >
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-600 group-hover/addr:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{business.address}</span>
          </a>
        ) : (
          <span className="text-slate-600 text-xs">—</span>
        )}
      </td>

      {/* Note */}
      <td className="px-4 py-3.5">
        {business.rating !== null ? (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-amber-400">★</span>
            <span className="font-semibold text-white">{business.rating}</span>
            {business.reviewCount !== null && (
              <span className="text-slate-500 text-xs">({business.reviewCount})</span>
            )}
          </div>
        ) : (
          <span className="text-slate-600 text-xs">Aucun avis</span>
        )}
      </td>

      {/* Site web */}
      <td className="px-4 py-3.5">
        {business.hasWebsite ? (
          <a
            href={business.website!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors truncate max-w-[130px] block"
          >
            {business.website}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Prospect
          </span>
        )}
      </td>

      {/* Bouton détail */}
      <td className="px-4 py-3.5">
        <button
          onClick={onOpenDetail}
          className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Détail
        </button>
      </td>
    </tr>
  );
}

// ============================================================
// DETAIL MODAL avec résumé IA
// ============================================================

function DetailModal({
  business,
  onClose,
}: {
  business: Business;
  onClose: () => void;
}) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<"context" | "summary" | null>(null);

  const mapsUrl = buildMapsUrl(business);

  // Texte de contexte complet (copiable pour prompt)
  const contextText = [
    `Nom : ${business.name}`,
    business.category ? `Catégorie : ${business.category}` : null,
    business.description ? `Description : ${business.description}` : null,
    business.address ? `Adresse : ${business.address}` : null,
    business.phone ? `Téléphone : ${business.phone}` : null,
    business.website ? `Site web : ${business.website}` : "Site web : Aucun",
    business.rating !== null
      ? `Note Google : ${business.rating}/5 (${business.reviewCount ?? 0} avis)`
      : "Note Google : Aucune",
  ]
    .filter(Boolean)
    .join("\n");

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);
    setAiSummary("");

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? `Erreur ${response.status}`);
      }

      setAiSummary(data.summary ?? "Aucun résumé généré.");
    } catch (err) {
      setAiSummary(
        err instanceof Error ? `❌ ${err.message}` : "Erreur de connexion. Réessaie."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [business]);

  const copyToClipboard = async (text: string, type: "context" | "summary") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-bold text-white text-base leading-tight">{business.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {business.category && (
                <span className="text-xs text-slate-400">{business.category}</span>
              )}
              {business.rating !== null && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="text-amber-400">★</span>
                  <span className="text-white font-semibold">{business.rating}</span>
                  <span className="text-slate-500">({business.reviewCount ?? 0} avis)</span>
                </span>
              )}
              {!business.hasWebsite && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Sans site web
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Infos de contact */}
          <div className="space-y-2">
            {business.address && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-sm text-slate-300 hover:text-indigo-400 transition-colors group/link"
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 group-hover/link:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{business.address}</span>
                <svg className="w-3 h-3 mt-1 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {business.phone && (
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-mono whitespace-nowrap">{business.phone}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2.5 text-sm">
                <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate">
                  {business.website}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-sm text-slate-300 leading-relaxed">{business.description}</p>
            </div>
          )}

          {/* Bloc contexte copiable */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Contexte (pour ton prompt)
              </p>
              <button
                onClick={() => copyToClipboard(contextText, "context")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                {copied === "context" ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed select-text">
              {contextText}
            </pre>
          </div>

          {/* Avis bruts */}
          {business.reviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Avis ({business.reviews.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {business.reviews.map((review, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{review.author}</span>
                      <span className="text-xs text-amber-400">{"★".repeat(review.rating)}</span>
                      {review.date && (
                        <span className="text-xs text-slate-500 ml-auto">{review.date}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résumé IA */}
          <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-indigo-600/80 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Résumé IA des avis</p>
              </div>
              {aiSummary && (
                <button
                  onClick={() => copyToClipboard(aiSummary, "summary")}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                >
                  {copied === "summary" ? (
                    <span className="text-emerald-400">Copié !</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier
                    </>
                  )}
                </button>
              )}
            </div>

            {!aiSummary && !isGenerating && (
              <div className="text-center py-3">
                <p className="text-xs text-slate-500 mb-3">
                  {business.reviews.length > 0
                    ? `Analyse ${business.reviews.length} avis avec Claude pour identifier l'opportunité commerciale.`
                    : "Génère une analyse de ce prospect même sans avis disponibles."}
                </p>
                <button
                  onClick={generateSummary}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  ✨ Analyser avec Groq (Llama 3.3)
                </button>
              </div>
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 py-3 justify-center">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                <span className="text-xs text-indigo-400">Groq analyse les avis…</span>
              </div>
            )}

            {aiSummary && !isGenerating && (
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                {aiSummary}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
