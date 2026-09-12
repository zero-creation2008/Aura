/**
 * AURA - Continuous Knowledge System & pgvector Memory View
 * 4 Partitions: Conversation, Project, Agent, Technical Knowledge.
 */

import React, { useState } from "react";
import {
  BookMarked,
  BrainCircuit,
  Database,
  Filter,
  Layers,
  Plus,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import { KnowledgeChunk, KnowledgePartition } from "../types";

interface KnowledgeViewProps {
  knowledge: KnowledgeChunk[];
  onSearchKnowledge: (query: string, partition?: KnowledgePartition) => Promise<KnowledgeChunk[]>;
  onStoreKnowledge: (params: {
    partition: KnowledgePartition;
    title: string;
    content: string;
    sourceType: string;
    sourceReference: string;
    tags?: string[];
  }) => Promise<void>;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  knowledge,
  onSearchKnowledge,
  onStoreKnowledge,
}) => {
  const [selectedPartition, setSelectedPartition] = useState<KnowledgePartition | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeChunk[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newPartition, setNewPartition] = useState<KnowledgePartition>("Technical");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSourceRef, setNewSourceRef] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const part = selectedPartition === "ALL" ? undefined : selectedPartition;
      const res = await onSearchKnowledge(searchQuery.trim(), part);
      setSearchResults(res);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      await onStoreKnowledge({
        partition: newPartition,
        title: newTitle.trim(),
        content: newContent.trim(),
        sourceType: "Operator Manual Entry",
        sourceReference: newSourceRef.trim() || "aura://manual-input",
      });
      setNewTitle("");
      setNewContent("");
      setNewSourceRef("");
      setShowAddModal(false);
      setSearchResults(null);
    }
  };

  const displayedList = searchResults !== null
    ? searchResults
    : selectedPartition === "ALL"
    ? knowledge
    : knowledge.filter((k) => k.partition === selectedPartition);

  const partitions: Array<{ id: KnowledgePartition | "ALL"; label: string; count: number }> = [
    { id: "ALL", label: "All Partitions", count: knowledge.length },
    {
      id: "Conversation",
      label: "Conversation Memory",
      count: knowledge.filter((k) => k.partition === "Conversation").length,
    },
    {
      id: "Project",
      label: "Project Memory",
      count: knowledge.filter((k) => k.partition === "Project").length,
    },
    {
      id: "Agent",
      label: "Agent Memory",
      count: knowledge.filter((k) => k.partition === "Agent").length,
    },
    {
      id: "Technical",
      label: "Technical Knowledge",
      count: knowledge.filter((k) => k.partition === "Technical").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <BrainCircuit className="w-4 h-4" />
            <span>Continuous Memory System</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">PostgreSQL pgvector Vector Store</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4 isolated memory partitions with cosine similarity search (vector dimension: 768).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Knowledge Record</span>
        </button>
      </div>

      {/* Semantic Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Semantic vector search across memories (e.g. 'JWT token auth', 'chat latency optimization')..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold font-mono transition-colors shrink-0"
          >
            {isSearching ? "Searching..." : "Vector Search"}
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery("");
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
            >
              Clear
            </button>
          )}
        </form>

        {/* Partition Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800/80">
          {partitions.map((p) => {
            const isSelected = selectedPartition === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPartition(p.id);
                  setSearchResults(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-purple-950 border border-purple-700 text-purple-300 font-semibold"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Knowledge Chunks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedList.map((chunk) => (
          <div
            key={chunk.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-semibold text-[10px] uppercase">
                  {chunk.partition} Partition
                </span>
                {chunk.relevanceScore !== undefined && (
                  <span className="text-emerald-400 text-[11px]">
                    Cosine Sim: {chunk.relevanceScore}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-white mb-1.5">{chunk.title}</h4>
              <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4 leading-relaxed font-sans">
                {chunk.content}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
              <span className="truncate">Source: {chunk.sourceReference}</span>
              <div className="flex flex-wrap gap-1">
                {chunk.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ingest Knowledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>Ingest Knowledge to pgvector</span>
            </h3>

            <form onSubmit={handleAddKnowledge} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-300 mb-1">Target Partition</label>
                <select
                  value={newPartition}
                  onChange={(e) => setNewPartition(e.target.value as KnowledgePartition)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                >
                  <option value="Technical">Technical Knowledge</option>
                  <option value="Project">Project Memory</option>
                  <option value="Agent">Agent Memory</option>
                  <option value="Conversation">Conversation Memory</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Record Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Rate Limiting Strategy in Node.js"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Content / Experience</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Use token bucket algorithm in Redis for distributed rate limiting..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Source Reference</label>
                <input
                  type="text"
                  value={newSourceRef}
                  onChange={(e) => setNewSourceRef(e.target.value)}
                  placeholder="e.g. https://docs.redis.io/redis-rate-limiter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold"
                >
                  Save & Embed Chunk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
