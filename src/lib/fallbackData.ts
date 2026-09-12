/**
 * AURA - Client-Side Fallback & GitHub Pages Static Mode Provider
 * Provides rich initial telemetry, projects, agents, and repository data
 * when running as a standalone static bundle on GitHub Pages.
 */

import {
  Agent,
  AutonomousTask,
  GitRepository,
  KnowledgeChunk,
  Project,
  SystemTelemetry,
} from "../types";

export const initialFallbackTelemetry: SystemTelemetry = {
  orchestratorActive: false,
  activeAgentsCount: 10,
  completedTasksCount: 14,
  runningTasksCount: 0,
  totalCodeLinesGenerated: 1840,
  totalCommits: 8,
  knowledgeChunksCount: 12,
  systemUptimeSeconds: 1420,
  geminiCallsCount: 284,
  tokenUsageEstimate: 512000,
  autonomousMode: true,
};

export const initialFallbackAgents: Agent[] = [
  {
    id: "agent-exec",
    name: "ExecutiveAgent",
    role: "CustomSpecialist",
    purpose: "Strategic task decomposition, priority alignment, and multi-agent synthesis.",
    systemPrompt: "You are the ExecutiveAgent. You lead the autonomous engineering organization.",
    model: "gemini-3.8-flash",
    tools: ["orchestrator", "git", "task_queue"],
    permissions: ["all"],
    memory: ["Organization calibrated", "Standard SLA 100%"],
    version: 2,
    status: "idle",
    successCriteria: ["Project delivered with 100% test pass rate"],
    versionsHistory: [],
    tasksCompleted: 42,
    averageTaskDurationMs: 1200,
    lastActive: new Date().toISOString(),
  },
  {
    id: "agent-arch",
    name: "ArchitectAgent",
    role: "ArchitectAgent",
    purpose: "System architecture, service boundaries, technology stack selection.",
    systemPrompt: "You are the ArchitectAgent. Design scalable, modern, decoupled architectures.",
    model: "gemini-3.8-flash",
    tools: ["filesystem", "rfc_search"],
    permissions: ["architecture_spec"],
    memory: ["Micro-frontend specs approved"],
    version: 1,
    status: "idle",
    successCriteria: ["Clean boundary separation"],
    versionsHistory: [],
    tasksCompleted: 18,
    averageTaskDurationMs: 950,
    lastActive: new Date().toISOString(),
  },
  {
    id: "agent-fe",
    name: "FrontendAgent",
    role: "FrontendAgent",
    purpose: "React 19, responsive Tailwind CSS layouts, and interactive state management.",
    systemPrompt: "You are the FrontendAgent. Build accessible, modern, high-contrast interfaces.",
    model: "gemini-3.8-flash",
    tools: ["filesystem", "component_ast"],
    permissions: ["write_frontend"],
    memory: ["Tailwind v4 tokens applied"],
    version: 1,
    status: "idle",
    successCriteria: ["Zero visual defects", "Responsive UI"],
    versionsHistory: [],
    tasksCompleted: 35,
    averageTaskDurationMs: 1400,
    lastActive: new Date().toISOString(),
  },
  {
    id: "agent-be",
    name: "BackendAgent",
    role: "BackendAgent",
    purpose: "Node.js Express services, REST/SSE streaming endpoints, and business logic.",
    systemPrompt: "You are the BackendAgent. Build secure, non-blocking asynchronous APIs.",
    model: "gemini-3.8-flash",
    tools: ["filesystem", "api_tester"],
    permissions: ["write_backend"],
    memory: ["Rate limiters enabled"],
    version: 1,
    status: "idle",
    successCriteria: ["Contract compliance"],
    versionsHistory: [],
    tasksCompleted: 31,
    averageTaskDurationMs: 1600,
    lastActive: new Date().toISOString(),
  },
  {
    id: "agent-qa",
    name: "TestingAgent",
    role: "TestingAgent",
    purpose: "Unit testing, integration testing, and driving the Autonomous Debug Loop.",
    systemPrompt: "You are the TestingAgent. Enforce zero regression tolerances.",
    model: "gemini-3.8-flash",
    tools: ["test_runner", "ast_diagnoser"],
    permissions: ["run_tests"],
    memory: ["100% test coverage baseline"],
    version: 2,
    status: "idle",
    successCriteria: ["All suites passing"],
    versionsHistory: [],
    tasksCompleted: 45,
    averageTaskDurationMs: 1100,
    lastActive: new Date().toISOString(),
  },
];

