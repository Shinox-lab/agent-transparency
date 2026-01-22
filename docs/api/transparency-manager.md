# TransparencyManager

The main async transparency manager class for logging agent events.

## Class Definition

```python
class TransparencyManager:
    def __init__(
        self,
        agent_id: str,
        config: Optional[TransparencyConfig] = None,
    ):
```

## Constructor

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `agent_id` | `str` | required | Unique identifier for the agent |
| `config` | `TransparencyConfig` | `None` | Configuration options |

### Example

```python
from transparency import TransparencyManager, TransparencyConfig

# With default config
manager = TransparencyManager(agent_id="my-agent")

# With custom config
config = TransparencyConfig(
    enabled=True,
    file_path="./logs",
)
manager = TransparencyManager(agent_id="my-agent", config=config)
```

## Lifecycle Methods

### start

```python
async def start(self) -> None:
```

Start the transparency manager. Enables background buffer flushing.

**Example:**

```python
await transparency.start()
```

### stop

```python
async def stop(self) -> None:
```

Stop the manager and flush remaining events.

**Example:**

```python
await transparency.stop()
```

## Context Management

### create_context

```python
def create_context(
    self,
    session_id: str = "",
    conversation_id: str = "",
) -> TransparencyContext:
```

Create a new transparency context.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `session_id` | `str` | `""` | Session identifier |
| `conversation_id` | `str` | `""` | Conversation identifier |

**Returns:** `TransparencyContext`

### set_context

```python
def set_context(self, context: TransparencyContext) -> None:
```

Set the active context for subsequent events.

### get_context

```python
def get_context(self) -> Optional[TransparencyContext]:
```

Get the current active context.

### context_scope

```python
@asynccontextmanager
async def context_scope(
    self,
    session_id: str = "",
    conversation_id: str = "",
) -> AsyncGenerator[TransparencyContext, None]:
```

Context manager for scoped transparency context.

**Example:**

```python
async with transparency.context_scope(session_id="user-123"):
    await transparency.log_input_received("Hello")
    # Context automatically restored after block
```

## Core Logging

### log_event

```python
async def log_event(
    self,
    event_type: EventType,
    payload: Any,
    severity: Severity = Severity.INFO,
    tags: Optional[List[str]] = None,
    parent_event_id: Optional[str] = None,
) -> None:
```

Log a generic transparency event.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `event_type` | `EventType` | required | Type of event |
| `payload` | `Any` | required | Event payload data |
| `severity` | `Severity` | `INFO` | Event severity |
| `tags` | `List[str]` | `None` | Event tags |
| `parent_event_id` | `str` | `None` | Parent event for hierarchy |

## Input Events

### log_input_received

```python
async def log_input_received(
    self,
    content: str,
    source: str = "user",
    source_agent_id: Optional[str] = None,
    content_type: str = "text",
) -> None:
```

Log when input is received.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | `str` | required | The input content |
| `source` | `str` | `"user"` | Source of input |
| `source_agent_id` | `str` | `None` | Agent ID if from another agent |
| `content_type` | `str` | `"text"` | Content type (text, json, etc.) |

### log_input_parsed

```python
async def log_input_parsed(
    self,
    content: str,
    parsed_intent: Optional[str] = None,
    entities: Optional[Dict[str, Any]] = None,
) -> None:
```

Log when input has been parsed.

## Thinking Events

### log_thinking_start

```python
async def log_thinking_start(
    self,
    description: str = "Beginning analysis",
) -> None:
```

Log the start of thinking process.

### log_thinking_step

```python
async def log_thinking_step(
    self,
    phase: ThinkingPhase,
    description: str,
    reasoning: str = "",
    considerations: Optional[List[str]] = None,
    confidence: Optional[float] = None,
) -> None:
```

Log a step in the thinking process.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `phase` | `ThinkingPhase` | required | Current thinking phase |
| `description` | `str` | required | Description of this step |
| `reasoning` | `str` | `""` | Detailed reasoning |
| `considerations` | `List[str]` | `None` | Factors being considered |
| `confidence` | `float` | `None` | Confidence score (0.0-1.0) |

### log_thinking_decision

```python
async def log_thinking_decision(
    self,
    decision: str,
    rationale: str,
    alternatives: Optional[List[Dict[str, Any]]] = None,
    confidence: Optional[float] = None,
) -> None:
```

Log a decision made by the agent.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `decision` | `str` | required | The decision made |
| `rationale` | `str` | required | Why this decision was made |
| `alternatives` | `List[Dict]` | `None` | Alternatives considered |
| `confidence` | `float` | `None` | Decision confidence |

### log_thinking_end

```python
async def log_thinking_end(
    self,
    summary: str = "Completed analysis",
) -> None:
```

Log the end of thinking process.

## LangGraph Events

### log_graph_invoke_start

