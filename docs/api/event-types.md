# Event Types Reference

Complete reference for all event types in Agent Transparency.

## Event Type Categories

### Lifecycle Events

Events tracking agent lifecycle.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `AGENT_STARTUP` | `agent.startup` | INFO | Agent has started |
| `AGENT_SHUTDOWN` | `agent.shutdown` | INFO | Agent is shutting down |
| `AGENT_HEALTH_CHECK` | `agent.health_check` | DEBUG | Health check performed |

**Logging Methods:**
```python
await transparency.log_agent_startup(metadata={"version": "1.0"})
await transparency.log_agent_shutdown(reason="normal")
```

---

### Input Events

Events tracking input processing.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `INPUT_RECEIVED` | `input.received` | INFO | Raw input received |
| `INPUT_VALIDATED` | `input.validated` | DEBUG | Input validated |
| `INPUT_PARSED` | `input.parsed` | DEBUG | Input parsed |
| `INPUT_REJECTED` | `input.rejected` | WARNING | Input rejected |

**Logging Methods:**
```python
await transparency.log_input_received(
    content="Hello world",
    source="user",
    content_type="text"
)

await transparency.log_input_parsed(
    content="Hello world",
    parsed_intent="greeting",
    entities={}
)
```

**Payload:** `InputEvent`

---

### Thinking Events

Events tracking reasoning process.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `THINKING_START` | `thinking.start` | INFO | Begin thinking |
| `THINKING_STEP` | `thinking.step` | DEBUG | Reasoning step |
| `THINKING_DECISION` | `thinking.decision` | INFO | Decision made |
| `THINKING_END` | `thinking.end` | INFO | Thinking complete |

**Logging Methods:**
```python
await transparency.log_thinking_start("Processing request")

await transparency.log_thinking_step(
    phase=ThinkingPhase.ANALYSIS,
    description="Analyzing intent",
    reasoning="User wants information",
    considerations=["context", "history"],
    confidence=0.9
)

await transparency.log_thinking_decision(
    decision="Fetch weather data",
    rationale="User asked about weather",
    alternatives=[{"option": "Ask", "reason_rejected": "Clear request"}],
    confidence=0.95
)

await transparency.log_thinking_end("Analysis complete")
```

**Payload:** `ThinkingEvent`

---

### LangGraph Events

Events tracking graph execution.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `GRAPH_INVOKE_START` | `graph.invoke.start` | INFO | Graph started |
| `GRAPH_INVOKE_END` | `graph.invoke.end` | INFO | Graph completed |
| `GRAPH_NODE_ENTER` | `graph.node.enter` | DEBUG | Entering node |
| `GRAPH_NODE_EXIT` | `graph.node.exit` | DEBUG | Exiting node |
| `GRAPH_EDGE_TRAVERSE` | `graph.edge.traverse` | DEBUG | Traversing edge |
| `GRAPH_CONDITIONAL_ROUTE` | `graph.conditional.route` | INFO | Routing decision |
| `GRAPH_STATE_UPDATE` | `graph.state.update` | DEBUG | State updated |

**Logging Methods:**
```python
await transparency.log_graph_invoke_start(initial_state={"messages": []})

await transparency.log_node_enter(
    node_name="planner",
    node_type=LangGraphNodeType.PLANNER,
    state_before=state
)

await transparency.log_node_exit(
    node_name="planner",
    node_type=LangGraphNodeType.PLANNER,
    state_before=old_state,
    state_after=new_state,
    duration_ms=150
)

await transparency.log_conditional_route(
    from_node="router",
    to_node="executor",
    route_decision="has_plan",
    state=state
)

await transparency.log_graph_invoke_end(final_state=state, duration_ms=2500)
```

**Payload:** `LangGraphEvent`

---

### LLM Events

Events tracking LLM interactions.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `LLM_REQUEST_START` | `llm.request.start` | DEBUG | Request initiated |
| `LLM_REQUEST_END` | `llm.request.end` | DEBUG | Request completed |
| `LLM_PROMPT_SENT` | `llm.prompt.sent` | DEBUG | Prompt sent |
| `LLM_RESPONSE_RECEIVED` | `llm.response.received` | INFO | Response received |
| `LLM_TOKEN_USAGE` | `llm.token.usage` | DEBUG | Token usage |
| `LLM_ERROR` | `llm.error` | ERROR | LLM error |

**Logging Methods:**
```python
await transparency.log_llm_request_start(
    model_name="gpt-4",
    prompt="What is AI?",
    system_prompt="You are helpful."
)

await transparency.log_llm_response(
    model_name="gpt-4",
    prompt="What is AI?",
    response="AI is...",
    input_tokens=10,
    output_tokens=50,
    latency_ms=500
)

await transparency.log_llm_error(
    model_name="gpt-4",
    error="Rate limit exceeded",
    prompt="What is AI?"
)
```

