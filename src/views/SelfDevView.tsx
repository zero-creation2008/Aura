/**
 * AURA - Self-Developing AURA View
 * AURA treats itself as a software project: inspects source, runs isolated regression suites, activates versions.
 */

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Cpu,
  History,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ImprovementProposal, SystemVersion } from "../types";

interface SelfDevViewProps {
  systemVersions: SystemVersion[];
  proposals: ImprovementProposal[];
  onTriggerSelfDevCycle: () => Promise<void>;
  onActivateProposal: (id: string) => Promise<void>;
}

export const SelfDevView: React.FC<SelfDevViewProps> = ({
  systemVersions,
  proposals,
  onTriggerSelfDevCycle,
  onActivateProposal,
}) => {
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleRunCycle = async () => {
    setIsRunningCycle(true);
    try {
      await onTriggerSelfDevCycle();
    } finally {
      setIsRunningCycle(false);
    }
  };

  const handleActivate = async (proposalId: string) => {
    setActivatingId(proposalId);
    try {
      await onActivateProposal(proposalId);
    } finally {
      setActivatingId(null);
    }
  };

  const activeVersion = systemVersions.find((v) => v.status === "active") || systemVersions[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Self-Developing Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Recursive Meta-Engineering Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            AURA inspects its own orchestrator, coding engine, agents, and prompts in an isolated sandbox.
            Upon 100% regression suite verification, it safely activates system upgrades.
          </p>
        </div>

        <button
          onClick={handleRunCycle}
          disabled={isRunningCycle}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 shrink-0"
        >
          {isRunningCycle ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Source & Benchmarks...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>Run Self-Dev Inspection Cycle</span>
            </>
          )}
        </button>
      </div>

      {/* Current Active Core Release */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white">{activeVersion?.releaseName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                ACTIVE DEPLOYMENT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Version: {activeVersion?.version} • Commit: {activeVersion?.commitHash} • Verified Tests: {activeVersion?.testCount}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Activated: {new Date(activeVersion?.activatedAt || Date.now()).toLocaleDateString()}
        </div>
      </div>

      {/* Improvement Proposals List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Self-Improvement Proposals ({proposals.length})</span>
        </h3>

        <div className="space-y-3">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{prop.targetName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      v{prop.currentVersion} → v{prop.proposedVersion}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Target: {prop.targetType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{prop.changesDescription}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {prop.status === "accepted" ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>APPLIED & VERIFIED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivate(prop.id)}
                      disabled={activatingId === prop.id}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{activatingId === prop.id ? "Activating..." : "Run Tests & Activate"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Architectural Rationale:</span>
                {prop.rationale}
              </div>

              {/* Benchmark Comparison: Before vs After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block mb-1">Baseline Metrics (Before)</span>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Pass Rate: {Math.round(prop.benchmarkMetricsBefore.successRate * 100)}%</span>
                    <span>Avg Latency: {prop.benchmarkMetricsBefore.avgLatencyMs}ms</span>
                    <span>Efficiency: {Math.round(prop.benchmarkMetricsBefore.toolEfficiency * 100)}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40">
                  <span className="text-purple-400 text-[10px] uppercase block mb-1">Projected Improvements (After)</span>
                  <div className="flex justify-between text-purple-200 text-[11px] font-semibold">
                    <span>Pass Rate: {Math.round(prop.benchmarkMetricsAfter.successRate * 100)}%</span>
                    <span>Avg Latency: {prop.benchmarkMetricsAfter.avgLatencyMs}ms</span>
                    <span>Efficiency: {Math.round(prop.benchmarkMetricsAfter.toolEfficiency * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
