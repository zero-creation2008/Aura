# AURA in Termux (Android Terminal Guide)

Run the full **AURA Autonomous AI Developer** suite directly on your Android phone using [Termux](https://termux.dev/).

---

## ⚡ Quick 1-Command Installation

Open Termux on Android and paste:

```bash
pkg update -y && pkg install git nodejs -y
git clone https://github.com/zero-creation2008/Aura.git
cd Aura
bash termux-install.sh
```

This installs dependencies and creates a global `aura` command so you can type `aura` from any directory in Termux!

---

## 🤖 Core Termux Commands

### 1. Ask AI Questions Directly
```bash
aura ask "How do I setup a reverse proxy in Termux?"
aura ask "Explain the difference between WebSockets and Server-Sent Events"
```

### 2. Make & Manage AI Agents
```bash
# List all active agents, roles, versions
aura agent list

# Create a brand-new specialist agent
aura agent create AuditBot "Performs static AppSec audits on code" SecurityAgent

# Evolve an agent to the next version
aura agent improve AuditBot
```

### 3. Run Autonomous Software Goals
```bash
aura goal "Build a lightweight REST API with SQLite for Termux"
aura goal "Implement user authentication with JWT tokens"
```
*AURA automatically analyzes requirements, researches specifications, designs decoupled architectures, synthesizes code, and runs verification.*

### 4. Run AST Self-Healing Debug Loop
```bash
aura debug
```
*Executes the 6-stage AST inspection, patch planning, atomic modification, and test assertion verification.*

### 5. Search & Store Vector Knowledge
```bash
# Search indexed knowledge
aura knowledge search "termux"

# Save new knowledge chunk
aura knowledge store "Android Shell" "Termux uses Bionic libc and custom prefix in /data/data/com.termux" Technical
```

### 6. Interactive Terminal Shell
Run `aura` with no arguments to enter the dedicated interactive shell:
```bash
aura
```
```
aura> ask What are the latest React 19 hooks?
aura> agent list
aura> agent create TestBot "QA engineer" TestingAgent
aura> goal "Build a markdown converter"
aura> debug
aura> status
aura> help
aura> exit
```

### 7. Launch Web Dashboard from Termux
To run the full visual web dashboard and view it in Chrome or Firefox on your phone:
```bash
aura serve
```
Then open `http://localhost:3000` in your Android browser.

---

## 🔑 Google Gemini API Key (Optional)

AURA works completely offline with a built-in reasoning engine. For live **Gemini 3.8 Flash** responses:

```bash
export GEMINI_API_KEY="your_api_key_here"
```
Or add it to your `.env` file:
```bash
echo "GEMINI_API_KEY=your_api_key_here" >> .env
```

---

## 🌐 Links
- **GitHub Repository:** [https://github.com/zero-creation2008/Aura](https://github.com/zero-creation2008/Aura)
- **Live GitHub Pages:** [https://zero-creation2008.github.io/Aura/](https://zero-creation2008.github.io/Aura/)
- **Standalone HTML Portal:** [https://zero-creation2008.github.io/Aura/frontpage.html](https://zero-creation2008.github.io/Aura/frontpage.html)