**Payload:** `LLMEvent`

---

### Output Events

Events tracking output generation.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `OUTPUT_GENERATED` | `output.generated` | INFO | Output created |
| `OUTPUT_VALIDATED` | `output.validated` | DEBUG | Output validated |
| `OUTPUT_DISPATCHED` | `output.dispatched` | INFO | Output sent |
| `OUTPUT_FAILED` | `output.failed` | ERROR | Output failed |

**Logging Methods:**
```python
await transparency.log_output_generated(
    content="Here is your answer...",
    target="user",
    action_type="response"
)

await transparency.log_output_dispatched(
    content="Here is your answer...",
    target="user"
)
```

**Payload:** `OutputEvent`

---

### Action Events

Events tracking agent actions.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `ACTION_PLANNED` | `action.planned` | INFO | Action planned |
| `ACTION_DISPATCHED` | `action.dispatched` | INFO | Action sent |
| `ACTION_COMPLETED` | `action.completed` | INFO | Action done |
| `ACTION_FAILED` | `action.failed` | ERROR | Action failed |

**Logging Methods:**
```python
action_id = await transparency.log_action_planned(
    target_agent_id="weather-api",
    instruction="Get weather for NYC",
    action_type="api_call",
    parameters={"city": "NYC"}
)

await transparency.log_action_dispatched(
    action_id=action_id,
    target_agent_id="weather-api",
    instruction="Get weather for NYC"
)

await transparency.log_action_completed(
    action_id=action_id,
    result="Temperature: 72°F"
)

await transparency.log_action_failed(
    action_id=action_id,
    error="API timeout"
)
```

**Payload:** `ActionEvent`

---

### Communication Events

Events tracking inter-agent communication.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `MESSAGE_SENT` | `message.sent` | INFO | Message sent |
| `MESSAGE_RECEIVED` | `message.received` | INFO | Message received |
| `MESSAGE_ACKNOWLEDGED` | `message.acknowledged` | DEBUG | Message ACK'd |

---

### State Events

Events tracking state changes.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `STATE_SNAPSHOT` | `state.snapshot` | INFO | Full state capture |
| `STATE_TRANSITION` | `state.transition` | INFO | State changed |

**Logging Methods:**
```python
await transparency.log_state_snapshot(
    state={"messages": messages, "plan": plan},
    trigger="after_planning"
)

await transparency.log_state_transition(
    from_status="planning",
    to_status="executing",
    reason="Plan approved"
)
```

**Payload:** `StateSnapshot` or `Dict`

---

### Error Events

Events tracking errors.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `ERROR_OCCURRED` | `error.occurred` | ERROR | Error detected |
| `ERROR_RECOVERED` | `error.recovered` | INFO | Error recovered |
| `ERROR_FATAL` | `error.fatal` | CRITICAL | Fatal error |

**Logging Methods:**
```python
await transparency.log_error(
    error_type="APIError",
    message="Connection failed",
    exception=e,
    context={"api": "weather"},
    recoverable=True
)
```

**Payload:** `ErrorEvent`

---

### Debug Events

Events for debugging.

| Event Type | Value | Severity | Description |
|------------|-------|----------|-------------|
| `DEBUG_LOG` | `debug.log` | DEBUG | Debug message |
| `DEBUG_TRACE` | `debug.trace` | TRACE | Trace message |

**Logging Methods:**
```python
await transparency.log_event(
    EventType.DEBUG_LOG,
    {"message": "Debug info", "data": {...}},
    severity=Severity.DEBUG,
    tags=["debug"]
)
```

## Filtering Events

### By Event Type

```python
config = TransparencyConfig(
    event_type_filter=[
        EventType.THINKING_DECISION,
        EventType.LLM_RESPONSE_RECEIVED,
        EventType.ERROR_OCCURRED,
    ]
)
```

### By Category

```python
# Only thinking events
thinking_events = [
    EventType.THINKING_START,
    EventType.THINKING_STEP,
    EventType.THINKING_DECISION,
    EventType.THINKING_END,
]

# Only error events
error_events = [
    EventType.ERROR_OCCURRED,
    EventType.ERROR_RECOVERED,
    EventType.ERROR_FATAL,
    EventType.LLM_ERROR,
    EventType.ACTION_FAILED,
    EventType.OUTPUT_FAILED,
]
```

## See Also

- [Event Types Guide](/guide/event-types) - Usage examples
- [Data Classes](/api/data-classes) - Payload structures
- [Configuration](/api/configuration) - Filtering options
