# Enums

Enumeration types for event classification and configuration.

## EventType

Classifies the nature of transparency events.

```python
class EventType(str, Enum):
    # Lifecycle Events
    AGENT_STARTUP = "agent.startup"
    AGENT_SHUTDOWN = "agent.shutdown"
    AGENT_HEALTH_CHECK = "agent.health_check"

    # Input Events
    INPUT_RECEIVED = "input.received"
    INPUT_VALIDATED = "input.validated"
    INPUT_PARSED = "input.parsed"
    INPUT_REJECTED = "input.rejected"

    # Thinking Events
    THINKING_START = "thinking.start"
    THINKING_STEP = "thinking.step"
    THINKING_DECISION = "thinking.decision"
    THINKING_END = "thinking.end"

    # LangGraph Events
    GRAPH_INVOKE_START = "graph.invoke.start"
    GRAPH_INVOKE_END = "graph.invoke.end"
    GRAPH_NODE_ENTER = "graph.node.enter"
    GRAPH_NODE_EXIT = "graph.node.exit"
    GRAPH_EDGE_TRAVERSE = "graph.edge.traverse"
    GRAPH_CONDITIONAL_ROUTE = "graph.conditional.route"
    GRAPH_STATE_UPDATE = "graph.state.update"

    # LLM Events
    LLM_REQUEST_START = "llm.request.start"
    LLM_REQUEST_END = "llm.request.end"
    LLM_PROMPT_SENT = "llm.prompt.sent"
    LLM_RESPONSE_RECEIVED = "llm.response.received"
    LLM_TOKEN_USAGE = "llm.token.usage"
    LLM_ERROR = "llm.error"

    # Output Events
    OUTPUT_GENERATED = "output.generated"
    OUTPUT_VALIDATED = "output.validated"
    OUTPUT_DISPATCHED = "output.dispatched"
    OUTPUT_FAILED = "output.failed"

    # Action Events
    ACTION_PLANNED = "action.planned"
    ACTION_DISPATCHED = "action.dispatched"
    ACTION_COMPLETED = "action.completed"
    ACTION_FAILED = "action.failed"

    # Communication Events
    MESSAGE_SENT = "message.sent"
    MESSAGE_RECEIVED = "message.received"
    MESSAGE_ACKNOWLEDGED = "message.acknowledged"

    # State Events
    STATE_SNAPSHOT = "state.snapshot"
    STATE_TRANSITION = "state.transition"

    # Error Events
    ERROR_OCCURRED = "error.occurred"
    ERROR_RECOVERED = "error.recovered"
    ERROR_FATAL = "error.fatal"

    # Debug Events
    DEBUG_LOG = "debug.log"
    DEBUG_TRACE = "debug.trace"
```

### Categories

| Category | Events | Description |
|----------|--------|-------------|
| Lifecycle | `AGENT_*` | Agent start/stop |
| Input | `INPUT_*` | Receiving input |
| Thinking | `THINKING_*` | Reasoning process |
| LangGraph | `GRAPH_*` | Graph execution |
| LLM | `LLM_*` | LLM interactions |
| Output | `OUTPUT_*` | Generating output |
| Action | `ACTION_*` | Agent actions |
| State | `STATE_*` | State changes |
| Error | `ERROR_*` | Error handling |
| Debug | `DEBUG_*` | Debug info |

### Usage

```python
from transparency import EventType

# Check event type
if event.event_type == EventType.LLM_RESPONSE_RECEIVED:
    print(f"LLM response: {event.payload}")

# Filter events
llm_events = [EventType.LLM_REQUEST_START, EventType.LLM_RESPONSE_RECEIVED]
```

---

## ThinkingPhase

Represents phases of the agent's thinking process.

```python
class ThinkingPhase(str, Enum):
    PERCEPTION = "perception"    # Understanding input
    ANALYSIS = "analysis"        # Analyzing the situation
    PLANNING = "planning"        # Formulating a plan
    REASONING = "reasoning"      # Logical reasoning
    EVALUATION = "evaluation"    # Evaluating options
    DECISION = "decision"        # Making a decision
    SYNTHESIS = "synthesis"      # Combining information
    REFLECTION = "reflection"    # Self-reflection
```

### Phase Descriptions

