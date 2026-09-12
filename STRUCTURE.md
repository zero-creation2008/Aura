# AURA — Autonomous AI Software-Development Platform
## Architecture, File Structure & GitHub Pages Deployment Guide
**Target Repository:** [github.com/zero-creation2008/Aura](https://github.com/zero-creation2008/Aura)  
**Live GitHub Pages URL:** [zero-creation2008.github.io/Aura](https://zero-creation2008.github.io/Aura/)

AURA is an autonomous AI software development organization powered by Google Gemini 3.8 Flash, featuring multi-agent swarms, self-healing debug loops, continuous pgvector knowledge memory, and automated Git CI/CD.

---

## 1. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              USER INTENT                                |
|             "Build me a complete real-time chat application"            |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                  AURA AUTONOMOUS ORCHESTRATOR                           |
|  1. Goal Analysis        2. Requirement Spec     3. Technical Research  |
|  4. Architecture Design  5. DAG Decomposition   6. Agent Swarm Dispatch |
+-------------------------------------------------------------------------+
       │                            │                           │
       ▼                            ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  AGENT FACTORY   │      │  CODING ENGINE   │      │  RESEARCH ENGINE  │
│  - 10 Specialists│      │  - AST Analysis  │      │  - Primary Specs  │
│  - Prompt Tuning │      │  - Multi-File    │      │  - RFC Benchmarks │
│  - v1 -> v2 Evol │      │  - Test Runner   │      │  - 8-Step Pipeline│
└──────────────────┘      └──────────────────┘      └───────────────────┘
       │                            │                           │
       └────────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                 AUTONOMOUS SELF-HEALING DEBUG LOOP                      |
|  inspect() -> plan() -> patch() -> test() -> diagnose() -> verify()     |
+-------------------------------------------------------------------------+
                                    │
       ┌────────────────────────────┴───────────────────────────┐
       ▼                                                        ▼
┌───────────────────────────────┐        ┌──────────────────────────────┐
│  CONTINUOUS KNOWLEDGE (pgvec) │        │     GIT & GITHUB AUTONOMY    │
│  - Conversation Memory        │        │     - Branch Creation        │
│  - Project Memory             │        │     - Conventional Commits   │
│  - Agent Memory               │        │     - Automated Pull Requests│
│  - Technical Knowledge        │        │     - CI Validation Pipeline │
└───────────────────────────────┘        └──────────────────────────────┘
```

---

## 2. Directory & File Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD Action
├── server/                         # AURA Backend Intelligence Layer
│   ├── agentFactory.ts             # Dynamic Agent Swarm Lifecycle & Evolution
│   ├── codingEngine.ts             # AST Scanning, Synthesis & Self-Healing Debug
│   ├── gemini.ts                   # Gemini 3.8 Flash Intelligence Abstraction
│   ├── gitEngine.ts                # Git Branches, Conventional Commits & PRs
│   ├── knowledgeStore.ts           # pgvector 4-Partition Continuous Memory
│   ├── orchestrator.ts             # 16-Phase Zero-Approval Pipeline
│   ├── researchEngine.ts           # 8-Step Authoritative Technical Research
│   ├── selfDevEngine.ts            # Recursive Self-Development & Benchmarking
│   └── store.ts                    # In-Memory State & SSE Real-time Broadcaster
├── src/                            # Frontend Mission Control Interface
│   ├── components/
│   │   ├── LiveEventTicker.tsx     # Real-time Telemetry & Event Stream
│   │   └── Navigation.tsx          # Global Navigation & System Status Pill
│   ├── lib/
│   │   └── fallbackData.ts         # Client-Side Standalone Simulation & Fallback Data
│   ├── views/
│   │   ├── AgentsView.tsx          # Agent Swarm Inspector & Evolution Hub
│   │   ├── ChatView.tsx            # Conversational Command Interface
│   │   ├── CodingEngineView.tsx    # Live Debug Loop & Test Repair Viewer
│   │   ├── DashboardView.tsx       # Mission Control & Goal Launcher
│   │   ├── GitView.tsx             # Version Control & Pull Request Manager
│   │   ├── KnowledgeView.tsx       # pgvector Memory Explorer & Search
│   │   ├── LogsView.tsx            # Audit Trail & System Telemetry Logs
│   │   ├── ProjectsView.tsx        # Project Architecture & Code Browser
│   │   ├── ResearchView.tsx        # Technical Research Pipeline Visualizer
│   │   ├── SelfDevView.tsx         # Recursive Self-Improvement Inspector
│   │   ├── SystemSettingsView.tsx  # Gemini Models & Container Infrastructure
│   │   └── TasksView.tsx           # Directed Acyclic Graph (DAG) Queue
│   ├── App.tsx                     # Main Application Controller & Event Sync
│   ├── index.css                   # Tailwind CSS v4 Styling
│   ├── main.tsx                    # React Entrypoint
│   └── types.ts                    # Global TypeScript Schema & Contracts
├── index.html                      # HTML5 Template with OpenGraph Metadata
├── package.json                    # Project Manifest & NPM Scripts
├── server.ts                       # Express Production & Dev Server Entrypoint
├── STRUCTURE.md                    # Project Architecture & Hosting Guide
└── vite.config.ts                  # Vite + Tailwind Config (with base: './')
```

---

## 3. How to Host on GitHub Pages (for zero-creation2008/Aura)

### Step 1: Push Repository to GitHub
Run these commands in your project terminal:
```bash
git branch -M main
git remote add origin https://github.com/zero-creation2008/Aura.git
git push -u origin main
```

*(Note: If you are setting up fresh on another machine:)*
```bash
git init
git add .
git commit -m "feat: initial commit for AURA autonomous developer platform"
git branch -M main
git remote add origin https://github.com/zero-creation2008/Aura.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Open [github.com/zero-creation2008/Aura](https://github.com/zero-creation2008/Aura) on GitHub.
2. Click **Settings** (tab at the top right of the repo).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** from the dropdown menu.

### Step 3: Automated Workflow Runs
1. Because `.github/workflows/deploy.yml` is already committed to the repository, pushing to `main` automatically starts the **Deploy to GitHub Pages** action.
2. You can monitor the deployment progress in the **Actions** tab.
3. Once completed (usually 60-90 seconds), your live site will be ready at:
   ```
   https://zero-creation2008.github.io/Aura/
   ```

### Step 4: Client-Side Standalone Simulation
The application is pre-configured with `base: './'` and a resilient client-side fallback engine (`src/lib/fallbackData.ts`). When running on GitHub Pages (static environment), all dashboards, agent inspectors, task DAG visualizers, and project code explorers function smoothly out-of-the-box.
