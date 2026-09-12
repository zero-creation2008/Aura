/**
 * AURA - Task Orchestration & Directed Acyclic Graph (DAG) View
 * Visualizes task graph dependencies, parallel vs sequential execution lanes, and recovery paths.
 */

import React from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  GitFork,
  Layers,
  ListTodo,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import { AutonomousTask } from "../types";

interface TasksViewProps {
  tasks: AutonomousTask[];
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks }) => {
  const getStatusBadge = (status: AutonomousTask["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 flex items-center space-x-1 animate-pulse">
            <Zap className="w-3 h-3" />
            <span>EXECUTING</span>
          </span>
        );
      case "blocked":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-950/70 border border-amber-800/60 text-amber-300 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>BLOCKED ON DEP</span>
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-950/70 border border-rose-800/60 text-rose-300 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-400">
            QUEUED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <GitFork className="w-4 h-4" />
            <span>Autonomous Orchestration Queue</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Directed Acyclic Task Graph (DAG)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tasks run sequentially or in parallel execution lanes based on strict dependency ordering.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Total Tasks: <strong className="text-white">{tasks.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            Completed: <strong>{tasks.filter((t) => t.status === "completed").length}</strong>
          </span>
        </div>
      </div>

      {/* DAG Workflow Pipeline Cards */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const isParallel = task.executionMode === "parallel";
          return (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative group hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-sm text-white">{task.title}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      isParallel
                        ? "bg-purple-950/60 border border-purple-800/60 text-purple-300"
                        : "bg-blue-950/60 border border-blue-800/60 text-blue-300"
                    }`}
                  >
                    {task.executionMode} lane
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-400">Agent:</span>
                  <span className="text-xs font-mono font-semibold text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {task.assignedAgent}
                  </span>
                  {getStatusBadge(task.status)}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">{task.description}</p>

              {/* Sub-steps and duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {task.steps.map((step) => (
                  <div
                    key={step.id}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin" />
                      )}
                      <span className="text-slate-300 truncate">{step.name}</span>
                    </div>
                    {step.durationMs && (
                      <span className="text-slate-500 text-[10px] shrink-0">{step.durationMs}ms</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Dependencies badge */}
              {task.dependencies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                  <span>Dependencies:</span>
                  {task.dependencies.map((depId) => (
                    <span key={depId} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {depId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