export const initialFallbackProjects: Project[] = [
  {
    id: "project-chat-app",
    name: "AI Realtime Chat Application",
    description: "Production-grade autonomous AI chat service with SSE streaming, message persistence, and session management.",
    goal: "Build a complete, resilient AI chat application powered by Gemini 3.8 Flash with zero human supervision.",
    status: "tested",
    gitRepoId: "repo-aura-main",
    testSuitesCount: 4,
    testsPassing: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    architecture: {
      summary: "Decoupled micro-frontend and streaming API with Redis pub/sub and PostgreSQL message history.",
      frontend: "React 19, Tailwind CSS, Lucide Icons, EventSource Client",
      backend: "Node.js Express + TypeScript with SSE Chunk Streamer",
      database: "PostgreSQL with pgvector for semantic message retrieval",
      auth: "Bearer token session auth with RBAC permissions",
      apiStyle: "REST /api/chat + Server-Sent Events /api/stream",
      testing: "Vitest unit tests, Supertest API contract testing",
      deployment: "GitHub Pages SPA / Docker multi-stage container",
      rationale: "Selected for sub-100ms first token latency, fault tolerance, and automated testability.",
    },
    dependencies: {
      "@google/genai": "^2.4.0",
      "express": "^4.21.2",
      "react": "^19.0.1",
      "tailwindcss": "^4.1.14",
    },
    files: [
      {
        path: "src/server/chatService.ts",
        language: "typescript",
        lastModifiedByAgent: "BackendAgent",
        updatedAt: new Date().toISOString(),
        content: `import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export class ChatService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }

  async streamReply(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<string> {
    const formattedPrompt = messages.map(m => \`\${m.sender}: \${m.text}\`).join('\\n');
    const responseStream = await this.ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedPrompt,
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      fullText += text;
      onChunk(text);
    }
    return fullText;
  }
}
`,
      },
      {
        path: "tests/chatService.test.ts",
        language: "typescript",
        lastModifiedByAgent: "TestingAgent",
        updatedAt: new Date().toISOString(),
        content: `import { describe, it, expect } from 'vitest';
import { ChatService } from '../src/server/chatService';

describe('ChatService Integration Tests', () => {
  it('instantiates cleanly without throwing', () => {
    const service = new ChatService('test-api-key');
    expect(service).toBeDefined();
  });

  it('formats conversation memory correctly into prompt context', async () => {
    const messages = [
      { id: '1', sender: 'user' as const, text: 'Hello AURA', timestamp: new Date().toISOString() },
      { id: '2', sender: 'assistant' as const, text: 'Greetings!', timestamp: new Date().toISOString() }
    ];
    expect(messages.length).toBe(2);
    expect(messages[0].sender).toBe('user');
  });
});
`,
      },
      {
        path: "README.md",
        language: "markdown",
        lastModifiedByAgent: "DocumentationAgent",
        updatedAt: new Date().toISOString(),
        content: `# AI Realtime Chat Suite (Autonomous Project)

Built completely autonomously by **AURA** using the Google Gemini API.

## Architecture
- **Engine**: Gemini 3.8 Flash Streaming Provider
- **Runtime**: Node.js + Express
- **Frontend**: React + Tailwind CSS
- **Test Coverage**: 100% Passing Integration Suites
- **Hosting**: GitHub Pages Compatible

## Quickstart
\`\`\`bash
npm install
npm run test
npm run dev
\`\`\`
`,
      },
    ],
  },
];

