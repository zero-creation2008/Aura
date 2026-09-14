const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const statusEl = document.getElementById("status");
const approvalsList = document.getElementById("approvals-list");
const tasksList = document.getElementById("tasks-list");
const activityList = document.getElementById("activity-list");

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function refreshStatus() {
  try {
    const r = await fetch("/api/status");
    const data = await r.json();
    statusEl.textContent = data.llm_available
      ? `online · ${data.model} · ${data.autonomy_mode}`
      : `LLM offline (start Ollama)`;
    statusEl.className = "status " + (data.llm_available ? "online" : "offline");
  } catch (e) {
    statusEl.textContent = "server unreachable";
    statusEl.className = "status offline";
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addMessage("user", message);
  chatInput.value = "";
  addMessage("meta", "thinking…");
  const thinkingEl = chatLog.lastChild;

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await r.json();
    thinkingEl.remove();

    if (data.reply) {
      addMessage("assistant", data.reply);
    } else if (data.summary) {
      addMessage("assistant", `[research] ${data.summary}`);
    } else if (data.success !== undefined) {
      addMessage("assistant", data.success
        ? `[task ${data.task_id}] done — check Tasks panel for details.`
        : `[task ${data.task_id}] failed: ${data.error || "unknown error"}`);
    } else if (data.error) {
      addMessage("assistant", `Error: ${data.error}`);
    }
    refreshTasks();
    refreshActivity();
  } catch (err) {
    thinkingEl.remove();
    addMessage("assistant", `Request failed: ${err}`);
  }
});

async function refreshApprovals() {
  const r = await fetch("/api/approvals");
  const items = await r.json();
  approvalsList.innerHTML = "";
  if (!items.length) {
    approvalsList.innerHTML = `<div class="card meta">No pending approvals.</div>`;
    return;
  }
  for (const a of items) {
    const div = document.createElement("div");
    div.className = "card";
    const details = JSON.parse(a.details || "{}");
    div.innerHTML = `
      <div class="title">${a.action}</div>
      <div class="meta">${JSON.stringify(details)}</div>
      <div class="approval-actions">
        <button class="approve">Approve</button>
        <button class="reject">Reject</button>
      </div>
    `;
    div.querySelector(".approve").onclick = () => resolveApproval(a.id, true);
    div.querySelector(".reject").onclick = () => resolveApproval(a.id, false);
    approvalsList.appendChild(div);
  }
}

async function resolveApproval(id, approved) {
  await fetch(`/api/approvals/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved }),
  });
  refreshApprovals();
  refreshActivity();
}

async function refreshTasks() {
  const r = await fetch("/api/tasks");
  const items = await r.json();
  tasksList.innerHTML = "";
  for (const t of items.slice(0, 10)) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="title">#${t.id} ${t.agent || "chat"} <span class="badge ${t.status}">${t.status}</span></div>
      <div class="meta">${t.description.slice(0, 80)}</div>
    `;
    tasksList.appendChild(div);
  }
}

async function refreshActivity() {
  const r = await fetch("/api/activity");
  const items = await r.json();
  activityList.innerHTML = "";
  for (const a of items.slice(0, 15)) {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${a.event}${a.detail ? ": " + a.detail.slice(0, 60) : ""}`;
    activityList.appendChild(div);
  }
}

refreshStatus();
refreshApprovals();
refreshTasks();
refreshActivity();
setInterval(refreshStatus, 10000);
setInterval(refreshApprovals, 5000);
setInterval(refreshTasks, 5000);
setInterval(refreshActivity, 5000);
