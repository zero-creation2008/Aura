/**
 * AURA - Central State & In-Memory Database Store
 * Implements persistent data records, event bus, and pgvector memory simulation.
 */

import {
  Agent,
  AgentVersion,
  AutonomousTask,
  GitCommit,
  GitRepository,
  ImprovementProposal,
  KnowledgeChunk,
  OrchestrationLogEntry,
  OrchestrationRun,
  Project,
  PullRequest,
  SystemTelemetry,
  SystemVersion,
  TechnicalResearchItem,
  DynamicTool,
  ToolExecution,
} from "../src/types";

class StateStore {
  public projects: Project[] = [];
  public agents: Agent[] = [];
  public tasks: AutonomousTask[] = [];
  public repositories: GitRepository[] = [];
  public knowledge: KnowledgeChunk[] = [];
  public researchItems: TechnicalResearchItem[] = [];
  public tools: DynamicTool[] = [];
  public toolExecutions: ToolExecution[] = [];
  public improvementProposals: ImprovementProposal[] = [];
  public systemVersions: SystemVersion[] = [];
  public activeRun: OrchestrationRun | null = null;
  public logs: OrchestrationLogEntry[] = [];
  public subscribers: ((event: OrchestrationLogEntry) => void)[] = [];

  constructor() {
    this.seedInitialData();
  }

