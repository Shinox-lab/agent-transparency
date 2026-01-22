# Data Classes

Data structures for transparency events.

## EventMetadata

Common metadata attached to all transparency events.

```python
@dataclass
class EventMetadata:
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent_id: str = ""
    session_id: str = ""
    conversation_id: str = ""
    correlation_id: str = ""
    parent_event_id: Optional[str] = None
    sequence_number: int = 0
    severity: Severity = Severity.INFO
    tags: List[str] = field(default_factory=list)
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `event_id` | `str` | Unique event identifier (auto-generated UUID) |
| `timestamp` | `str` | ISO format timestamp |
| `agent_id` | `str` | Agent identifier |
| `session_id` | `str` | Session identifier |
| `conversation_id` | `str` | Conversation identifier |
| `correlation_id` | `str` | For tracing related events |
| `parent_event_id` | `str` | For hierarchical events |
| `sequence_number` | `int` | Event sequence in context |
| `severity` | `Severity` | Event severity level |
| `tags` | `List[str]` | Event tags for filtering |

### Methods

#### to_dict

```python
def to_dict(self) -> Dict[str, Any]:
```

Convert to dictionary for serialization.

---

## InputEvent

Captures details about input received by the agent.

```python
@dataclass
class InputEvent:
    raw_content: str
    content_type: str = "text"
    source: str = ""
    source_agent_id: Optional[str] = None
    parsed_intent: Optional[str] = None
    extracted_entities: Dict[str, Any] = field(default_factory=dict)
    validation_status: str = "pending"
    validation_errors: List[str] = field(default_factory=list)
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `raw_content` | `str` | The raw input content |
| `content_type` | `str` | Type (text, json, binary) |
| `source` | `str` | Source (user, agent, system) |
| `source_agent_id` | `str` | Agent ID if from another agent |
| `parsed_intent` | `str` | Extracted intent |
| `extracted_entities` | `Dict` | Extracted entities |
| `validation_status` | `str` | Validation status |
| `validation_errors` | `List[str]` | Validation errors |

---

## ThinkingEvent

Captures the agent's internal reasoning.

```python
@dataclass
class ThinkingEvent:
    phase: ThinkingPhase
    description: str
    reasoning: str = ""
    considerations: List[str] = field(default_factory=list)
    alternatives_evaluated: List[Dict[str, Any]] = field(default_factory=list)
    decision_rationale: Optional[str] = None
    confidence_score: Optional[float] = None
    duration_ms: Optional[int] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `phase` | `ThinkingPhase` | Current thinking phase |
| `description` | `str` | Description of this step |
| `reasoning` | `str` | Detailed reasoning |
| `considerations` | `List[str]` | Factors considered |
| `alternatives_evaluated` | `List[Dict]` | Alternatives evaluated |
| `decision_rationale` | `str` | Why this decision |
| `confidence_score` | `float` | Confidence (0.0-1.0) |
| `duration_ms` | `int` | Duration in milliseconds |

---

## LangGraphEvent

Captures LangGraph-specific execution details.

```python
@dataclass
class LangGraphEvent:
    node_name: str
    node_type: LangGraphNodeType
    state_before: Dict[str, Any] = field(default_factory=dict)
    state_after: Dict[str, Any] = field(default_factory=dict)
    state_delta: Dict[str, Any] = field(default_factory=dict)
    next_node: Optional[str] = None
    route_decision: Optional[str] = None
    duration_ms: Optional[int] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `node_name` | `str` | Name of the node |
| `node_type` | `LangGraphNodeType` | Type of node |
| `state_before` | `Dict` | State before node |
| `state_after` | `Dict` | State after node |
| `state_delta` | `Dict` | Computed state changes |
| `next_node` | `str` | Next node (for routing) |
| `route_decision` | `str` | Routing decision made |
| `duration_ms` | `int` | Execution duration |

---

## LLMEvent

Captures LLM interaction details.

