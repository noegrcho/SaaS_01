"use client";

import { useState } from "react";
import { useLeadsStore } from "@/store/useLeadsStore";
import { exportToCSV, exportToExcel } from "@/lib/export";

export default function ExportButton() {
  const { filteredBusinesses, lastQuery } = useLeadsStore();
  const [isExporting, setIsExporting] = useState(false);

  if (filteredBusinesses.length === 0) return null;

  const filename = `leads-${lastQuery.toLowerCase().replace(/\s+/g, "-")}-${
    new Date().toISOString().split("T")[0]
  }`;

  const handleCSV = () => {
    exportToCSV(filteredBusinesses, filename);
  };

  const handleExcel = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(filteredBusinesses, filename);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400 mr-1">
        {filteredBusinesses.length} lead{filteredBusinesses.length > 1 ? "s" : ""}
      </span>

      <button
        onClick={handleCSV}
        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
      >
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        CSV
      </button>

      <button
        onClick={handleExcel}
        disabled={isExporting}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        Excel
      </button>
    </div>
  );
}