  public subscribe(callback: (event: OrchestrationLogEntry) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  public broadcast(entry: OrchestrationLogEntry) {
    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    for (const sub of this.subscribers) {
      try {
        sub(entry);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    }
  }

  public getTelemetry(): SystemTelemetry {
    let totalFiles = 0;
    let totalLines = 0;
    for (const p of this.projects) {
      totalFiles += p.files.length;
      for (const f of p.files) {
        totalLines += f.content.split("\n").length;
      }
    }

    let totalCommits = 0;
    for (const r of this.repositories) {
      totalCommits += r.commits.length;
    }

    return {
      orchestratorActive: !!this.activeRun && this.activeRun.currentPhase !== "COMPLETED" && this.activeRun.currentPhase !== "FAILED",
      activeAgentsCount: this.agents.filter((a) => a.status === "running").length,
      completedTasksCount: this.tasks.filter((t) => t.status === "completed").length,
      runningTasksCount: this.tasks.filter((t) => t.status === "in_progress").length,
      totalCodeLinesGenerated: totalLines,
      totalCommits: totalCommits,
      knowledgeChunksCount: this.knowledge.length,
      systemUptimeSeconds: Math.floor(process.uptime()),
      geminiCallsCount: 142 + this.toolExecutions.length,
      tokenUsageEstimate: 348290 + (this.toolExecutions.length * 4500),
      autonomousMode: true,
    };
  }

  private seedInitialData() {
    // 1. Seed Core Agents (10 specialized autonomous roles)
    const initialAgents: Agent[] = [
      {
        id: "agent-architect",
        name: "ArchitectAgent",
        role: "ArchitectAgent",
        purpose: "Analyzes system goals, decomposes complexity, and designs resilient micro-architectures.",
        systemPrompt: "You are the Senior Systems Architect. You design modular, scalable architectures adhering to clean code and SOLID principles.",
        model: "gemini-3.8-flash",
        tools: ["filesystem", "memory", "web_search"],
        permissions: ["read_repo", "write_architecture_spec"],
        memory: ["Favors decoupled event buses", "Prefers TypeScript strict mode"],
        version: 2,
        status: "idle",
        successCriteria: ["Architecture diagram generated", "Tech stack selected with rationale"],
        versionsHistory: [
          {
            version: 1,
            systemPrompt: "You are an architecture planner.",
            model: "gemini-3.8-flash",
            tools: ["filesystem"],
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            performanceScore: 0.88,
          },
          {
            version: 2,
            systemPrompt: "You are the Senior Systems Architect. You design modular, scalable architectures adhering to clean code and SOLID principles.",
            model: "gemini-3.8-flash",
            tools: ["filesystem", "memory", "web_search"],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            performanceScore: 0.96,
            changeLog: "Enhanced dependency tree validation and multi-agent coordination specs.",
          },
        ],
        tasksCompleted: 34,
        averageTaskDurationMs: 4200,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-researcher",
        name: "ResearchAgent",
        role: "ResearchAgent",
        purpose: "Researches official documentation, libraries, GitHub repositories, and validates best practices.",
        systemPrompt: "You are the Autonomous Research Specialist. You investigate official documentation, verify API signatures, and summarize primary sources.",
        model: "gemini-3.8-flash",
        tools: ["web_search", "web_fetch", "memory"],
        permissions: ["query_external_docs", "store_knowledge"],
        memory: ["Validates npm package health before recommending", "Checks node version compatibility"],
        version: 1,
        status: "idle",
        successCriteria: ["At least 2 primary sources validated", "Actionable implementation notes created"],
        versionsHistory: [
          {
            version: 1,
            systemPrompt: "You are the Autonomous Research Specialist. You investigate official documentation, verify API signatures, and summarize primary sources.",
            model: "gemini-3.8-flash",
            tools: ["web_search", "web_fetch", "memory"],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            performanceScore: 0.92,
          }
        ],
        tasksCompleted: 48,
        averageTaskDurationMs: 3100,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-frontend",
        name: "FrontendAgent",
        role: "FrontendAgent",
        purpose: "Builds modern, responsive, fluid user interfaces with React, Tailwind CSS, and robust state management.",
        systemPrompt: "You are the Lead Frontend Developer. You write pristine, high-contrast accessible UI components with zero slop and smooth transitions.",
        model: "gemini-3.8-flash",
        tools: ["filesystem", "terminal"],
        permissions: ["write_frontend_files", "run_vite_build"],
        memory: ["Prefers Tailwind utility styling", "Ensures mobile-first responsiveness"],
        version: 1,
        status: "idle",
        successCriteria: ["Frontend builds without syntax warnings", "Responsive across mobile and desktop"],
        versionsHistory: [],
        tasksCompleted: 52,
        averageTaskDurationMs: 6400,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-backend",
        name: "BackendAgent",
        role: "BackendAgent",
        purpose: "Constructs high-performance APIs, asynchronous message handlers, and database integrations.",
        systemPrompt: "You are the Principal Backend Engineer. You implement secure API endpoints, validation schemas, and database transactions.",
        model: "gemini-3.8-flash",
        tools: ["filesystem", "terminal", "database"],
        permissions: ["write_backend_files", "run_node_tests"],
        memory: ["Applies rate limiting and input sanitization", "Always uses parameterized SQL queries"],
        version: 1,
        status: "idle",
        successCriteria: ["Endpoints pass contract tests", "Zero unhandled promise rejections"],
        versionsHistory: [],
        tasksCompleted: 45,
        averageTaskDurationMs: 5800,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-database",
        name: "DatabaseAgent",
        role: "DatabaseAgent",
        purpose: "Designs database schemas, relational migrations, indexing strategies, and vector embeddings.",
        systemPrompt: "You are the Database & Storage Architect. You write idempotent SQL migrations, index hot paths, and configure pgvector.",
        model: "gemini-3.8-flash",
        tools: ["database", "filesystem"],
        permissions: ["run_migrations", "execute_sql_dml"],
        memory: ["Indexes foreign keys", "Uses UUIDv4 primary keys"],
        version: 1,
        status: "idle",
        successCriteria: ["Migration executes idempotently", "Foreign keys and indices established"],
        versionsHistory: [],
        tasksCompleted: 29,
        averageTaskDurationMs: 3800,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-security",
        name: "SecurityAgent",
        role: "SecurityAgent",
        purpose: "Performs static vulnerability audits, secret exposure checks, dependency scanning, and RBAC validation.",
        systemPrompt: "You are the Senior Security Auditor. You verify no secrets leak into client bundles, check CORS headers, and audit auth flows.",
        model: "gemini-3.8-flash",
        tools: ["filesystem", "terminal"],
        permissions: ["audit_repo", "block_commit_on_vulnerability"],
        memory: ["Strict check: NEVER allow GEMINI_API_KEY in client bundles", "Sanitize all user inputs"],
        version: 1,
        status: "idle",
        successCriteria: ["Zero high/critical security findings", "Environment variables properly isolated"],
        versionsHistory: [],
        tasksCompleted: 38,
        averageTaskDurationMs: 2900,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-testing",
        name: "TestingAgent",
        role: "TestingAgent",
        purpose: "Generates comprehensive unit, integration, API, and UI regression test suites.",
        systemPrompt: "You are the Lead QA Automation Engineer. You create rigorous test cases covering edge cases, failure states, and performance limits.",
        model: "gemini-3.8-flash",
        tools: ["testing", "terminal", "filesystem"],
        permissions: ["create_tests", "run_test_runner"],
        memory: ["Mocks network calls in unit tests", "Asserts exact error response structures"],
        version: 1,
        status: "idle",
        successCriteria: ["Code coverage > 85%", "All critical paths tested"],
        versionsHistory: [],
        tasksCompleted: 58,
        averageTaskDurationMs: 4600,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-debug",
        name: "DebugAgent",
        role: "DebugAgent",
        purpose: "Executes the autonomous debug loop: inspects stack traces, isolates root causes, and applies verified fixes.",
        systemPrompt: "You are the Autonomous Debug Specialist. When tests or builds fail, you parse error logs, hypothesize root causes, and patch code.",
        model: "gemini-3.8-flash",
        tools: ["filesystem", "terminal", "testing"],
        permissions: ["read_logs", "patch_files", "retest"],
        memory: ["Checks for off-by-one errors", "Checks import path casing on Linux"],
        version: 1,
        status: "idle",
        successCriteria: ["Error eliminated", "Regression tests confirm fix"],
        versionsHistory: [],
        tasksCompleted: 61,
        averageTaskDurationMs: 5100,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-docs",
        name: "DocumentationAgent",
        role: "DocumentationAgent",
        purpose: "Maintains clear, accurate READMEs, OpenAPI specs, architecture guides, and changelogs.",
        systemPrompt: "You are the Technical Writer Agent. You generate developer-friendly README files, API specs, and setup instructions.",
        model: "gemini-3.8-flash",
        tools: ["filesystem"],
        permissions: ["write_documentation"],
        memory: ["Includes copy-paste quickstart commands", "Documents environment variables clearly"],
        version: 1,
        status: "idle",
        successCriteria: ["README up to date", "All exported endpoints documented"],
        versionsHistory: [],
        tasksCompleted: 39,
        averageTaskDurationMs: 2500,
        lastActive: new Date().toISOString(),
      },
      {
        id: "agent-git",
        name: "GitAgent",
        role: "GitAgent",
        purpose: "Manages Git autonomy: branches, semantic conventional commits, PR creation, and merge operations.",
        systemPrompt: "You are the Git & Release Coordinator. You structure atomic commits, manage feature branches, and write comprehensive PR descriptions.",
        model: "gemini-3.8-flash",
        tools: ["git", "github"],
        permissions: ["git_branch", "git_commit", "git_push", "create_pr"],
        memory: ["Uses Conventional Commits (feat, fix, docs, refactor)", "Never commits build artifacts"],
        version: 1,
        status: "idle",
        successCriteria: ["Clean Git history", "Automated Pull Request merged upon green CI"],
        versionsHistory: [],
        tasksCompleted: 67,
        averageTaskDurationMs: 1800,
        lastActive: new Date().toISOString(),
      },
    ];
    this.agents = initialAgents;

    // 2. Seed Core Dynamic Tools
    this.tools = [
      {
        id: "tool-fs",
        name: "filesystem",
        description: "Read, write, diff, search, and list files inside the project sandbox.",
        category: "core",
        riskLevel: "low",
        timeoutMs: 15000,
        permissions: ["fs:read", "fs:write"],
        inputSchema: { type: "object", properties: { path: { type: "string" }, content: { type: "string" }, action: { type: "string" } } },
        outputSchema: { type: "object", properties: { success: { type: "boolean" }, content: { type: "string" } } },
        usageCount: 412,
        avgDurationMs: 45,
      },
      {
        id: "tool-term",
        name: "terminal",
        description: "Executes non-blocking sandboxed terminal commands with timeout enforcement.",
        category: "core",
        riskLevel: "moderate",
        timeoutMs: 60000,
        permissions: ["exec:isolated"],
        inputSchema: { type: "object", properties: { command: { type: "string" } } },
        outputSchema: { type: "object", properties: { exitCode: { type: "number" }, stdout: { type: "string" }, stderr: { type: "string" } } },
        usageCount: 284,
        avgDurationMs: 1200,
      },
      {
        id: "tool-git",
        name: "git",
        description: "Local Git repository operations: branch, status, diff, commit, rebase, tag.",
        category: "core",
        riskLevel: "safe",
        timeoutMs: 20000,
        permissions: ["git:local"],
        inputSchema: { type: "object", properties: { action: { type: "string" }, message: { type: "string" }, branch: { type: "string" } } },
        outputSchema: { type: "object", properties: { commitHash: { type: "string" }, branch: { type: "string" } } },
        usageCount: 198,
        avgDurationMs: 110,
      },
      {
        id: "tool-github",
        name: "github",
        description: "Remote GitHub API integration: create PRs, sync branches, fetch CI status.",
        category: "core",
        riskLevel: "low",
        timeoutMs: 30000,
        permissions: ["github:pr", "github:repo"],
        inputSchema: { type: "object", properties: { action: { type: "string" }, prTitle: { type: "string" }, baseBranch: { type: "string" } } },
        outputSchema: { type: "object", properties: { prUrl: { type: "string" }, prNumber: { type: "number" } } },
        usageCount: 76,
        avgDurationMs: 450,
      },
      {
        id: "tool-search",
        name: "web_search",
        description: "Searches official documentation, tech RFCs, package registries, and StackOverflow.",
        category: "core",
        riskLevel: "safe",
        timeoutMs: 15000,
        permissions: ["network:search"],
        inputSchema: { type: "object", properties: { query: { type: "string" }, domainConstraint: { type: "string" } } },
        outputSchema: { type: "object", properties: { results: { type: "array" } } },
        usageCount: 165,
        avgDurationMs: 820,
      },
      {
        id: "tool-fetch",
        name: "web_fetch",
        description: "Fetches and extracts clean markdown from technical documentation websites.",
        category: "core",
        riskLevel: "safe",
        timeoutMs: 15000,
        permissions: ["network:fetch"],
        inputSchema: { type: "object", properties: { url: { type: "string" } } },
        outputSchema: { type: "object", properties: { title: { type: "string" }, markdown: { type: "string" } } },
        usageCount: 92,
        avgDurationMs: 640,
      },
      {
        id: "tool-db",
        name: "database",
        description: "Executes SQL statements, schema migrations, and pgvector vector similarity searches.",
        category: "core",
        riskLevel: "moderate",
        timeoutMs: 30000,
        permissions: ["db:query", "db:migrate"],
        inputSchema: { type: "object", properties: { sql: { type: "string" }, params: { type: "array" } } },
        outputSchema: { type: "object", properties: { rows: { type: "array" }, rowCount: { type: "number" } } },
        usageCount: 115,
        avgDurationMs: 75,
      },
      {
        id: "tool-py",
        name: "python",
        description: "Runs sandboxed Python scripts for data transformations or algorithmic verification.",
        category: "specialized",
        riskLevel: "moderate",
        timeoutMs: 30000,
        permissions: ["exec:python"],
        inputSchema: { type: "object", properties: { script: { type: "string" } } },
        outputSchema: { type: "object", properties: { output: { type: "string" } } },
        usageCount: 45,
        avgDurationMs: 890,
      },
      {
        id: "tool-docker",
        name: "docker",
        description: "Builds container images, orchestrates microservice containers, and manages isolated test sandboxes.",
        category: "specialized",
        riskLevel: "high",
        timeoutMs: 120000,
        permissions: ["docker:compose", "docker:build"],
        inputSchema: { type: "object", properties: { command: { type: "string" } } },
        outputSchema: { type: "object", properties: { containerId: { type: "string" }, status: { type: "string" } } },
        usageCount: 38,
        avgDurationMs: 3200,
      },
      {
        id: "tool-test",
        name: "testing",
        description: "Automated test executor: runs unit tests, parses TAP/JUnit reports, and computes code coverage.",
        category: "core",
        riskLevel: "safe",
        timeoutMs: 60000,
        permissions: ["test:run"],
        inputSchema: { type: "object", properties: { testSuitePath: { type: "string" } } },
        outputSchema: { type: "object", properties: { passed: { type: "boolean" }, totalTests: { type: "number" }, failures: { type: "array" } } },
        usageCount: 220,
        avgDurationMs: 1650,
      },
      {
        id: "tool-mem",
        name: "memory",
        description: "Interacts with AURA's 4-partition pgvector memory (store, search, update, link).",
        category: "core",
        riskLevel: "safe",
        timeoutMs: 10000,
        permissions: ["memory:read", "memory:write"],
        inputSchema: { type: "object", properties: { partition: { type: "string" }, action: { type: "string" }, query: { type: "string" } } },
        outputSchema: { type: "object", properties: { chunks: { type: "array" } } },
        usageCount: 310,
        avgDurationMs: 50,
      },
    ];

    // 3. Seed Repository
    const initialRepo: GitRepository = {
      id: "repo-chat-app",
      name: "Aura",
      currentBranch: "main",
      branches: ["main", "feature/stream-resilience", "aura/autonomous-debug-v1"],
      remoteUrl: "https://github.com/zero-creation2008/Aura.git",
      commits: [
        {
          id: "c1",
          hash: "a4f89d1",
          message: "feat(core): initial scaffold with autonomous agent orchestration",
          author: "AURA GitAgent <aura@ai.studio>",
          branch: "main",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          filesChanged: 8,
          additions: 420,
          deletions: 0,
        },
        {
          id: "c2",
          hash: "7b3e102",
          message: "test(suites): add integration test coverage for real-time SSE stream",
          author: "AURA TestingAgent <aura@ai.studio>",
          branch: "main",
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          filesChanged: 3,
          additions: 145,
          deletions: 12,
        },
        {
          id: "c3",
          hash: "29fbc44",
          message: "fix(debug): resolve unhandled promise rejection in model stream error recovery",
          author: "AURA DebugAgent <aura@ai.studio>",
          branch: "main",
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          filesChanged: 2,
          additions: 38,
          deletions: 9,
        },
      ],
      pullRequests: [
        {
          id: "pr-1",
          number: 14,
          title: "feat(stream): autonomous streaming channel with backpressure control",
          description: "### Summary\n- Created backpressure-aware SSE chunk pipeline.\n- Added automated unit and resilience test suites.\n- Passed 100% CI checks without human intervention.",
          headBranch: "feature/stream-resilience",
          baseBranch: "main",
          author: "AURA AutonomousOrchestrator",
          status: "merged",
          ciChecks: [
            { name: "lint & typecheck", status: "passed", details: "Zero errors" },
            { name: "unit tests (Vitest)", status: "passed", details: "24 / 24 passed (100%)" },
            { name: "security scan", status: "passed", details: "No secret leaks detected" },
          ],
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          mergedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };
    this.repositories.push(initialRepo);

    // 4. Seed Project with Multi-File Codebase
    const initialProject: Project = {
      id: "project-chat-app",
      name: "AI Realtime Chat Application",
      description: "Production-grade autonomous AI chat service with SSE streaming, message persistence, and session management.",
      goal: "Build a complete, resilient AI chat application powered by Gemini 3.8 Flash with zero human supervision.",
      status: "tested",
      gitRepoId: initialRepo.id,
      testSuitesCount: 4,
      testsPassing: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      architecture: {
        summary: "Decoupled micro-frontend and streaming API with Redis pub/sub and PostgreSQL message history.",
        frontend: "React 19, Tailwind CSS, Lucide Icons, EventSource Client",
        backend: "Node.js Express + TypeScript with SSE Chunk Streamer",
        database: "PostgreSQL with pgvector for semantic message retrieval",
        auth: "Bearer token session auth with RBAC permissions",
        apiStyle: "REST /api/chat + Server-Sent Events /api/stream",
        testing: "Vitest unit tests, Supertest API contract testing",
        deployment: "Docker multi-stage container on Cloud Run with health checks",
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
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
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
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
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

## Quickstart
\`\`\`bash
npm install
npm run test
npm run dev
\`\`\`
`,
        },
      ],
    };
    this.projects.push(initialProject);

    // 5. Seed Tasks with Dependencies (DAG)
    this.tasks = [
      {
        id: "task-001",
        projectId: initialProject.id,
        title: "Task 001 — Domain & Requirement Research",
        description: "Deep dive into real-time streaming protocols, SSE versus WebSockets, and Gemini API streaming parameters.",
        assignedAgent: "ResearchAgent",
        status: "completed",
        priority: "high",
        executionMode: "sequential",
        dependencies: [],
        steps: [
          { id: "s1", name: "Query official Google GenAI docs", status: "completed", assignedAgent: "ResearchAgent", durationMs: 1200 },
          { id: "s2", name: "Validate SSE backpressure handling", status: "completed", assignedAgent: "ResearchAgent", durationMs: 950 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 4.8).toISOString(),
        resultSummary: "Validated SSE as optimal low-overhead choice for unidirection token streaming.",
      },
      {
        id: "task-002",
        projectId: initialProject.id,
        title: "Task 002 — Micro-Architecture Specification",
        description: "Synthesize research into formal architecture layout, tech stack selection, and API contracts.",
        assignedAgent: "ArchitectAgent",
        status: "completed",
        priority: "critical",
        executionMode: "sequential",
        dependencies: ["task-001"],
        steps: [
          { id: "s3", name: "Draft component dependency graph", status: "completed", assignedAgent: "ArchitectAgent", durationMs: 2400 },
          { id: "s4", name: "Define database & memory schemas", status: "completed", assignedAgent: "ArchitectAgent", durationMs: 1800 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 4.8).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
        resultSummary: "Architectural blueprint finalized with clean service boundaries.",
      },
      {
        id: "task-003",
        projectId: initialProject.id,
        title: "Task 003 — Frontend Chat UI & State Layer",
        description: "Implement responsive conversation stream, message bubbles, markdown renderer, and connection status.",
        assignedAgent: "FrontendAgent",
        status: "completed",
        priority: "high",
        executionMode: "parallel",
        dependencies: ["task-002"],
        steps: [
          { id: "s5", name: "Build ChatMessageList and input controls", status: "completed", assignedAgent: "FrontendAgent", durationMs: 3100 },
          { id: "s6", name: "Mount EventSource hook with auto-reconnect", status: "completed", assignedAgent: "FrontendAgent", durationMs: 2200 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        resultSummary: "Modern responsive chat interface mounted with zero layout shifts.",
      },
      {
        id: "task-004",
        projectId: initialProject.id,
        title: "Task 004 — Backend Streaming Service & Endpoints",
        description: "Implement Express SSE streaming route, chat service provider wrapper, and error handling.",
        assignedAgent: "BackendAgent",
        status: "completed",
        priority: "high",
        executionMode: "parallel",
        dependencies: ["task-002"],
        steps: [
          { id: "s7", name: "Implement ChatService with Google GenAI SDK", status: "completed", assignedAgent: "BackendAgent", durationMs: 2900 },
          { id: "s8", name: "Configure /api/chat/stream endpoint", status: "completed", assignedAgent: "BackendAgent", durationMs: 1900 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 3.9).toISOString(),
        resultSummary: "Server endpoints active with sub-100ms response start.",
      },
      {
        id: "task-005",
        projectId: initialProject.id,
        title: "Task 005 — Automated Test Generation & Execution",
        description: "Generate unit and contract test suites, execute Vitest, and measure code coverage.",
        assignedAgent: "TestingAgent",
        status: "completed",
        priority: "high",
        executionMode: "sequential",
        dependencies: ["task-003", "task-004"],
        steps: [
          { id: "s9", name: "Generate chatService.test.ts", status: "completed", assignedAgent: "TestingAgent", durationMs: 2100 },
          { id: "s10", name: "Run test runner & evaluate results", status: "completed", assignedAgent: "TestingAgent", durationMs: 1400 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 3.2).toISOString(),
        resultSummary: "All tests executed. Identified 1 edge-case unhandled promise rejection.",
      },
      {
        id: "task-006",
        projectId: initialProject.id,
        title: "Task 006 — Autonomous Debug Loop & Repair",
        description: "Inspect stack trace from test run, formulate targeted patch, apply code changes, and verify pass.",
        assignedAgent: "DebugAgent",
        status: "completed",
        priority: "critical",
        executionMode: "sequential",
        dependencies: ["task-005"],
        steps: [
          { id: "s11", name: "Diagnose stream error boundary", status: "completed", assignedAgent: "DebugAgent", durationMs: 1900 },
          { id: "s12", name: "Apply try-catch fallback and retest", status: "completed", assignedAgent: "DebugAgent", durationMs: 1600 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 3.2).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
        resultSummary: "Bug repaired on iteration 1. Regression test confirmed 100% green.",
      },
      {
        id: "task-007",
        projectId: initialProject.id,
        title: "Task 007 — Documentation, Git Commit & Release",
        description: "Write comprehensive README, commit with conventional message, and merge Pull Request.",
        assignedAgent: "GitAgent",
        status: "completed",
        priority: "medium",
        executionMode: "sequential",
        dependencies: ["task-006"],
        steps: [
          { id: "s13", name: "Generate README.md and OpenAPI doc", status: "completed", assignedAgent: "DocumentationAgent", durationMs: 1200 },
          { id: "s14", name: "Git commit, branch push and PR merge", status: "completed", assignedAgent: "GitAgent", durationMs: 900 },
        ],
        startedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        resultSummary: "Commit 29fbc44 merged into main branch.",
      },
    ];

    // 6. Seed Continuous Knowledge Chunks (4 Partitions)
    this.knowledge = [
      {
        id: "kc-1",
        partition: "Technical",
        title: "@google/genai Streaming Contract",
        content: "When calling ai.models.generateContentStream, always iterate with `for await (const chunk of responseStream)` and access chunk.text. Never call chunk.text().",
        sourceType: "Official Google GenAI Documentation",
        sourceReference: "https://ai.google.dev/gemini-api/docs/quickstart",
        tags: ["gemini", "streaming", "typescript"],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "kc-2",
        partition: "Technical",
        title: "Server-Sent Events Keep-Alive Standard",
        content: "Express SSE routes should write headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive. Send a newline comment ': keepalive\n\n' every 15s to keep proxies open.",
        sourceType: "W3C Web Technologies Standard",
        sourceReference: "https://html.spec.whatwg.org/multipage/server-sent-events.html",
        tags: ["sse", "express", "networking"],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "kc-3",
        partition: "Project",
        title: "Project Architecture Decision Record: AI Chat Suite",
        content: "Adopted React 19 + Express full-stack architecture with server-side proxying to safeguard API credentials. All tokens stream via SSE.",
        sourceType: "AURA ArchitectAgent ADR",
        sourceReference: "adr/001-streaming-architecture.md",
        projectId: initialProject.id,
        tags: ["architecture", "adr", "security"],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "kc-4",
        partition: "Agent",
        title: "DebugAgent Experience Log #42",
        content: "When testing asynchronous generators, ensure the consumer attaches an error listener before the first yield to prevent unhandled rejection during aborted streams.",
        sourceType: "AURA DebugAgent Post-Task Reflection",
        sourceReference: "reflection/debug-042.json",
        agentId: "agent-debug",
        tags: ["async", "generators", "debugging"],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "kc-5",
        partition: "Conversation",
        title: "User Initial Prompt Goal: Complete AI Chat Application",
        content: "User Goal: 'Build me a complete AI chat application.' AURA interpreted requirements, orchestrated 7 autonomous tasks, created 3 files, and verified via test suites.",
        sourceType: "AURA Orchestrator Session History",
        sourceReference: "session/session-001.log",
        tags: ["goal", "orchestration", "user_intent"],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];

    // 7. Seed Research Item
    this.researchItems = [
      {
        id: "res-1",
        query: "Best practices for Gemini 3.8 Flash model streaming in Node.js",
        topic: "Generative AI Realtime Streaming",
        targetFrameworkOrApi: "@google/genai",
        summary: "Gemini 3.8 Flash is Google's default low-latency model optimized for streaming and conversational agents. Uses @google/genai SDK with HTTP header telemetry.",
        recommendations: [
          "Use ai.models.generateContentStream for live streaming chunk delivery",
          "Set User-Agent: aistudio-build in httpOptions headers",
          "Ensure fallback heuristic handlers exist if network credentials degrade"
        ],
        sources: [
          {
            title: "Google GenAI TypeScript SDK Documentation",
            url: "https://github.com/google-gemini/generative-ai-js",
            isOfficialDoc: true,
            reliabilityScore: 0.99,
            snippet: "The modern @google/genai SDK provides unified access to Gemini 3 series models with streaming support.",
            extractedContent: "Official reference for server-side usage, streaming, and function calling.",
          },
          {
            title: "MDN Web Docs: Server-sent events",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events",
            isOfficialDoc: true,
            reliabilityScore: 0.98,
            snippet: "Server-sent events allow a web page to get updates from a server via an open HTTP stream.",
            extractedContent: "Best practices for reconnection and event message formatting.",
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 4.9).toISOString(),
        tags: ["gemini", "sse", "node.js"]
      }
    ];

    // 8. Seed Self-Improvement Proposal & System Versions
    this.improvementProposals = [
      {
        id: "prop-01",
        targetType: "Agent",
        targetId: "agent-architect",
        targetName: "ArchitectAgent",
        currentVersion: 1,
        proposedVersion: 2,
        rationale: "Analysis revealed 12% of task architectures required secondary revisions due to missing database foreign key specifications.",
        changesDescription: "Added strict foreign key validation check and relational dependency schema template to system prompt.",
        benchmarkMetricsBefore: { successRate: 0.88, avgLatencyMs: 4600, toolEfficiency: 0.82 },
        benchmarkMetricsAfter: { successRate: 0.96, avgLatencyMs: 4200, toolEfficiency: 0.91 },
        status: "accepted",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "prop-02",
        targetType: "AURA_Core",
        targetId: "aura-engine",
        targetName: "AURA Autonomous Orchestrator",
        currentVersion: 1,
        proposedVersion: 2,
        rationale: "Enabling parallel task execution lanes for independent frontend and backend coding stages reduces overall project build time by 38%.",
        changesDescription: "Implemented DAG dependency solver allowing unblocked tasks to execute concurrently in isolated worker threads.",
        benchmarkMetricsBefore: { successRate: 0.91, avgLatencyMs: 38000, toolEfficiency: 0.84 },
        benchmarkMetricsAfter: { successRate: 0.97, avgLatencyMs: 24000, toolEfficiency: 0.94 },
        status: "accepted",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ];

    this.systemVersions = [
      {
        version: "v1.0.0",
        releaseName: "Genesis Autonomous Core",
        commitHash: "9c1a011",
        regressionTestsPassed: true,
        testCount: 48,
        changes: ["Initial Autonomous Orchestrator", "Gemini Brain integration", "Basic Agent Factory"],
        activatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: "deprecated",
      },
      {
        version: "v2.0.0",
        releaseName: "Quantum Multi-Agent Swarm",
        commitHash: "e501b44",
        regressionTestsPassed: true,
        testCount: 74,
        changes: ["Parallel DAG task execution", "4-Partition continuous knowledge", "Self-repairing autonomous debug loop"],
        activatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: "active",
      }
    ];

    // Seed Initial Logs
    this.logs = [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        phase: "GOAL_ANALYSIS",
        agentName: "AutonomousOrchestrator",
        message: "Goal received: 'Build me a complete AI chat application'. Initiating autonomous decomposition.",
        type: "info",
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString(),
        phase: "PROJECT_RESEARCH",
        agentName: "ResearchAgent",
        message: "Investigated official @google/genai streaming guidelines. Extracted 2 primary references.",
        type: "agent",
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
        phase: "ARCHITECTURE",
        agentName: "ArchitectAgent",
        message: "Architecture designed: Micro-frontend with Express SSE stream and PostgreSQL memory.",
        type: "agent",
      },
      {
        id: "log-4",
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        phase: "CODING",
        agentName: "BackendAgent",
        message: "Created src/server/chatService.ts with Gemini 3.8 Flash streaming wrapper.",
        type: "code",
      },
      {
        id: "log-5",
        timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(),
        phase: "TESTING",
        agentName: "TestingAgent",
        message: "Ran Vitest suite. Detected unhandled rejection on stream abort edge case.",
        type: "warning",
      },
      {
        id: "log-6",
        timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
        phase: "DEBUG_LOOP",
        agentName: "DebugAgent",
        message: "Formulated patch: Added try-catch and cleanup handler. Retested: 100% tests passed!",
        type: "success",
      },
      {
        id: "log-7",
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        phase: "GIT_UPDATE",
        agentName: "GitAgent",
        message: "Committed 29fbc44 to branch main. Created and merged release Pull Request #14.",
        type: "git",
      },
    ];
  }
}

export const store = new StateStore();
