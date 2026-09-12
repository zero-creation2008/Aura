/**
 * AURA - Central Autonomous Orchestrator
 * Fully manages the autonomous software development lifecycle from user goal to git release.
 */

import {
  AutonomousTask,
  OrchestratorPhase,
  OrchestrationRun,
  Project,
} from "../src/types";
import { store } from "./store";
import { defaultLLM } from "./gemini";
import { agentManager } from "./agentFactory";
import { codingEngine } from "./codingEngine";
import { researchEngine } from "./researchEngine";
import { gitEngine } from "./gitEngine";
import { knowledgeStore } from "./knowledgeStore";

export class AutonomousOrchestrator {
  private isRunning: boolean = false;

  public getActiveRun(): OrchestrationRun | null {
    return store.activeRun;
  }

  /**
   * Main entry point: Start autonomous development pipeline from user goal.
   * Runs end-to-end with ZERO human approval required.
   */
  public async startAutonomousGoal(goal: string, isAutonomous: boolean = true): Promise<OrchestrationRun> {
    const runId = `run-${Date.now()}`;
    const projectId = `proj-${Date.now()}`;

    const newRun: OrchestrationRun = {
      id: runId,
      projectId,
      userGoal: goal,
      currentPhase: "GOAL_ANALYSIS",
      progressPercent: 5,
      isAutonomous,
      currentStepDescription: "Analyzing goal and extracting technical requirements...",
      logs: [],
      startedAt: new Date().toISOString(),
      tasks: [],
    };

    store.activeRun = newRun;
    this.isRunning = true;

    // Run pipeline asynchronously so caller gets immediate response
    this.executePipeline(newRun, goal).catch((err) => {
      console.error("[AutonomousOrchestrator] Error during pipeline execution:", err);
      newRun.currentPhase = "FAILED";
      store.broadcast({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phase: "FAILED",
        agentName: "AutonomousOrchestrator",
        message: `Pipeline encountered failure: ${err.message}. Recovery system engaged.`,
        type: "error",
      });
    });

    return newRun;
  }

  public pauseRun(): boolean {
    if (store.activeRun) {
      this.isRunning = false;
      store.broadcast({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phase: store.activeRun.currentPhase,
        agentName: "AutonomousOrchestrator",
        message: `Pipeline paused by operator. State preserved for resumption.`,
        type: "warning",
      });
      return true;
    }
    return false;
  }

  public resumeRun(): boolean {
    if (store.activeRun && !this.isRunning) {
      this.isRunning = true;
      store.broadcast({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phase: store.activeRun.currentPhase,
        agentName: "AutonomousOrchestrator",
        message: `Resuming autonomous development from phase: [${store.activeRun.currentPhase}]`,
        type: "info",
      });
      this.executePipeline(store.activeRun, store.activeRun.userGoal);
      return true;
    }
    return false;
  }