export const initialFallbackGitRepo: GitRepository = {
  id: "repo-aura-main",
  name: "aura-autonomous-developer",
  remoteUrl: "https://github.com/seronjeyaseelan/aura-autonomous-developer",
  currentBranch: "main",
  branches: ["main", "aura/feature-chat-engine", "aura/debug-ast-repair"],
  commits: [
    {
      id: "c-1",
      hash: "8f41a9e",
      message: "feat: autonomous orchestrator 16-phase pipeline implementation",
      author: "AutonomousOrchestrator <aura@ai.studio>",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      branch: "main",
      filesChanged: 14,
      additions: 412,
      deletions: 12,
    },
    {
      id: "c-2",
      hash: "3b29c1d",
      message: "fix: AST bracket repair and Gemini model sanitization",
      author: "TestingAgent <aura@ai.studio>",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      branch: "aura/debug-ast-repair",
      filesChanged: 3,
      additions: 68,
      deletions: 4,
    },
    {
      id: "c-3",
      hash: "1d84f0a",
      message: "ci: add GitHub Pages automated deployment workflow",
      author: "DevOpsAgent <aura@ai.studio>",
      timestamp: new Date().toISOString(),
      branch: "main",
      filesChanged: 2,
      additions: 54,
      deletions: 0,
    },
  ],
  pullRequests: [
    {
      id: "pr-101",
      number: 1,
      title: "feat(core): Autonomous release v2.0 - Complete development swarm",
      description: "Automated Pull Request synthesized and verified across all test suites.",
      headBranch: "aura/feature-chat-engine",
      baseBranch: "main",
      author: "AURA GitAgent <aura@ai.studio>",
      status: "merged",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      ciChecks: [
        { name: "Vitest Test Suites", status: "passed", details: "4/4 suites green (100%)" },
        { name: "AST Syntax Validation", status: "passed", details: "Zero syntax faults" },
        { name: "GitHub Pages Build", status: "passed", details: "Static bundle generated in dist/" },
      ],
    },
  ],
};

export const initialFallbackTasks: AutonomousTask[] = [
  {
    id: "task-1",
    projectId: "project-chat-app",
    title: "Domain Research & API Verification",
    description: "Research Gemini 3.8 streaming protocols and standard contracts.",
    assignedAgent: "ResearchAgent",
    status: "completed",
    priority: "high",
    executionMode: "sequential",
    dependencies: [],
    steps: [{ id: "s1", name: "Query specs", status: "completed", assignedAgent: "ResearchAgent", durationMs: 450 }],
  },
  {
    id: "task-2",
    projectId: "project-chat-app",
    title: "Frontend UI & Reactive State Engine",
    description: "Implement responsive chat interface with streaming message bubbler.",
    assignedAgent: "FrontendAgent",
    status: "completed",
    priority: "high",
    executionMode: "parallel",
    dependencies: ["task-1"],
    steps: [{ id: "s2", name: "Build React components", status: "completed", assignedAgent: "FrontendAgent" }],
  },
  {
    id: "task-3",
    projectId: "project-chat-app",
    title: "Backend Core Engine & API Services",
    description: "Implement Node.js Express service with SSE chunk streamer.",
    assignedAgent: "BackendAgent",
    status: "completed",
    priority: "high",
    executionMode: "parallel",
    dependencies: ["task-1"],
    steps: [{ id: "s3", name: "Write service handler", status: "completed", assignedAgent: "BackendAgent" }],
  },
  {
    id: "task-4",
    projectId: "project-chat-app",
    title: "Automated Testing & Debug Verification",
    description: "Run Vitest integration suites and self-healing debug cycle.",
    assignedAgent: "TestingAgent",
    status: "completed",
    priority: "critical",
    executionMode: "sequential",
    dependencies: ["task-2", "task-3"],
    steps: [{ id: "s4", name: "Test verification", status: "completed", assignedAgent: "TestingAgent" }],
  },
];

export const initialFallbackKnowledge: KnowledgeChunk[] = [
  {
    id: "kc-1",
    partition: "Technical",
    title: "Gemini 3.8 Flash Streaming Integration",
    content: "Use ai.models.generateContentStream for sub-100ms first token responsiveness.",
    sourceType: "Official Documentation",
    sourceReference: "https://ai.google.dev/docs",
    embeddingDim: 768,
    tags: ["gemini", "streaming", "node"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "kc-2",
    partition: "Project",
    title: "GitHub Pages Deployment Strategy",
    content: "Configure base: './' in vite.config.ts and provide 404.html copy for SPA routing.",
    sourceType: "DevOps Best Practices",
    sourceReference: "https://pages.github.com",
    embeddingDim: 768,
    tags: ["github-pages", "vite", "deployment"],
    createdAt: new Date().toISOString(),
  },
];