```python
async def log_graph_invoke_start(
    self,
    initial_state: Dict[str, Any],
) -> None:
```

Log when a LangGraph invoke starts.

### log_graph_invoke_end

```python
async def log_graph_invoke_end(
    self,
    final_state: Dict[str, Any],
    duration_ms: Optional[int] = None,
) -> None:
```

Log when a LangGraph invoke completes.

### log_node_enter

```python
async def log_node_enter(
    self,
    node_name: str,
    node_type: LangGraphNodeType,
    state_before: Dict[str, Any],
) -> None:
```

Log entering a LangGraph node.

### log_node_exit

```python
async def log_node_exit(
    self,
    node_name: str,
    node_type: LangGraphNodeType,
    state_before: Dict[str, Any],
    state_after: Dict[str, Any],
    duration_ms: Optional[int] = None,
) -> None:
```

Log exiting a LangGraph node. State delta is automatically computed.

### log_conditional_route

```python
async def log_conditional_route(
    self,
    from_node: str,
    to_node: str,
    route_decision: str,
    state: Dict[str, Any],
) -> None:
```

Log a conditional routing decision.

## LLM Events

### log_llm_request_start

```python
async def log_llm_request_start(
    self,
    model_name: str,
    prompt: str,
    system_prompt: Optional[str] = None,
) -> None:
```

Log when an LLM request starts.

### log_llm_response

```python
async def log_llm_response(
    self,
    model_name: str,
    prompt: str,
    response: str,
    input_tokens: Optional[int] = None,
    output_tokens: Optional[int] = None,
    latency_ms: Optional[int] = None,
) -> None:
```

Log an LLM response.

### log_llm_error

```python
async def log_llm_error(
    self,
    model_name: str,
    error: str,
    prompt: Optional[str] = None,
) -> None:
```

Log an LLM error.

## Output Events

### log_output_generated

```python
async def log_output_generated(
    self,
    content: str,
    target: str = "user",
    target_agent_id: Optional[str] = None,
    action_type: Optional[str] = None,
) -> None:
```

Log when output is generated.

### log_output_dispatched

```python
async def log_output_dispatched(
    self,
    content: str,
    target: str,
    target_agent_id: Optional[str] = None,
) -> None:
```

Log when output has been dispatched.

## Action Events

### log_action_planned

```python
async def log_action_planned(
    self,
    target_agent_id: str,
    instruction: str,
    action_type: str = "command",
    parameters: Optional[Dict[str, Any]] = None,
) -> str:
```

Log a planned action. Returns `action_id` for tracking.

### log_action_dispatched

```python
async def log_action_dispatched(
    self,
    action_id: str,
    target_agent_id: str,
    instruction: str,
) -> None:
```

### log_action_completed

```python
async def log_action_completed(
    self,
    action_id: str,
    result: Optional[str] = None,
) -> None:
```

### log_action_failed

```python
async def log_action_failed(
    self,
    action_id: str,
    error: str,
) -> None:
```

## State Events

### log_state_snapshot

```python
async def log_state_snapshot(
    self,
    state: Dict[str, Any],
    trigger: str = "periodic",
) -> None:
```

Log a full state snapshot.

### log_state_transition

```python
async def log_state_transition(
    self,
    from_status: str,
    to_status: str,
    reason: str = "",
) -> None:
```

## Error Events

### log_error

```python
async def log_error(
    self,
    error_type: str,
    message: str,
    exception: Optional[Exception] = None,
    context: Optional[Dict[str, Any]] = None,
    recoverable: bool = True,
) -> None:
```

Log an error.

## Lifecycle Events

### log_agent_startup

```python
async def log_agent_startup(
    self,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
```

### log_agent_shutdown

```python
async def log_agent_shutdown(
    self,
    reason: str = "normal",
) -> None:
```

## Context Managers

### trace_node

```python
@asynccontextmanager
async def trace_node(
    self,
    node_name: str,
    node_type: LangGraphNodeType,
    state: Dict[str, Any],
) -> AsyncGenerator[None, None]:
```

Context manager for tracing LangGraph node execution.

**Example:**

```python
async with transparency.trace_node("planner", LangGraphNodeType.PLANNER, state):
    result = await plan()
```

### trace_llm_call

```python
@asynccontextmanager
async def trace_llm_call(
    self,
    model_name: str,
    prompt: str,
    system_prompt: Optional[str] = None,
) -> AsyncGenerator[Dict[str, Any], None]:
```

Context manager for tracing LLM calls.

**Example:**

```python
async with transparency.trace_llm_call("gpt-4", prompt) as ctx:
    response = await llm.generate(prompt)
    ctx["response"] = response.text
```

### trace_thinking

```python
@asynccontextmanager
async def trace_thinking(
    self,
    description: str = "Processing request",
) -> AsyncGenerator[None, None]:
```

Context manager for tracing thinking process.
