/**
 * AURA - Agents Factory & Swarm Manager View
 * Dynamic creation, prompt engineering, version evolution (v1 -> v2), clone, rollback, and tool permissions.
 */

import React, { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Copy,
  Cpu,
  History,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { Agent, AgentRole } from "../types";

interface AgentsViewProps {
  agents: Agent[];
  onCreateAgent: (params: { name: string; purpose: string; role?: AgentRole; model?: string }) => void;
  onCloneAgent: (id: string) => void;
  onImproveAgent: (id: string) => void;
  onRollbackAgent: (id: string, version: number) => void;
  onDeleteAgent: (id: string) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  onCreateAgent,
  onCloneAgent,
  onImproveAgent,
  onRollbackAgent,
  onDeleteAgent,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [role, setRole] = useState<AgentRole>("CustomSpecialist");
  const [improvingId, setImprovingId] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && purpose.trim()) {
      onCreateAgent({ name: name.trim(), purpose: purpose.trim(), role });
      setName("");
      setPurpose("");
      setShowCreateModal(false);
    }
  };

  const handleTriggerImprove = async (agentId: string) => {
    setImprovingId(agentId);
    try {
      await onImproveAgent(agentId);
    } finally {
      setImprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Action */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Bot className="w-4 h-4" />
            <span>Autonomous Agent Factory</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Specialized Engineering Swarm</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            10 specialized engineering roles, dynamic version evolutions (v1 → v2), and synthetic prompt benchmarks.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Synthesize New Agent</span>
        </button>
      </div>

      {/* Main Two-Column View: Agent Cards Grid + Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Cards List */}
        <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-md"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{agent.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      v{agent.version}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                    <span>●</span>
                    <span className="capitalize">{agent.status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">{agent.purpose}</p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Model: {agent.model.replace("gemini-", "")}</span>
                  <span className="text-slate-400">{agent.tasksCompleted} tasks completed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Inspector & Evolution Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAgent ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Agent Title & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                      v{selectedAgent.version}.0
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {selectedAgent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedAgent.purpose}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTriggerImprove(selectedAgent.id)}
                    disabled={improvingId === selectedAgent.id}
                    title="Synthesize higher version (v1 -> v2) via synthetic benchmark evaluation"
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{improvingId === selectedAgent.id ? "Benchmarking..." : "Self-Improve (v+1)"}</span>
                  </button>

                  <button
                    onClick={() => onCloneAgent(selectedAgent.id)}
                    title="Clone agent into a new instance"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {selectedAgent.role === "CustomSpecialist" && (
                    <button
                      onClick={() => onDeleteAgent(selectedAgent.id)}
                      title="Decommission agent"
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors border border-rose-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* System Prompt Box */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  System Prompt (Prompt Engineering)
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedAgent.systemPrompt}
                </div>
              </div>

              {/* Tools & Permissions Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enabled Tools</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Permissions & Scopes</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Version History & Rollback System */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  <span>Version Evolution History</span>
                </span>

                <div className="space-y-2">
                  {selectedAgent.versionsHistory.map((ver) => {
                    const isCurrent = ver.version === selectedAgent.version;
                    return (
                      <div
                        key={ver.version}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                          isCurrent
                            ? "bg-purple-950/30 border-purple-800/60 text-purple-200"
                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">v{ver.version}.0</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 font-semibold">
                                CURRENT
                              </span>
                            )}
                            <span className="text-slate-500">Benchmark: {Math.round(ver.performanceScore * 100)}%</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-sans">{ver.changeLog}</p>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => onRollbackAgent(selectedAgent.id, ver.version)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1 text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rollback</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">Select an agent to inspect specifications.</div>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Synthesize Specialized Agent</span>
            </h3>
            <p className="text-xs text-slate-400">
              AURA will autonomously generate optimal system prompts, select Gemini models, and configure tool boundaries.
            </p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SecurityAuditAgent"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Role Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AgentRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                >
                  <option value="CustomSpecialist">Custom Specialist</option>
                  <option value="ArchitectAgent">Architect Agent</option>
                  <option value="FrontendAgent">Frontend Agent</option>
                  <option value="BackendAgent">Backend Agent</option>
                  <option value="SecurityAgent">Security Agent</option>
                  <option value="DevOpsAgent">DevOps Agent</option>
                  <option value="DocumentationAgent">Documentation Agent</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Mission / Purpose</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Scans source code for OWASP Top 10 vulnerabilities, detects secret leaks, and verifies JWT tokens..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold"
                >
                  Synthesize Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