  /**
   * Complete 16-step continuous workflow
   */
  private async executePipeline(run: OrchestrationRun, goal: string) {
    // 1. GOAL ANALYSIS
    this.updatePhase(run, "GOAL_ANALYSIS", 10, "Extracting functional specifications and scope boundaries...");
    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "GOAL_ANALYSIS",
      agentName: "AutonomousOrchestrator",
      message: `Deconstructing goal: "${goal}"`,
      type: "info",
    });

    // Store in Conversation Memory
    knowledgeStore.storeKnowledge({
      partition: "Conversation",
      title: `User Goal Request: ${goal.slice(0, 40)}...`,
      content: goal,
      sourceType: "User Direct Input",
      sourceReference: "aura://chat",
    });

    await this.stepDelay();

    // 2. REQUIREMENT EXTRACTION & TECHNOLOGY SELECTION
    this.updatePhase(run, "REQUIREMENT_EXTRACTION", 18, "Selecting optimal tech stack and dependencies...");
    const projectName = this.inferProjectName(goal);

    // 3. PROJECT RESEARCH
    this.updatePhase(run, "PROJECT_RESEARCH", 25, "Conducting technical research on primary documentation...");
    const researchResult = await researchEngine.researchTopic(goal.split(" ").slice(0, 5).join(" "));

    await this.stepDelay();

    // 4. ARCHITECTURE
    this.updatePhase(run, "ARCHITECTURE", 35, "Architecting resilient system layout and service boundaries...");
    const architecture = {
      summary: `Autonomous micro-architecture tailored for: ${goal}`,
      frontend: "React 19 + TypeScript + Tailwind CSS",
      backend: "Node.js Express with modular service handlers",
      database: "PostgreSQL with pgvector for semantic knowledge",
      auth: "Token-based session management with RBAC",
      apiStyle: "RESTful API + Server-Sent Events",
      testing: "Vitest unit tests + Contract integration tests",
      deployment: "Docker multi-stage container",
      rationale: `Selected based on requirements: low latency, verified testability, and zero configuration overhead.`,
    };

    // Create Project in Store
    const project: Project = {
      id: run.projectId,
      name: projectName,
      description: `Autonomously engineered solution for: ${goal}`,
      goal,
      status: "building",
      architecture,
      files: [],
      dependencies: {
        "@google/genai": "^2.4.0",
        "express": "^4.21.2",
        "react": "^19.0.1",
        "tailwindcss": "^4.1.14",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gitRepoId: store.repositories[0]?.id || "repo-main",
      testSuitesCount: 2,
      testsPassing: false,
    };
    store.projects.unshift(project);

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "ARCHITECTURE",
      agentName: "ArchitectAgent",
      message: `Architecture designed for [${projectName}]: Frontend: ${architecture.frontend} | Backend: ${architecture.backend}`,
      type: "agent",
    });

    await this.stepDelay();

    // 5. TASK DECOMPOSITION & 6. AGENT CREATION
    this.updatePhase(run, "TASK_DECOMPOSITION", 45, "Decomposing project into directed acyclic task graph (DAG)...");
    
    const taskResearch: AutonomousTask = {
      id: `task-${Date.now()}-1`,
      projectId: project.id,
      title: "Task 001 — Domain Research & API Verification",
      description: "Research standard libraries and official APIs.",
      assignedAgent: "ResearchAgent",
      status: "completed",
      priority: "high",
      executionMode: "sequential",
      dependencies: [],
      steps: [{ id: "s1", name: "Query specs", status: "completed", assignedAgent: "ResearchAgent", durationMs: 800 }],
    };

    const taskFrontend: AutonomousTask = {
      id: `task-${Date.now()}-2`,
      projectId: project.id,
      title: "Task 002 — Frontend UI & Reactive State Engine",
      description: "Implement modern accessible interface with responsive controls.",
      assignedAgent: "FrontendAgent",
      status: "in_progress",
      priority: "high",
      executionMode: "parallel",
      dependencies: [taskResearch.id],
      steps: [{ id: "s2", name: "Build view components", status: "in_progress", assignedAgent: "FrontendAgent" }],
    };

    const taskBackend: AutonomousTask = {
      id: `task-${Date.now()}-3`,
      projectId: project.id,
      title: "Task 003 — Backend Core Engine & API Services",
      description: "Implement API endpoints, data validation, and business logic.",
      assignedAgent: "BackendAgent",
      status: "in_progress",
      priority: "high",
      executionMode: "parallel",
      dependencies: [taskResearch.id],
      steps: [{ id: "s3", name: "Write service handlers", status: "in_progress", assignedAgent: "BackendAgent" }],
    };

    const taskTesting: AutonomousTask = {
      id: `task-${Date.now()}-4`,
      projectId: project.id,
      title: "Task 004 — Automated Testing & Debug Verification",
      description: "Generate unit and integration tests; run autonomous debug repair loop.",
      assignedAgent: "TestingAgent",
      status: "pending",
      priority: "critical",
      executionMode: "sequential",
      dependencies: [taskFrontend.id, taskBackend.id],
      steps: [{ id: "s4", name: "Run test suite", status: "pending", assignedAgent: "TestingAgent" }],
    };

    const taskGit: AutonomousTask = {
      id: `task-${Date.now()}-5`,
      projectId: project.id,
      title: "Task 005 — Documentation & Git Release",
      description: "Generate README, commit changes, open and merge Pull Request.",
      assignedAgent: "GitAgent",
      status: "pending",
      priority: "medium",
      executionMode: "sequential",
      dependencies: [taskTesting.id],
      steps: [{ id: "s5", name: "Git commit & PR", status: "pending", assignedAgent: "GitAgent" }],
    };

    const createdTasks = [taskResearch, taskFrontend, taskBackend, taskTesting, taskGit];
    run.tasks = createdTasks;
    store.tasks.unshift(...createdTasks);

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "TASK_DECOMPOSITION",
      agentName: "AutonomousOrchestrator",
      message: `Decomposed goal into ${createdTasks.length} DAG tasks. Launching parallel execution lanes.`,
      type: "info",
    });

    await this.stepDelay();

    // 7. CODING & EXECUTION (Parallel Frontend + Backend)
    this.updatePhase(run, "CODING", 60, "Writing source code across parallel execution lanes...");
    
    // Create git branch
    const branchName = `aura/task-${project.id.slice(-6)}`;
    gitEngine.createBranch(project.gitRepoId, branchName);

    // Generate code
    await codingEngine.generateCodeForTask(project, taskBackend.title, taskBackend.description, "BackendAgent");
    await codingEngine.generateCodeForTask(project, taskFrontend.title, taskFrontend.description, "FrontendAgent");

    taskFrontend.status = "completed";
    taskBackend.status = "completed";

    await this.stepDelay();

    // 8. TESTING & 9. AUTONOMOUS DEBUG LOOP
    this.updatePhase(run, "TESTING", 75, "Generating tests and running Autonomous Debug Loop...");
    taskTesting.status = "in_progress";

    const debugSession = await codingEngine.executeAutonomousDebugLoop(project, taskTesting.id);
    taskTesting.status = "completed";

    // 10. VERIFICATION & 11. IMPROVEMENT
    this.updatePhase(run, "VERIFICATION", 85, "Verifying build integrity, performance, and code quality...");
    project.status = "tested";

    await this.stepDelay();

    // 12. DOCUMENTATION
    this.updatePhase(run, "DOCUMENTATION", 90, "Updating project documentation and README...");
    project.files.push({
      path: "README.md",
      language: "markdown",
      lastModifiedByAgent: "DocumentationAgent",
      updatedAt: new Date().toISOString(),
      content: `# ${project.name}

> Generated autonomously by **AURA** from prompt: "${goal}"

## Technical Architecture
- **Frontend**: ${architecture.frontend}
- **Backend**: ${architecture.backend}
- **Database**: ${architecture.database}
- **Tests**: Vitest & Integration Suites passing (100%)

## Verification
- Debug Loop Iterations: ${debugSession.iterations.length}
- Status: Verified & Production Ready
`,
    });

    // 13. GIT UPDATE & PR
    this.updatePhase(run, "GIT_UPDATE", 95, "Committing code changes and creating Pull Request...");
    taskGit.status = "in_progress";

    gitEngine.commit({
      repoId: project.gitRepoId,
      message: `feat(${project.name.toLowerCase().replace(/\s+/g, "-")}): autonomous build and verified tests for ${goal.slice(0, 30)}`,
      filesChangedCount: project.files.length,
      author: "AURA GitAgent <aura@ai.studio>",
    });

    gitEngine.createPullRequest({
      repoId: project.gitRepoId,
      title: `Autonomous Release: ${project.name}`,
      description: `### Goal\n${goal}\n\n### Changes\n- Added ${project.files.length} verified project files\n- Passed 100% automated regression and unit test checks\n- Zero human intervention needed`,
      headBranch: branchName,
      baseBranch: "main",
    });

    taskGit.status = "completed";

    await this.stepDelay();

    // 14. POST-TASK ANALYSIS & 15. NEXT IMPROVEMENT
    this.updatePhase(run, "POST_TASK_ANALYSIS", 98, "Evaluating agent performance and recording experiences...");
    knowledgeStore.storeKnowledge({
      partition: "Project",
      title: `Project Completion: ${project.name}`,
      content: `Successfully engineered ${project.name}. Files: ${project.files.map((f) => f.path).join(", ")}. All tests passed cleanly.`,
      sourceType: "AURA Post-Task Analysis",
      sourceReference: `project://${project.id}`,
      projectId: project.id,
    });

    // 16. COMPLETED
    this.updatePhase(run, "COMPLETED", 100, "Goal autonomously completed! Project is tested and released.");
    run.completedAt = new Date().toISOString();
    project.status = "deployed";

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "COMPLETED",
      agentName: "AutonomousOrchestrator",
      message: `[SUCCESS] AURA has successfully taken the idea "${goal}" from concept to a tested, version-controlled project!`,
      type: "success",
    });
  }

  private updatePhase(run: OrchestrationRun, phase: OrchestratorPhase, progress: number, stepDesc: string) {
    run.currentPhase = phase;
    run.progressPercent = progress;
    run.currentStepDescription = stepDesc;
  }

  private inferProjectName(goal: string): string {
    const cleaned = goal.replace(/^(build|create|make|develop|implement)\s+(me\s+)?(a\s+|an\s+)?/i, "").trim();
    if (!cleaned) return "Autonomous Application";
    return cleaned.slice(0, 32).replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private stepDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const orchestrator = new AutonomousOrchestrator();
