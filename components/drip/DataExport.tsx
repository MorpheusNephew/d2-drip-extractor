"use client";

import { useState } from "react";
import type { DripResponse } from "@/types/drip";

interface DataExportProps {
  data: DripResponse;
}

export default function DataExport({ data }: DataExportProps) {
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handleDownload = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "drip-cosmetics.json";
    a.click();

    URL.revokeObjectURL(url);

    setDownloadStatus("Downloaded!");
    setTimeout(() => setDownloadStatus(null), 1500);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#4a9eff] uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
            Raw Data Export
          </h3>
          <p className="text-xs text-[#c5c5c5]/60 mt-1">
            Complete JSON manifest for AI processing
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-[#00d4ff]/30 bg-gradient-to-r from-[#4a9eff]/20 to-[#00d4ff]/20 hover:from-[#4a9eff]/30 hover:to-[#00d4ff]/30 px-5 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#4a9eff]/10 hover:shadow-[#4a9eff]/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {downloadStatus ?? "Download JSON"}
        </button>
      </div>
      <div className="relative rounded-2xl border border-[#4a9eff]/20 bg-black/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-[#4a9eff]/5">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-[#4a9eff]/10 via-[#00d4ff]/10 to-[#8b5cf6]/10 border-b border-[#4a9eff]/20 flex items-center px-4 gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400/60"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400/60"></div>
          <div className="w-2 h-2 rounded-full bg-green-400/60"></div>
          <span className="text-[10px] text-[#c5c5c5]/60 ml-2 font-mono">
            drip-cosmetics.json
          </span>
        </div>
        <pre className="max-h-[480px] overflow-auto p-6 pt-12 text-xs text-[#c5c5c5] font-mono leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
}

