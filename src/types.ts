/**
 * AURA - Autonomous AI Software Development Platform
 * Core Type Definitions & Provider Abstractions
 */

// ==========================================
// 1. LLM & Brain Provider Abstraction
// ==========================================
export type GeminiModelAlias =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite'
  | string;

export interface ModelConfiguration {
  defaultModel: string;
  plannerModel: string;
  coderModel: string;
  researchModel: string;
  fastModel: string;
}

export interface LLMMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface LLMGenerateOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, any>;
  tools?: any[];
}

export interface LLMProvider {
  generateText(prompt: string, options?: LLMGenerateOptions): Promise<string>;
  generateStructured<T>(prompt: string, schema: Record<string, any>, options?: LLMGenerateOptions): Promise<T>;
  streamText(prompt: string, onChunk: (text: string) => void, options?: LLMGenerateOptions): Promise<string>;
}

// ==========================================
// 2. Autonomous Agents & Factory
// ==========================================
export type AgentRole =
  | 'ArchitectAgent'
  | 'ResearchAgent'
  | 'FrontendAgent'
  | 'BackendAgent'
  | 'DatabaseAgent'
  | 'SecurityAgent'
  | 'TestingAgent'
  | 'DebugAgent'
  | 'DocumentationAgent'
  | 'GitAgent'
  | 'CustomSpecialist';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'evaluating' | 'failed' | 'completed';

export interface AgentVersion {
  version: number;
  systemPrompt: string;
  model: string;
  tools: string[];
  createdAt: string;
  performanceScore?: number;
  changeLog?: string;
  benchmarkNotes?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  purpose: string;
  systemPrompt: string;
  model: string;
  tools: string[];
  permissions: string[];
  memory: string[];
  version: number;
  status: AgentStatus;
  successCriteria: string[];
  versionsHistory: AgentVersion[];
  tasksCompleted: number;
  averageTaskDurationMs: number;
  lastActive: string;
}

// ==========================================
// 3. Autonomous Orchestrator & Task Pipeline
// ==========================================
export type OrchestratorPhase =
  | 'IDLE'
  | 'GOAL_ANALYSIS'
  | 'REQUIREMENT_EXTRACTION'
  | 'PROJECT_RESEARCH'
  | 'ARCHITECTURE'
  | 'TASK_DECOMPOSITION'
  | 'AGENT_CREATION'
  | 'EXECUTION'
  | 'CODING'
  | 'TESTING'
  | 'DEBUG_LOOP'
  | 'VERIFICATION'
  | 'IMPROVEMENT'
  | 'DOCUMENTATION'
  | 'GIT_UPDATE'
  | 'POST_TASK_ANALYSIS'
  | 'COMPLETED'
  | 'FAILED';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskExecutionMode = 'sequential' | 'parallel';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

export interface TaskStep {
  id: string;
  name: string;
  status: TaskStatus;
  assignedAgent: string;
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface AutonomousTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedAgent: string;
  status: TaskStatus;
  priority: TaskPriority;
  executionMode: TaskExecutionMode;
  dependencies: string[]; // Task IDs
  steps: TaskStep[];
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
}

export interface OrchestrationRun {
  id: string;
  projectId: string;
  userGoal: string;
  currentPhase: OrchestratorPhase;
  progressPercent: number;
  isAutonomous: boolean; // Zero-approval mode
  activeAgentId?: string;
  currentStepDescription: string;
  logs: OrchestrationLogEntry[];
  startedAt: string;
  completedAt?: string;
  tasks: AutonomousTask[];
}

export interface OrchestrationLogEntry {
  id: string;
  timestamp: string;
  phase: OrchestratorPhase;
  agentName?: string;
  message: string;
  type: 'info' | 'agent' | 'success' | 'warning' | 'error' | 'code' | 'git';
  metadata?: Record<string, any>;
}

// ==========================================
// 4. Projects, Workspaces & Files
// ==========================================
export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  lastModifiedByAgent?: string;
  updatedAt: string;
}

export interface ProjectArchitecture {
  summary: string;
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  apiStyle: string;
  testing: string;
  deployment: string;
  rationale: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  status: 'active' | 'archived' | 'building' | 'tested' | 'deployed';
  architecture: ProjectArchitecture;
  files: ProjectFile[];
  dependencies: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  gitRepoId: string;
  testSuitesCount: number;
  testsPassing: boolean;
}

// ==========================================
// 5. Coding Engine & Autonomous Debug Loop
// ==========================================
export type ErrorCategory = 'syntax' | 'type_error' | 'runtime' | 'test_failure' | 'dependency' | 'logic';

