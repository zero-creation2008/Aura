/**
 * AURA - Conversational Command Center (Chat View)
 * Interprets user commands into autonomous actions, triggers workflows, and reports progress.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { OrchestrationRun } from "../types";

interface Message {
  id: string;
  sender: "user" | "aura";
  text: string;
  actionTaken?: string;
  timestamp: string;
}

interface ChatViewProps {
  onSendMessage: (msg: string) => Promise<{ reply: string; actionTaken?: string }>;
  activeRun: OrchestrationRun | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ onSendMessage, activeRun }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-0",
      sender: "aura",
      text: `Hello! I am **AURA**, an autonomous AI software engineering organization powered by the Google Gemini API.

You give me a goal, and I independently handle:
**Understand → Research → Plan → Architect → Create Agents → Write Code → Run Code → Test → Detect Errors → Debug → Improve → Document → Git Commit → Release**.

What would you like to build or analyze today?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commandPresets = [
    "Build a complete AI chat application",
    "Find and fix all bugs",
    "Create an agent for DevOps and Cloud Deployments",
    "Research WebSockets vs Server-Sent Events",
    "Analyze this repository",
    "Improve performance & self-develop",
    "Update dependencies and security audit",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const response = await onSendMessage(text);
      const replyText = response?.reply || (response as any)?.content || "Instruction processed by autonomous agents.";
      const auraMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "aura",
        text: replyText,
        actionTaken: response?.actionTaken,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, auraMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "aura",
        text: `Encountered an issue processing instruction: ${err.message || "Network error"}. Please check API key configuration.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>AURA Autonomous Developer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Gemini 3.8 Flash • Zero-Approval Operator</p>
          </div>
        </div>

        {activeRun && (
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            <span>Executing:</span>
            <span className="text-slate-400 truncate max-w-xs">"{activeRun.userGoal}"</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAura = msg.sender === "aura";
          return (
            <div
              key={msg.id}
              className={`flex space-x-3 ${isAura ? "justify-start" : "justify-end"}`}
            >
              {isAura && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed relative group ${
                  isAura
                    ? "bg-slate-950 border border-slate-800 text-slate-200"
                    : "bg-cyan-600 text-slate-950 font-medium ml-12"
                }`}
              >
                {/* Action Triggered Badge */}
                {msg.actionTaken && (
                  <div className="mb-2 flex items-center space-x-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 w-fit">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Autonomous Action: {msg.actionTaken}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.text}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] opacity-70 font-mono">
                  <span>{msg.timestamp}</span>
                  {isAura && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity flex items-center space-x-1 ml-4"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>

              {!isAura && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex space-x-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-cyan-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AURA Autonomous Engine reasoning and decomposing instructions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Presets */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Command Presets:</span>
        {commandPresets.map((cmd, i) => (
          <button
            key={i}
            onClick={() => handleSend(cmd)}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a goal or command (e.g. 'Build an AI chat app', 'Fix all bugs', 'Research Kafka')..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans disabled:opacity-50"
          />
          <button
            id="chat-submit-button"
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-cyan-500 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
