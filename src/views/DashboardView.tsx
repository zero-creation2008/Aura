/**
 * AURA - Dashboard View
 * Executive mission control for the autonomous software development platform.
 */

import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  FolderGit2,
  ListTodo,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Agent, OrchestrationLogEntry, OrchestrationRun, Project, SystemTelemetry } from "../types";

interface DashboardViewProps {
  telemetry: SystemTelemetry | null;
  activeRun: OrchestrationRun | null;
  projects: Project[];
  agents: Agent[];
  logs: OrchestrationLogEntry[];
  onStartGoal: (goal: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  telemetry,
  activeRun,
  projects,
  agents,
  logs,
  onStartGoal,
  onNavigateTab,
}) => {
  const [goalInput, setGoalInput] = useState("");

  const presetGoals = [
    "Build a complete AI chat application with streaming responses",
    "Create an e-commerce platform with stripe checkout and cart state",
    "Build a real-time collaborative code editor with WebSocket sync",
    "Develop a high-throughput crypto portfolio tracker with pgvector search",
  ];

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      onStartGoal(goalInput.trim());
      setGoalInput("");
    }
  };

  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Autonomous Goal Quick-Launcher */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Software Generation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            Give AURA a software goal. It will build, test, and release it autonomously.
          </h2>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            AURA decomposes your intent into architectural plans, creates specialized agents, writes multi-file code,
            executes tests, diagnoses errors in a continuous debug loop, and pushes version-controlled Git commits.
          </p>

          <form onSubmit={handleSubmitGoal} className="flex gap-2">
            <input
              id="goal-input-field"
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Build me a complete AI chat application..."
              className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
            <button
              id="launch-goal-button"
              type="submit"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch AURA</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Quick Ideas:</span>
            {presetGoals.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onStartGoal(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors text-left text-[11px] truncate max-w-xs"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metrics Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Swarm Agents</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{agents.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center space-x-1">
            <span>● 100% active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Code Lines</span>
            <Code2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {telemetry?.totalCodeLinesGenerated.toLocaleString() || "640"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Multi-file tree</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Test Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">100% PASS</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Autonomous debug loop</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Git Commits</span>
            <FolderGit2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{telemetry?.totalCommits || "3"}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Conventional commits</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>pgvector Memory</span>
            <BrainCircuit className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{telemetry?.knowledgeChunksCount || "5"}</div>
          <div className="text-[10px] text-purple-300 mt-1 font-mono">4 Partitions indexed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Approvals</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">0</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">100% Autonomous</div>
        </div>
      </div>

      {/* Active Orchestration Status & Pipeline Stepper */}
      {activeRun && (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="uppercase font-semibold">Active Autonomous Orchestration</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">"{activeRun.userGoal}"</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">Progress:</span>
              <span className="text-lg font-mono font-bold text-cyan-300 ml-2">{activeRun.progressPercent}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-3 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${activeRun.progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-300 font-mono flex items-center space-x-2">
            <span className="text-slate-500">Current Action:</span>
            <span className="text-cyan-300 font-medium">{activeRun.currentStepDescription}</span>
          </p>
        </div>
      )}

      {/* Two Column Layout: Recent Project & Active Agents Swarm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Project Card */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Active Project Workspace</h3>
              </div>
              <button
                onClick={() => onNavigateTab("projects")}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Explore Code & Files</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeProject ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold text-sm">{activeProject.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{activeProject.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">FRONTEND</span>
                    <span className="text-slate-200 truncate block mt-0.5">{activeProject.architecture.frontend.split(",")[0]}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">BACKEND</span>
                    <span className="text-slate-200 truncate block mt-0.5">{activeProject.architecture.backend.split(" ")[0]}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DATABASE</span>
                    <span className="text-slate-200 truncate block mt-0.5">{activeProject.architecture.database.split(" ")[0]}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">TEST STATUS</span>
                    <span className="text-emerald-400 font-semibold block mt-0.5">Passing (100%)</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="font-mono text-slate-500">Virtual Files Generated:</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeProject.files.map((file, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                      >
                        {file.path}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No project created yet. Launch a goal above!</p>
            )}
          </div>
        </div>

        {/* Autonomous Swarm Matrix */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Swarm Matrix</h3>
            </div>
            <button
              onClick={() => onNavigateTab("agents")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {agents.slice(0, 6).map((agent) => (
              <div
                key={agent.id}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-200">{agent.name}</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">v{agent.version}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{agent.purpose}</p>
                </div>
                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 uppercase">
                    Ready
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{agent.tasksCompleted} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
