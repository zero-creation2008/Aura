/**
 * AURA - Top & Sidebar Navigation Bar
 */

import React from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode,
  FolderGit2,
  GitBranch,
  Layers,
  ListTodo,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { OrchestrationRun, SystemTelemetry } from "../types";

export type NavTab =
  | "frontpage"
  | "dashboard"
  | "chat"
  | "agents"
  | "projects"
  | "tasks"
  | "coding"
  | "research"
  | "knowledge"
  | "git"
  | "self-dev"
  | "logs"
  | "settings";

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  telemetry: SystemTelemetry | null;
  activeRun: OrchestrationRun | null;
  onPauseRun: () => void;
  onResumeRun: () => void;
  connected: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  telemetry,
  activeRun,
  onPauseRun,
  onResumeRun,
  connected,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: "frontpage", label: "AI Front Page", icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: "dashboard", label: "Dashboard", icon: <Activity className="w-4 h-4" /> },
    { id: "chat", label: "Autonomous Chat", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "projects", label: "Projects & Code", icon: <FileCode className="w-4 h-4" /> },
    { id: "tasks", label: "Task DAG Queue", icon: <ListTodo className="w-4 h-4" />, badge: telemetry?.runningTasksCount ? `${telemetry.runningTasksCount} active` : undefined },
    { id: "coding", label: "Coding & Debug", icon: <Code2 className="w-4 h-4" /> },
    { id: "agents", label: "Agents Factory", icon: <Bot className="w-4 h-4" />, badge: telemetry?.activeAgentsCount || 10 },
    { id: "research", label: "Research Engine", icon: <Search className="w-4 h-4" /> },
    { id: "knowledge", label: "pgvector Memory", icon: <BrainCircuit className="w-4 h-4" />, badge: telemetry?.knowledgeChunksCount },
    { id: "git", label: "Git Autonomy", icon: <FolderGit2 className="w-4 h-4" />, badge: telemetry?.totalCommits },
    { id: "self-dev", label: "Self-Developing", icon: <Sparkles className="w-4 h-4" /> },
    { id: "logs", label: "Audit Logs", icon: <Terminal className="w-4 h-4" /> },
    { id: "settings", label: "System & Models", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-200 select-none">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          onClick={() => onTabChange("frontpage")}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Go to AI Front Page"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/60 transition-colors">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">AURA</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-semibold">
                Autonomous Dev v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Gemini 3.8 Flash • Zero-Approval Software Company</p>
          </div>
        </div>

        {/* Global Pipeline / Orchestrator Status Pill */}
        <div className="hidden md:flex items-center space-x-3">
          {activeRun && activeRun.currentPhase !== "COMPLETED" && activeRun.currentPhase !== "FAILED" ? (
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300">Phase:</span>
              <span className="font-mono text-cyan-300 font-semibold uppercase">{activeRun.currentPhase}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{activeRun.progressPercent}%</span>
              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${activeRun.progressPercent}%` }}
                />
              </div>
              <button
                onClick={onPauseRun}
                title="Pause Autonomous Pipeline"
                className="p-1 hover:bg-slate-800 rounded text-amber-400 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Orchestrator Standby</span>
            </div>
          )}

          {/* Live SSE Status */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-rose-500"}`}
            />
            <span>{connected ? "LIVE BUS" : "RECONNECTING"}</span>
          </div>

          {/* Direct HTML Front Page Link */}
          <a
            href="/frontpage.html"
            target="_blank"
            rel="noreferrer"
            title="Open Standalone Pure HTML Front Page"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs text-cyan-300 font-mono hover:bg-cyan-900/80 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Pure HTML Page</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs Horizontal Bar */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex space-x-1 scrollbar-none border-t border-slate-900">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <span className={isActive ? "text-cyan-400" : "text-slate-500"}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
