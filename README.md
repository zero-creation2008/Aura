# AURA — Autonomous AI Software Engineer & Multi-Agent Swarm

<p align="center">
  <img src="https://img.shields.io/badge/Release-v2.0.0-06b6d4?style=for-the-badge&logo=github" alt="Release" />
  <img src="https://img.shields.io/badge/Gemini%20Model-3.8%20Flash-38bdf8?style=for-the-badge&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Deployment-GitHub%20Pages-10b981?style=for-the-badge&logo=githubpages" alt="Pages" />
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="License" />
</p>

---

## 🌐 Live Deployments & Repository

- **GitHub Repository:** [https://github.com/zero-creation2008/Aura](https://github.com/zero-creation2008/Aura)
- **Live GitHub Pages URL:** [https://zero-creation2008.github.io/Aura/](https://zero-creation2008.github.io/Aura/)
- **Standalone HTML Front Page:** [https://zero-creation2008.github.io/Aura/frontpage.html](https://zero-creation2008.github.io/Aura/frontpage.html)

---

## ⚡ Overview

**AURA** is an autonomous software development platform powered by Google Gemini 3.8 Flash. Given a high-level software goal, AURA operates as a self-directed engineering organization: researching technical specifications, synthesizing AST-validated code, running autonomous self-healing test loops, persisting neural memories across 4 vector partitions, and executing version-controlled Git workflows.

---

## 🏛️ The 10-Agent Autonomous Workforce

AURA dynamically orchestrates 10 specialized agent personas:

| Agent Role | Specialty | Core Autonomous Deliverables |
| :--- | :--- | :--- |
| **ExecutiveAgent** | Leadership & SLA | Goal deconstruction, DAG dependency trees, milestone verification |
| **ArchitectAgent** | System Design | API boundaries, contract schemas, microservice specifications |
| **FrontendAgent** | UI/UX Engineering | React 19 components, Tailwind v4 layouts, accessible interactive states |
| **BackendAgent** | API & Services | Node.js Express endpoints, Server-Sent Events (SSE), database models |
| **TestingAgent** | Quality Assurance | Vitest test generation, assertion coverage, regression validation |
| **DevOpsAgent** | CI/CD & Deploy | GitHub Actions pipelines, container images, GitHub Pages publishing |
| **SecurityAgent** | AppSec Auditing | AST static taint analysis, token safety checks, sanitization audits |
| **DocsAgent** | Technical Writing | OpenAPI specifications, architecture diagrams, user guides |
| **ResearchAgent** | Knowledge Synthesis| Primary RFC standards, official documentation retrieval, benchmark analysis |
| **GitAgent** | Version Control | Automated feature branches, conventional commits, pull requests |

---

## 🔄 Self-Healing AST Debug Engine

AURA includes a 6-step zero-touch diagnostic and repair loop:
1. **`inspect()`** — Analyzes failed assertions, syntax parse trees, and runtime stack traces.
2. **`plan()`** — Generates an AST-aware surgical repair plan targeting precise source lines.
3. **`patch()`** — Applies modifications using atomic diff blocks.
4. **`test()`** — Executes full Vitest regression test suites against the modified codebase.
5. **`diagnose()`** — Evaluates test output; if failures persist, increases context window and adjusts approach.
6. **`verify()`** — Approves the patch once 100% of test assertions pass.

---

## 🧠 4-Partition Vector Memory

Continuous knowledge persistence indexed via vector similarity:
- **`technical_knowledge`** — Library documentation, API contracts, best-practice algorithms.
- **`architectural_decisions`** — ADRs, data structures, communication schemas.
- **`project_history`** — Sprint records, feature milestones, previous debug resolutions.
- **`agent_learnings`** — Evolved prompt strategies and failure avoidance patterns.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/zero-creation2008/Aura.git
cd Aura
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (optional for live Gemini)
```bash
cp .env.example .env
# Add your Google Gemini API key:
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Termux & Android CLI (Full AI Capability on Mobile)

AURA can run completely inside **Termux on Android** without needing a desktop or browser!

### 1-Step Termux Installation:
```bash
pkg update -y && pkg install git nodejs -y
git clone https://github.com/zero-creation2008/Aura.git
cd Aura
bash termux-install.sh
```

### Termux Commands:
```bash
# Ask AI any question directly
aura ask "How do I setup an Express API in Termux?"

# Create a brand new specialist agent
aura agent create AuditBot "AppSec vulnerability reviewer" SecurityAgent

# List all agents, roles, versions
aura agent list

# Execute an autonomous development goal
aura goal "Build a lightweight microservice with SQLite"

# Run 6-step AST self-healing debug cycle
aura debug

# Enter interactive Termux shell
aura
```
👉 Full mobile documentation available in [TERMUX.md](TERMUX.md).

---

## 📦 GitHub Pages Deployment (Automated CI/CD)

The repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Setup Instructions:
1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/zero-creation2008/Aura.git
   git branch -M main
   git push -u origin main
   ```
2. Navigate to your repository on GitHub:
   **[github.com/zero-creation2008/Aura](https://github.com/zero-creation2008/Aura)**
3. Go to **Settings** &rarr; **Pages**.
4. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
5. The deployment workflow will build the project and publish it live to:
   ```
   https://zero-creation2008.github.io/Aura/
   ```

---

## 🛠️ Technology Stack

- **Runtime & Backend:** Node.js, Express, TypeScript, Server-Sent Events (SSE)
- **Frontend & UI:** React 19, Tailwind CSS v4, Motion, Lucide Icons
- **AI Engine:** Google Gemini 3.8 Flash (`@google/genai`)
- **Bundler & Build:** Vite 6, esbuild
- **CI/CD:** GitHub Actions, GitHub Pages

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
