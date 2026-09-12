/**
 * AURA - Live Events Ticker Bar
 * Displays incoming real-time telemetry events across all autonomous agents.
 */

import React from "react";
import { OrchestrationLogEntry } from "../types";
import { Activity, AlertTriangle, Bot, CheckCircle2, Code2, FolderGit2, Info } from "lucide-react";

interface LiveEventTickerProps {
  logs: OrchestrationLogEntry[];
}

export const LiveEventTicker: React.FC<LiveEventTickerProps> = ({ logs }) => {
  const latestLog = logs[0];

  const getIcon = (type: OrchestrationLogEntry["type"]) => {
    switch (type) {
      case "agent":
        return <Bot className="w-3.5 h-3.5 text-cyan-400" />;
      case "code":
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case "git":
        return <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "warning":
      case "error":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between font-mono overflow-hidden">
      <div className="flex items-center space-x-2 truncate pr-4">
        <span className="flex items-center space-x-1.5 text-cyan-400 shrink-0 uppercase text-[10px] tracking-wider font-semibold">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>LIVE TELEMETRY:</span>
        </span>

        {latestLog ? (
          <div className="flex items-center space-x-2 truncate">
            {getIcon(latestLog.type)}
            {latestLog.agentName && (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                [{latestLog.agentName}]
              </span>
            )}
            <span className="truncate text-slate-200">{latestLog.message}</span>
          </div>
        ) : (
          <span className="text-slate-500 italic">Listening for autonomous development events...</span>
        )}
      </div>

      <div className="hidden sm:flex items-center space-x-4 text-[11px] text-slate-400 shrink-0">
        <span className="text-slate-500">Autonomous Mode: <strong className="text-emerald-400 font-normal">ENABLED</strong></span>
        <span>|</span>
        <span>Approvals: <strong className="text-cyan-400 font-normal">ZERO-MANUAL</strong></span>
      </div>
    </div>
  );
};