| Phase | Description | When to Use |
|-------|-------------|-------------|
| `PERCEPTION` | Understanding input | Initial input processing |
| `ANALYSIS` | Analyzing situation | Breaking down the problem |
| `PLANNING` | Formulating plan | Creating action steps |
| `REASONING` | Logical reasoning | Working through logic |
| `EVALUATION` | Evaluating options | Comparing alternatives |
| `DECISION` | Making decision | Choosing an option |
| `SYNTHESIS` | Combining info | Bringing pieces together |
| `REFLECTION` | Self-reflection | Reviewing process |

### Usage

```python
from transparency import ThinkingPhase

await transparency.log_thinking_step(
    phase=ThinkingPhase.ANALYSIS,
    description="Analyzing user intent"
)

await transparency.log_thinking_step(
    phase=ThinkingPhase.DECISION,
    description="Choosing best approach"
)
```

---

## LangGraphNodeType

Categorizes LangGraph node types.

```python
class LangGraphNodeType(str, Enum):
    MONITOR = "monitor"
    PLANNER = "planner"
    EXECUTOR = "executor"
    UPDATER = "updater"
    ROUTER = "router"
    TOOL_CALLER = "tool_caller"
    RETRIEVER = "retriever"
    SUMMARIZER = "summarizer"
    VALIDATOR = "validator"
    CUSTOM = "custom"
```

### Node Type Descriptions

| Type | Description | Use Case |
|------|-------------|----------|
| `MONITOR` | Observing state | Health checks, logging |
| `PLANNER` | Creating plans | Strategy nodes |
| `EXECUTOR` | Executing actions | Action nodes |
| `UPDATER` | Updating state | State modification |
| `ROUTER` | Routing decisions | Conditional edges |
| `TOOL_CALLER` | Calling tools | Tool use nodes |
| `RETRIEVER` | Fetching data | RAG retrievers |
| `SUMMARIZER` | Summarizing | Summarization nodes |
| `VALIDATOR` | Validating | Validation checks |
| `CUSTOM` | Custom type | Anything else |

### Usage

```python
from transparency import LangGraphNodeType

await transparency.log_node_enter(
    "research_node",
    LangGraphNodeType.RETRIEVER,
    state
)

sync_transparency.log_node_enter(
    "planning_node",
    LangGraphNodeType.PLANNER,
    state
)
```

---

## OutputDestination

Defines where transparency events can be sent.

```python
class OutputDestination(str, Enum):
    FILE = "file"
    KAFKA = "kafka"
    CONSOLE = "console"
    WEBHOOK = "webhook"
    MEMORY = "memory"
```

### Destination Descriptions

| Destination | Description | Use Case |
|-------------|-------------|----------|
| `FILE` | JSONL files | Persistent storage |
| `KAFKA` | Kafka streams | Real-time processing |
| `CONSOLE` | stdout | Development |
| `WEBHOOK` | HTTP endpoints | External services |
| `MEMORY` | In-memory buffer | Testing |

### Usage

```python
from transparency import TransparencyConfig, OutputDestination

config = TransparencyConfig(
    destinations=[
        OutputDestination.FILE,
        OutputDestination.CONSOLE,
    ]
)
```

---

## Severity

Event severity levels.

```python
class Severity(str, Enum):
    TRACE = "trace"
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
```

### Severity Levels

| Level | Order | Description | Color |
|-------|-------|-------------|-------|
| `TRACE` | 0 | Finest-grained | Gray |
| `DEBUG` | 1 | Diagnostic info | Cyan |
| `INFO` | 2 | General info | Green |
| `WARNING` | 3 | Warnings | Yellow |
| `ERROR` | 4 | Errors | Red |
| `CRITICAL` | 5 | Critical failures | Magenta |

### Usage

```python
from transparency import Severity, TransparencyConfig

# Filter by severity
config = TransparencyConfig(
    min_severity=Severity.INFO  # Skip TRACE and DEBUG
)

# Log with severity
await transparency.log_event(
    EventType.DEBUG_LOG,
    {"message": "Debug info"},
    severity=Severity.DEBUG
)
```

---

## SourceType

Event source types for the viewer.

```python
class SourceType(PyEnum):
    FILE = "file"
    KAFKA = "kafka"
```

### Source Descriptions

| Source | Description |
|--------|-------------|
| `FILE` | Watch a JSONL file |
| `KAFKA` | Consume from Kafka |

### Usage

```python
from transparency import ServerConfig, SourceType

config = ServerConfig(
    source_type=SourceType.FILE,
    log_path="./logs/agent.jsonl"
)
```

## See Also

- [Event Types Guide](/guide/event-types) - Detailed event documentation
- [Configuration](/api/configuration) - Using enums in config