```python
@dataclass
class LLMEvent:
    model_name: str
    prompt: str = ""
    response: str = ""
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    cost_usd: Optional[float] = None
    error: Optional[str] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `model_name` | `str` | Name of the model |
| `prompt` | `str` | The prompt sent |
| `response` | `str` | The response received |
| `system_prompt` | `str` | System prompt if any |
| `temperature` | `float` | Temperature setting |
| `max_tokens` | `int` | Max tokens setting |
| `input_tokens` | `int` | Input token count |
| `output_tokens` | `int` | Output token count |
| `total_tokens` | `int` | Total token count |
| `latency_ms` | `int` | Request latency |
| `cost_usd` | `float` | Estimated cost |
| `error` | `str` | Error message if failed |

---

## OutputEvent

Captures details about output generated.

```python
@dataclass
class OutputEvent:
    content: str
    content_type: str = "text"
    target: str = ""
    target_agent_id: Optional[str] = None
    action_type: Optional[str] = None
    delivery_status: str = "pending"
    delivery_error: Optional[str] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `content` | `str` | The output content |
| `content_type` | `str` | Type (text, json, etc.) |
| `target` | `str` | Target (user, agent, etc.) |
| `target_agent_id` | `str` | Target agent ID |
| `action_type` | `str` | Type of action |
| `delivery_status` | `str` | Delivery status |
| `delivery_error` | `str` | Error if failed |

---

## ActionEvent

Captures details about actions taken.

```python
@dataclass
class ActionEvent:
    action_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str = ""
    target_agent_id: Optional[str] = None
    instruction: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    status: str = "planned"
    result: Optional[str] = None
    error: Optional[str] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `action_id` | `str` | Unique action ID |
| `action_type` | `str` | Type of action |
| `target_agent_id` | `str` | Target agent |
| `instruction` | `str` | Action instruction |
| `parameters` | `Dict` | Action parameters |
| `status` | `str` | Status (planned, dispatched, completed, failed) |
| `result` | `str` | Action result |
| `error` | `str` | Error if failed |

---

## StateSnapshot

Captures a complete snapshot of agent state.

```python
@dataclass
class StateSnapshot:
    squad_status: str = ""
    plan: List[List[str]] = field(default_factory=list)
    assignments: Dict[str, str] = field(default_factory=dict)
    available_agents: List[str] = field(default_factory=list)
    message_count: int = 0
    last_message_preview: str = ""
    pending_actions: List[Dict[str, Any]] = field(default_factory=list)
    custom_state: Dict[str, Any] = field(default_factory=dict)
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `squad_status` | `str` | Current status |
| `plan` | `List[List[str]]` | Current plan |
| `assignments` | `Dict[str, str]` | Agent assignments |
| `available_agents` | `List[str]` | Available agents |
| `message_count` | `int` | Total messages |
| `last_message_preview` | `str` | Preview of last message |
| `pending_actions` | `List[Dict]` | Pending actions |
| `custom_state` | `Dict` | Custom state data |

---

## ErrorEvent

Captures error information.

```python
@dataclass
class ErrorEvent:
    error_type: str
    message: str
    stack_trace: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)
    recoverable: bool = True
    recovery_action: Optional[str] = None
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `error_type` | `str` | Type of error |
| `message` | `str` | Error message |
| `stack_trace` | `str` | Stack trace if available |
| `context` | `Dict` | Additional context |
| `recoverable` | `bool` | Whether recoverable |
| `recovery_action` | `str` | Recovery action taken |

---

## TransparencyEvent

The main transparency event envelope.

```python
@dataclass
class TransparencyEvent:
    event_type: EventType
    metadata: EventMetadata
    payload: Union[
        InputEvent,
        ThinkingEvent,
        LangGraphEvent,
        LLMEvent,
        OutputEvent,
        ActionEvent,
        StateSnapshot,
        ErrorEvent,
        Dict[str, Any]
    ]
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | `EventType` | Type of event |
| `metadata` | `EventMetadata` | Event metadata |
| `payload` | `Union[...]` | Event-specific payload |

### Methods

#### to_dict

```python
def to_dict(self) -> Dict[str, Any]:
```

Convert the entire event to a dictionary for serialization.

### Example Output

```json
{
    "event_type": "thinking.step",
    "metadata": {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2024-01-10T15:30:45.123456Z",
        "agent_id": "my-agent",
        "session_id": "session-123",
        "sequence_number": 42,
        "severity": "debug",
        "tags": ["thinking", "analysis"]
    },
    "payload": {
        "phase": "analysis",
        "description": "Analyzing user request",
        "reasoning": "User wants weather information",
        "confidence_score": 0.95
    }
}
```

## See Also

- [Event Types](/api/event-types) - Event type reference
- [Enums](/api/enums) - Enumeration types
