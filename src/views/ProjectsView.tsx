/**
 * AURA - Projects & Virtual Code Repository View
 * Interactive file tree, code viewer, architecture inspector, and dependency manifest.
 */

import React, { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  FileCode,
  FolderGit2,
  Layers,
  Plus,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Project, ProjectFile } from "../types";

interface ProjectsViewProps {
  projects: Project[];
  onTriggerCoding: (projectId: string, taskTitle: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onTriggerCoding }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Set default file if none selected
  const activeFile: ProjectFile | undefined =
    currentProject?.files.find((f) => f.path === selectedFilePath) || currentProject?.files[0];

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!taskPrompt.trim() || !currentProject) return;
    setIsGenerating(true);
    try {
      await onTriggerCoding(currentProject.id, taskPrompt.trim());
      setTaskPrompt("");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        No active projects found. Launch an autonomous goal from the Dashboard or Chat!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Repository Workspace
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-emerald-400">Status: {currentProject.status.toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">{currentProject.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentProject.description}</p>
        </div>

        {/* Project Selector if multiple */}
        {projects.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-mono">Switch Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedFilePath("");
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Autonomous Coding Action Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Ask BackendAgent to write a new module:</span>
        </div>
        <div className="flex-1 w-full flex gap-2">
          <input
            type="text"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            placeholder="e.g. Implement rate limiting middleware with token bucket algorithm..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            onClick={handleGenerate}
            disabled={!taskPrompt.trim() || isGenerating}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1 shrink-0"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Writing..." : "Generate Code"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor & File Tree Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl min-h-[550px]">
        {/* File Tree Sidebar */}
        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 flex flex-col">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Project Files ({currentProject.files.length})</span>
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {currentProject.files.map((file) => {
              const isSelected = activeFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 ${
                    isSelected
                      ? "bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 font-semibold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Dependencies Footer */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Dependencies</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(currentProject.dependencies).map(([name, ver]) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono"
                >
                  {name}@{ver}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="md:col-span-3 flex flex-col bg-slate-950">
          {activeFile ? (
            <>
              {/* File Title Bar */}
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-300">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">{activeFile.path}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-500">
                    Modified by: {activeFile.lastModifiedByAgent || "AutonomousEngine"}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Code with Line Numbers */}
              <div className="p-4 flex-1 overflow-auto font-mono text-xs text-slate-200 leading-relaxed">
                <table className="w-full border-collapse">
                  <tbody>
                    {activeFile.content.split("\n").map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="w-10 select-none text-slate-600 text-right pr-4 text-[11px] align-top">
                          {idx + 1}
                        </td>
                        <td className="whitespace-pre font-mono text-slate-300">{line || " "}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">Select a file to inspect source code.</div>
          )}
        </div>
      </div>

      {/* Architecture Manifest Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Autonomous Architecture Manifest</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-mono block text-[10px] uppercase">Frontend Layer</span>
            <span className="text-white font-medium block mt-1">{currentProject.architecture.frontend}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-mono block text-[10px] uppercase">Backend Layer</span>
            <span className="text-white font-medium block mt-1">{currentProject.architecture.backend}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-mono block text-[10px] uppercase">Database & Semantic Store</span>
            <span className="text-white font-medium block mt-1">{currentProject.architecture.database}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 font-mono block text-[10px] uppercase">Test & Validation</span>
            <span className="text-white font-medium block mt-1">{currentProject.architecture.testing}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
