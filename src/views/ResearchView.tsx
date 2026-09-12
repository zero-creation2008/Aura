/**
 * AURA - Technical Research Engine View
 * 8-Step pipeline: QUESTION -> SEARCH -> FETCH -> EXTRACT -> COMPARE -> VALIDATE -> SUMMARIZE -> STORE.
 */

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Globe,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TechnicalResearchItem } from "../types";

interface ResearchViewProps {
  researchItems: TechnicalResearchItem[];
  onTriggerResearch: (query: string) => Promise<void>;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ researchItems, onTriggerResearch }) => {
  const [queryInput, setQueryInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TechnicalResearchItem | null>(researchItems[0] || null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isSearching) return;

    setIsSearching(true);
    try {
      await onTriggerResearch(queryInput.trim());
      setQueryInput("");
    } finally {
      setIsSearching(false);
    }
  };

  const currentItem = selectedItem || researchItems[0];

  return (
    <div className="space-y-6">
      {/* Header & Query Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Search className="w-4 h-4" />
            <span>Autonomous Technical Research Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Primary Documentation & API Verification</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes 8-step pipeline to research libraries, compare architecture RFCs, and validate official API signatures.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. pgvector HNSW indexing, WebSockets backpressure, Redis cluster sharding..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={!queryInput.trim() || isSearching}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50 flex items-center space-x-2 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSearching ? "Researching..." : "Execute Research"}</span>
          </button>
        </form>

        {/* 8-Step Pipeline Visualizer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 overflow-x-auto gap-2">
          <span className="text-cyan-400 font-semibold shrink-0">1. Question</span>
          <span>→</span>
          <span className="shrink-0">2. Search</span>
          <span>→</span>
          <span className="shrink-0">3. Fetch</span>
          <span>→</span>
          <span className="shrink-0">4. Extract</span>
          <span>→</span>
          <span className="shrink-0">5. Compare</span>
          <span>→</span>
          <span className="shrink-0">6. Validate</span>
          <span>→</span>
          <span className="shrink-0">7. Summarize</span>
          <span>→</span>
          <span className="text-purple-400 font-semibold shrink-0">8. Store to pgvector</span>
        </div>
      </div>

      {/* Two Column Layout: Historical Research + Selected Finding */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research History List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {researchItems.map((item) => {
            const isSelected = currentItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-md"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate max-w-[200px]">{item.query}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.summary}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="text-cyan-400">{item.sources.length} Verified Sources</span>
                  <span className="text-purple-400">{item.topic}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Finding Detail Inspector */}
        <div className="lg:col-span-2">
          {currentItem ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Research Dossier • {currentItem.topic}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{currentItem.query}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Domain: {currentItem.targetFrameworkOrApi}
                </span>
              </div>

              {/* Summary Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Authoritative Synthesis
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {currentItem.summary}
                </p>
              </div>

              {/* Architectural Recommendations */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Synthesized Architectural Recommendations
                </span>
                <div className="space-y-2">
                  {currentItem.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources Metadata with Reliability Score */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Verified Primary Sources ({currentItem.sources.length})
                </span>
                <div className="space-y-2">
                  {currentItem.sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold text-white">{src.title}</span>
                          {src.isOfficialDoc && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-mono flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>OFFICIAL DOC</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">{src.snippet}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-slate-500 block">
                          Reliability: <strong className="text-cyan-400">{Math.round(src.reliabilityScore * 100)}%</strong>
                        </span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 justify-end mt-0.5"
                        >
                          <span>Reference</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">
              No research data selected. Trigger a query above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