export interface TestResult {
  id: string;
  suiteName: string;
  testName: string;
  passed: boolean;
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface ErrorDiagnosis {
  category: ErrorCategory;
  filePath: string;
  lineNumber?: number;
  rootCause: string;
  suggestedFix: string;
  confidence: number;
}

export interface DebugLoopIteration {
  iteration: number;
  inspectedFiles: string[];
  planDescription: string;
  modifiedFiles: string[];
  testResults: TestResult[];
  errorsFound: ErrorDiagnosis[];
  repairActionTaken?: string;
  passedAllTests: boolean;
  timestamp: string;
}

export interface DebugLoopSession {
  id: string;
  projectId: string;
  taskId: string;
  maxIterations: number;
  currentIteration: number;
  status: 'running' | 'resolved' | 'exhausted' | 'aborted';
  iterations: DebugLoopIteration[];
  startedAt: string;
  resolvedAt?: string;
}

// ==========================================
// 6. Autonomous Research & Primary Sources
// ==========================================
export interface ResearchSource {
  title: string;
  url: string;
  isOfficialDoc: boolean;
  reliabilityScore: number; // 0 to 1
  snippet: string;
  extractedContent: string;
}

export interface TechnicalResearchItem {
  id: string;
  query: string;
  topic: string;
  targetFrameworkOrApi: string;
  summary: string;
  recommendations: string[];
  sources: ResearchSource[];
  createdAt: string;
  tags: string[];
}

// ==========================================
// 7. Continuous Knowledge System (pgvector memory)
// ==========================================
export type KnowledgePartition = 'Conversation' | 'Project' | 'Agent' | 'Technical';

export interface KnowledgeChunk {
  id: string;
  partition: KnowledgePartition;
  title: string;
  content: string;
  sourceType: string;
  sourceReference: string;
  projectId?: string;
  agentId?: string;
  embeddingDim?: number; // 768 / 1536 representation
  tags: string[];
  createdAt: string;
  relevanceScore?: number; // For search queries
}

// ==========================================
// 8. Self-Improving Agents & Self-Developing AURA
// ==========================================
export interface ImprovementProposal {
  id: string;
  targetType: 'Agent' | 'AURA_Core';
  targetId: string;
  targetName: string;
  currentVersion: number;
  proposedVersion: number;
  rationale: string;
  changesDescription: string;
  benchmarkMetricsBefore: {
    successRate: number;
    avgLatencyMs: number;
    toolEfficiency: number;
  };
  benchmarkMetricsAfter: {
    successRate: number;
    avgLatencyMs: number;
    toolEfficiency: number;
  };
  status: 'draft' | 'benchmarking' | 'accepted' | 'rejected' | 'rolled_back';
  createdAt: string;
}

export interface SystemVersion {
  version: string;
  releaseName: string;
  commitHash: string;
  regressionTestsPassed: boolean;
  testCount: number;
  changes: string[];
  activatedAt: string;
  status: 'active' | 'standby' | 'deprecated';
}

// ==========================================
// 9. Git & GitHub Autonomy
// ==========================================
export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string; // e.g. "AURA GitAgent <aura@ai.studio>"
  branch: string;
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  headBranch: string;
  baseBranch: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  ciChecks: {
    name: string;
    status: 'pending' | 'passed' | 'failed';
    details: string;
  }[];
  createdAt: string;
  mergedAt?: string;
}

export interface GitRepository {
  id: string;
  name: string;
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
  pullRequests: PullRequest[];
  remoteUrl: string;
}

// ==========================================
// 10. Dynamic Tool Registry
// ==========================================
export type ToolRiskLevel = 'safe' | 'low' | 'moderate' | 'high';

export interface DynamicTool {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'specialized' | 'dynamic';
  riskLevel: ToolRiskLevel;
  timeoutMs: number;
  permissions: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  usageCount: number;
  avgDurationMs: number;
}

export interface ToolExecution {
  id: string;
  toolName: string;
  agentId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout';
  timestamp: string;
}

// ==========================================
// 11. System Health & Telemetry
// ==========================================
export interface SystemTelemetry {
  orchestratorActive: boolean;
  activeAgentsCount: number;
  completedTasksCount: number;
  runningTasksCount: number;
  totalCodeLinesGenerated: number;
  totalCommits: number;
  knowledgeChunksCount: number;
  systemUptimeSeconds: number;
  geminiCallsCount: number;
  tokenUsageEstimate: number;
  autonomousMode: boolean;
}
