/**
 * AURA - System Configuration & Model Settings View
 * Gemini Brain model routing, infrastructure container status, and pgvector schema inspector.
 */

import React from "react";
import {
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Server,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const SystemSettingsView: React.FC = () => {
  const models = [
    { role: "Default Model", id: "gemini-3.8-flash", purpose: "General reasoning, multi-turn analysis, task routing" },
    { role: "Planner Model", id: "gemini-3.8-flash", purpose: "High-level goal breakdown, DAG generation, requirement extraction" },
    { role: "Coder Model", id: "gemini-3.8-flash", purpose: "High-throughput syntax generation, AST analysis, unit test synthesis" },
    { role: "Research Model", id: "gemini-3.8-flash", purpose: "Documentation search synthesis, technical RFC comparisons" },
    { role: "Fast Model", id: "gemini-3.8-flash", purpose: "Micro-evaluations, classification, log parsing, token efficiency" },
  ];

  const containers = [
    { name: "aura-orchestrator", image: "node:20-alpine", status: "Running (Healthy)", port: "3000:3000" },
    { name: "aura-pgvector-db", image: "pgvector/pgvector:pg16", status: "Running (Healthy)", port: "5432:5432" },
    { name: "aura-sandbox-runner", image: "docker:dind", status: "Running (Isolated)", port: "Internal" },
    { name: "aura-redis-queue", image: "redis:7-alpine", status: "Running (Healthy)", port: "6379:6379" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Settings className="w-4 h-4" />
            <span>Infrastructure & Intelligence Layer</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Gemini Brain & System Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Provider abstraction for Google Gemini API with fallback heuristics and isolated container sandboxes.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>ZERO-APPROVAL MODE: ACTIVE</span>
        </div>
      </div>

      {/* Model Routing Grid */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Gemini Model Provider Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {models.map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">{m.role}</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                  ACTIVE
                </span>
              </div>
              <div className="text-sm font-bold text-white">{m.id}</div>
              <p className="text-[11px] text-slate-500 font-sans">{m.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Container Infrastructure Bento */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>Docker Container Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {containers.map((c, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white truncate">{c.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">{c.image}</div>
              <div className="text-[10px] text-emerald-400">{c.status}</div>
              <div className="text-[10px] text-slate-500">Port: {c.port}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PostgreSQL pgvector Schema Inspector */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL pgvector Schema (/database/schema.sql)</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-64 overflow-y-auto leading-relaxed">
          <pre>{`-- PostgreSQL 16 + pgvector Schema for AURA Continuous Knowledge
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Memory partitions: Conversation, Project, Agent, Technical
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partition VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    source_type VARCHAR(64) NOT NULL,
    source_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cosine distance HNSW indexing for millisecond similarity retrieval
CREATE INDEX idx_knowledge_embedding_hnsw 
ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`}</pre>
        </div>
      </div>
    </div>
  );
};
