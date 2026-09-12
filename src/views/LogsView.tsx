/**
 * AURA - Audit Logs & Event Stream View
 * Filterable live log stream across all autonomous phases and agent roles.
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Download,
  FolderGit2,
  Info,
  Search,
  Terminal,
  Trash2,
} from "lucide-react";
import { OrchestrationLogEntry } from "../types";

interface LogsViewProps {
  logs: OrchestrationLogEntry[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "ALL" && log.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.phase.toLowerCase().includes(q) ||
        (log.agentName && log.agentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLogBadge = (type: OrchestrationLogEntry["type"]) => {
    switch (type) {
      case "agent":
        return <span className="text-cyan-400">AGENT</span>;
      case "code":
        return <span className="text-indigo-400">CODE</span>;
      case "git":
        return <span className="text-emerald-400">GIT</span>;
      case "success":
        return <span className="text-emerald-400">SUCCESS</span>;
      case "warning":
        return <span className="text-amber-400">WARN</span>;
      case "error":
        return <span className="text-rose-400">ERROR</span>;
      default:
        return <span className="text-slate-400">INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Terminal className="w-4 h-4" />
            <span>Autonomous Audit Log</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Live Telemetry & Event Stream</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Captures real-time agent decisions, code edits, AST repairs, and Git commits.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition-colors flex items-center space-x-2 shrink-0 border border-slate-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs JSON</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by agent, phase, or message keyword..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["ALL", "agent", "code", "git", "success", "warning", "error"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                filterType === type
                  ? "bg-cyan-950 border border-cyan-700 text-cyan-300 font-semibold"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Log Console Container */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs max-h-[600px] overflow-y-auto space-y-1.5 shadow-2xl">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-2 rounded hover:bg-slate-900/60 transition-colors flex items-start space-x-2.5 leading-relaxed"
          >
            <span className="text-slate-600 select-none text-[11px] shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="w-16 shrink-0 text-[10px] font-bold uppercase">{getLogBadge(log.type)}</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] shrink-0">
              {log.phase}
            </span>
            {log.agentName && (
              <span className="text-cyan-300 font-semibold shrink-0">
                [{log.agentName}]
              </span>
            )}
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-600">No logs found matching filter criteria.</div>
        )}
      </div>
    </div>
  );
};
