/**
 * AURA - AI Front Page / Portal View
 * Provides an interactive front page for AURA with live prompt simulation,
 * core capability showcase, pure HTML preview, and one-click goal execution.
 */

import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FolderGit2,
  GitBranch,
  Layers,
  Play,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { NavTab } from "../components/Navigation";
import { SystemTelemetry } from "../types";

interface FrontPageViewProps {
  telemetry: SystemTelemetry | null;
  onStartGoal: (goal: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const FrontPageView: React.FC<FrontPageViewProps> = ({
  telemetry,
  onStartGoal,
  onNavigateTab,
}) => {
  const [promptInput, setPromptInput] = useState(
    "Build a real-time collaborative document editor with operational transforms and vitest coverage"
  );
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [previewMode, setPreviewMode] = useState<"interactive" | "iframe">("interactive");

  const presetGoals = [
    "AI Real-time Chat Suite with SSE streaming & message persistence",
    "Distributed Microservices Gateway with rate limiting & JWT auth",
    "Markdown Knowledge Base with pgvector semantic search",
    "Automated CI/CD Pipeline for GitHub Pages with zero config",
  ];

  const handleLaunch = () => {
    if (!promptInput.trim()) return;
    onStartGoal(promptInput);
    onNavigateTab("dashboard");
  };

  const handleCopyHtmlPath = () => {
    navigator.clipboard.writeText(window.location.origin + "/frontpage.html");
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              AURA AI Front Page & Showcase
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Pure HTML front page available at <code className="text-cyan-300">/frontpage.html</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setPreviewMode("interactive")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                previewMode === "interactive"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive View</span>
            </button>
            <button
              onClick={() => setPreviewMode("iframe")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
                previewMode === "iframe"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HTML Frame Preview</span>
            </button>
          </div>

          <a
            href="/frontpage.html"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          >
            <span>Open HTML</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleCopyHtmlPath}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          >
            {copiedHtml ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied URL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Preview Mode */}
      {previewMode === "iframe" ? (
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <span className="ml-2 text-white">Live Embedded Preview: /frontpage.html</span>
            </div>
            <a
              href="/frontpage.html"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Window</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <iframe
            src="/frontpage.html"
            title="Aura AI Front Page"
            className="w-full h-[750px] border-none"
          />
        </div>
      ) : (
        /* Interactive Hero & Front Page */
        <>
          <section className="relative text-center py-12 px-4 sm:px-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Zero-Approval Autonomous Software Company</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                AURA: Autonomous AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  Engineering Swarm
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Direct an entire multi-agent software engineering team with a single goal. Powered by
                Google Gemini 3.8 Flash with self-healing debug loops and automated GitHub Pages deployment.
              </p>

              {/* Goal Input Console */}
              <div className="max-w-2xl mx-auto mt-6 p-2.5 rounded-2xl bg-slate-950 border border-slate-700/80 shadow-xl text-left">
                <label className="block text-[11px] font-mono text-cyan-400 uppercase font-semibold px-2 pb-1.5">
                  Launch Goal Directly to Swarm:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Enter what you want Aura to build..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleLaunch}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Run Goal</span>
                  </button>
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-900 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500 py-1 px-1">Presets:</span>
                  {presetGoals.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptInput(g)}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
                    >
                      {g.split(" with ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Jump buttons */}
              <div className="flex flex-wrap justify-center items-center gap-3 pt-4 text-xs font-mono">
                <button
                  onClick={() => onNavigateTab("dashboard")}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center space-x-2 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  <span>Mission Control Dashboard</span>
                </button>
                <button
                  onClick={() => onNavigateTab("chat")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Autonomous Chat</span>
                </button>
                <button
                  onClick={() => onNavigateTab("git")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                >
                  <FolderGit2 className="w-4 h-4 text-amber-400" />
                  <span>GitHub & Pages Deployment</span>
                </button>
              </div>
            </div>
          </section>

          {/* Real-time Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-cyan-400">{telemetry?.activeAgentsCount || 10}</div>
              <div className="text-[11px] text-slate-400 uppercase">Active Agents</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-[11px] text-slate-400 uppercase">Self-Healing Pass Rate</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-purple-400">4 Partitions</div>
              <div className="text-[11px] text-slate-400 uppercase">Vector Knowledge Memory</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl font-bold text-amber-400">16 Phases</div>
              <div className="text-[11px] text-slate-400 uppercase">Autonomous Pipeline</div>
            </div>
          </div>

          {/* The 4 Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic 10-Agent Swarm</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Role-specialized agents (Executive, Architect, Frontend, Backend, Testing, DevOps, Security, Docs, Research, Git) collaborate autonomously without human intervention.
              </p>
              <button
                onClick={() => onNavigateTab("agents")}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Inspect Agent Factory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Self-Healing AST Debug Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Autonomous 6-step loop fixes bracket mismatches, generates missing unit tests, and verifies all Vitest suites before writing Git commits.
              </p>
              <button
                onClick={() => onNavigateTab("coding")}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>View Self-Healing Loop</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">4-Partition Continuous Memory</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                pgvector-compatible semantic storage splits context across Technical, Architectural, Project, and Agent memories for cross-project retention.
              </p>
              <button
                onClick={() => onNavigateTab("knowledge")}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Explore Memory Partitions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Git Autonomy & GitHub Pages CI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Targeting <code className="text-cyan-300">zero-creation2008/Aura</code> with automated branch management, conventional commits, pull requests, and automated deployment actions.
              </p>
              <button
                onClick={() => onNavigateTab("git")}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>Open Deployment Manager</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
