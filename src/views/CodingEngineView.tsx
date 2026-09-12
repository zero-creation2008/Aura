/**
 * AURA - Autonomous Coding Engine & Autonomous Debug Loop View
 * Interactive workspace for inspect(), plan(), implement(), test(), diagnose(), and repair().
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code2,
  Cpu,
  FileCheck,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react";
import { DebugLoopIteration, Project } from "../types";

interface CodingEngineViewProps {
  project: Project;
  onRunDebugLoop: (projectId: string) => Promise<DebugLoopIteration[]>;
}

export const CodingEngineView: React.FC<CodingEngineViewProps> = ({ project, onRunDebugLoop }) => {
  const [isRunningLoop, setIsRunningLoop] = useState(false);
  const [iterations, setIterations] = useState<DebugLoopIteration[]>([
    {
      iteration: 1,
      inspectedFiles: ["src/features/chat.ts", "server.ts", "src/types.ts"],
      planDescription: "Compile AST and execute syntax verification tests.",
      modifiedFiles: [],
      testResults: [
        {
          id: "t-1",
          suiteName: "Syntax & Integrity",
          testName: "AST brace matching: src/features/chat.ts",
          passed: false,
          durationMs: 24,
          errorMessage: "Detected unclosed block token '}' in line 42",
        },
        {
          id: "t-2",
          suiteName: "Contract Verification",
          testName: "ChatService contract verification",
          passed: true,
          durationMs: 31,
        },
      ],
      errorsFound: [
        {
          category: "syntax",
          filePath: "src/features/chat.ts",
          rootCause: "Unclosed brace in chat response streaming reducer.",
          suggestedFix: "Inject closing bracket token and sanitize export statement.",
          confidence: 0.98,
        },
      ],
      repairActionTaken: "AST balancer patched src/features/chat.ts (+1 closing bracket).",
      passedAllTests: false,
      timestamp: "10:14:02 AM",
    },
    {
      iteration: 2,
      inspectedFiles: ["src/features/chat.ts"],
      planDescription: "Re-run full integrity test suite to verify repair.",
      modifiedFiles: ["src/features/chat.ts"],
      testResults: [
        {
          id: "t-3",
          suiteName: "Syntax & Integrity",
          testName: "AST brace matching: src/features/chat.ts",
          passed: true,
          durationMs: 18,
        },
        {
          id: "t-4",
          suiteName: "Contract Verification",
          testName: "ChatService contract verification",
          passed: true,
          durationMs: 29,
        },
      ],
      errorsFound: [],
      repairActionTaken: "All tests passing. Verification complete.",
      passedAllTests: true,
      timestamp: "10:14:03 AM",
    },
  ]);

  const handleTriggerLoop = async () => {
    setIsRunningLoop(true);
    try {
      const newIterations = await onRunDebugLoop(project.id);
      if (newIterations && newIterations.length > 0) {
        setIterations(newIterations);
      }
    } finally {
      setIsRunningLoop(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Bug className="w-4 h-4" />
            <span>Self-Healing Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonomous Debug Loop</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            while task_not_finished: inspect() → plan() → implement() → test() → diagnose() → repair() → verify()
          </p>
        </div>

        <button
          onClick={handleTriggerLoop}
          disabled={isRunningLoop}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 shrink-0"
        >
          {isRunningLoop ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Executing Debug Loop...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Trigger Autonomous Debug Loop</span>
            </>
          )}
        </button>
      </div>

      {/* Loop Blueprint Flow Diagram */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between overflow-x-auto text-xs font-mono gap-2 text-slate-400">
        <div className="flex items-center space-x-1 shrink-0 text-cyan-300 font-semibold">
          <FileCheck className="w-3.5 h-3.5" />
          <span>1. Inspect</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-purple-300 font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>2. Plan</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-indigo-300 font-semibold">
          <Code2 className="w-3.5 h-3.5" />
          <span>3. Implement</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-amber-300 font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>4. Test</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-rose-300 font-semibold">
          <Bug className="w-3.5 h-3.5" />
          <span>5. Diagnose</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-emerald-300 font-semibold">
          <Wrench className="w-3.5 h-3.5" />
          <span>6. Repair</span>
        </div>
        <span>→</span>
        <div className="flex items-center space-x-1 shrink-0 text-cyan-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>7. Verify</span>
        </div>
      </div>

      {/* Iteration Timeline Cards */}
      <div className="space-y-4">
        {iterations.map((iter) => (
          <div
            key={iter.iteration}
            className={`p-5 rounded-2xl border transition-all ${
              iter.passedAllTests
                ? "bg-slate-900 border-emerald-500/40 shadow-emerald-950/20"
                : "bg-slate-900 border-amber-500/40 shadow-amber-950/20"
            }`}
          >
            {/* Iteration Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                    iter.passedAllTests
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  #{iter.iteration}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">Debug Loop Iteration #{iter.iteration}</h4>
                  <p className="text-xs text-slate-400 font-mono">{iter.planDescription}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-slate-500">{iter.timestamp}</span>
                {iter.passedAllTests ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED PASSED</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>AUTO-REPAIR ENGAGED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Test Suite Results Grid */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Executed Test Suites:</span>
              {iter.testResults.map((test) => (
                <div
                  key={test.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center space-x-2">
                    {test.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-slate-300">{test.testName}</span>
                    {test.errorMessage && (
                      <span className="text-rose-400 text-[11px] italic">({test.errorMessage})</span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[10px]">{test.durationMs}ms</span>
                </div>
              ))}
            </div>

            {/* Repair Action Applied */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Action:</span>
                <span className="text-cyan-300 font-medium">{iter.repairActionTaken}</span>
              </div>
              {iter.modifiedFiles.length > 0 && (
                <span className="text-[11px] text-slate-500">
                  Patched: [{iter.modifiedFiles.join(", ")}]
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
