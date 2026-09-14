"""
AURA - Orchestrator.
Classifies an incoming user request, creates a task record, and routes it
to the correct agent. Deliberately simple (keyword + LLM-assisted intent
classification) rather than a complex planning graph — appropriate for a
single-user local system with two agents.
"""
from core import llm, db
from agents import research_agent, coding_agent


def classify_intent(message: str) -> str:
    """Returns 'research', 'code', or 'chat'."""
    message_l = message.lower()
    code_signals = ["build", "create a", "write code", "fix", "implement", "add a function",
                    "create a file", "modify", "refactor", "app", "script", "website", "api"]
    research_signals = ["research", "find information", "look up", "search for", "what is the latest",
                         "news about", "compare", "who is", "how does"]

    if any(s in message_l for s in code_signals):
        return "code"
    if any(s in message_l for s in research_signals):
        return "research"

    # ambiguous — ask the model
    try:
        result = llm.generate_json(
            "Classify this user request as exactly one of: research, code, chat.\n"
            f"Request: {message}\n"
            'Respond ONLY as JSON: {"intent": "research"|"code"|"chat"}'
        )
        intent = result.get("intent", "chat")
        if intent in ("research", "code", "chat"):
            return intent
    except llm.LLMUnavailable:
        pass
    return "chat"


def handle_message(message: str) -> dict:
    intent = classify_intent(message)

    if intent == "chat":
        db.log_activity("chat_message", message)
        try:
            reply = llm.generate(
                message,
                system="You are AURA, a helpful local AI assistant. Be concise and direct.",
            )
        except llm.LLMUnavailable as e:
            reply = f"(LLM unavailable: {e})"
        return {"intent": "chat", "reply": reply}

    if intent == "research":
        task_id = db.create_task(message, agent="research_agent")
        db.log_activity("agent_created", "research_agent", task_id)
        result = research_agent.run(task_id, message)
        return {"intent": "research", "task_id": task_id, **result}

    if intent == "code":
        task_id = db.create_task(message, agent="coding_agent")
        db.log_activity("agent_created", "coding_agent", task_id)
        result = coding_agent.run(task_id, message)
        return {"intent": "code", "task_id": task_id, **result}

    return {"intent": "unknown", "reply": "Could not classify this request."}
