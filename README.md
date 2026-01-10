# Agent Transparency

A comprehensive Python library for tracking the input, thought process, and output of AI agents. Provides extreme transparency into agent behavior for debugging, auditing, and understanding agent decisions.

## Features

- **Comprehensive Event Tracking**: Log inputs, thinking processes, LLM calls, graph executions, outputs, and errors
- **Multiple Output Destinations**: Write to files (JSONL), console, or Kafka streams
- **LangGraph Integration**: Built-in support for tracking LangGraph node executions and state transitions
- **Async & Sync APIs**: Both asynchronous and synchronous interfaces for flexibility
- **Context Management**: Track related events across sessions and conversations
- **Real-time Viewer**: Optional web-based viewer for monitoring agent activity in real-time
- **Lightweight**: Minimal dependencies for core functionality
- **Type-Safe**: Full type hints and dataclass-based event structures

## Installation

### Basic Installation

```bash
pip install agent-transparency
```

### With Optional Features

```bash
# Install with UI viewer support
pip install agent-transparency[ui]

# Install with Kafka streaming support
pip install agent-transparency[kafka]

# Install with all optional features
pip install agent-transparency[all]

# Install with development dependencies
pip install agent-transparency[dev]
```

## Quick Start

```python
from transparency import (
    TransparencyManager,
    create_transparency_manager,
    ThinkingPhase,
)

# Create a transparency manager
transparency = create_transparency_manager(
    agent_id="my-agent",
    file_path="./logs",
)

# Start the manager
await transparency.start()

# Log events
await transparency.log_input_received("User asks: What's the weather?")

await transparency.log_thinking_step(
    ThinkingPhase.ANALYSIS,
    "Analyzing user request for weather information"
)

await transparency.log_llm_request_start(
    model_name="gpt-4",
    prompt="Get weather for user location"
)

await transparency.log_output_generated(
    "The weather is sunny, 72°F",
    target="user"
)

# Stop when done (flushes remaining events)
await transparency.stop()
```

## Event Types

The library supports comprehensive event tracking across the entire agent lifecycle:

### Lifecycle Events
- `AGENT_STARTUP` - Agent initialization
- `AGENT_SHUTDOWN` - Agent termination

### Input Events
- `INPUT_RECEIVED` - Raw input received
- `INPUT_PARSED` - Input parsed and validated
- `INPUT_VALIDATED` - Input validation complete
- `INPUT_REJECTED` - Input rejected

### Thinking Events
- `THINKING_START` - Begin thinking process
- `THINKING_STEP` - Individual reasoning step
- `THINKING_DECISION` - Decision made
- `THINKING_END` - Thinking process complete

### LangGraph Events
- `GRAPH_INVOKE_START` - Graph execution starts
- `GRAPH_NODE_ENTER` - Entering a node
- `GRAPH_NODE_EXIT` - Exiting a node
- `GRAPH_CONDITIONAL_ROUTE` - Conditional routing decision
- `GRAPH_INVOKE_END` - Graph execution complete

### LLM Events
- `LLM_REQUEST_START` - LLM call initiated
- `LLM_RESPONSE_RECEIVED` - LLM response received
- `LLM_ERROR` - LLM call failed

### Output Events
- `OUTPUT_GENERATED` - Output created
- `OUTPUT_DISPATCHED` - Output sent to target

### Action Events
- `ACTION_PLANNED` - Action planned
- `ACTION_DISPATCHED` - Action sent
- `ACTION_COMPLETED` - Action finished successfully
- `ACTION_FAILED` - Action failed

### State Events
- `STATE_SNAPSHOT` - Full state capture
- `STATE_TRANSITION` - State changed

### Error Events
- `ERROR_OCCURRED` - Error detected
- `ERROR_RECOVERED` - Error recovered
- `ERROR_FATAL` - Fatal error

## Usage Examples

### LangGraph Integration

```python
from transparency import TransparencyManager, LangGraphNodeType

transparency = TransparencyManager(agent_id="langgraph-agent")
await transparency.start()

# Track graph execution
await transparency.log_graph_invoke_start(initial_state={"messages": []})

# Track node execution
await transparency.log_node_enter(
    node_name="planner",
    node_type=LangGraphNodeType.PLANNER,
    state_before=state
)

# Use context manager for automatic entry/exit tracking
async with transparency.trace_node("executor", LangGraphNodeType.EXECUTOR, state):
    # Your node logic here
    result = await execute_plan()

await transparency.log_graph_invoke_end(final_state=state)
```

### LLM Call Tracking

```python
# Manual tracking
await transparency.log_llm_request_start(
    model_name="gpt-4",
    prompt="Analyze this data",
    system_prompt="You are a data analyst"
)

response = await llm.generate(prompt)

await transparency.log_llm_response(
    model_name="gpt-4",
    prompt="Analyze this data",
    response=response.text,
    input_tokens=response.usage.input_tokens,
    output_tokens=response.usage.output_tokens,
    latency_ms=response.latency
)

# Or use context manager
async with transparency.trace_llm_call("gpt-4", prompt) as ctx:
    response = await llm.generate(prompt)
    ctx["response"] = response.text
```

### Context Management

```python
# Create a context for tracking related events
context = transparency.create_context(
    session_id="session-123",
    conversation_id="conv-456"
)
transparency.set_context(context)

# All subsequent events will include this context
await transparency.log_input_received("Hello")

# Or use context manager
async with transparency.context_scope(session_id="session-123"):
    await transparency.log_input_received("Hello")
    await transparency.log_thinking_step(...)
    # Context automatically restored after block
```

### Thinking Process Tracking

```python
# Track detailed reasoning
await transparency.log_thinking_start("Processing user request")

await transparency.log_thinking_step(
    phase=ThinkingPhase.PERCEPTION,
    description="Understanding user intent",
    reasoning="User is asking about weather conditions"
)

await transparency.log_thinking_step(
    phase=ThinkingPhase.PLANNING,
    description="Planning data retrieval",
    considerations=[
        "Need user location",
        "Check weather API availability",
        "Format response appropriately"
    ]
)

await transparency.log_thinking_decision(
    decision="Fetch weather data from OpenWeatherMap API",
    rationale="Most reliable source with current conditions",
    alternatives=[
        {"option": "Weather.gov", "reason_rejected": "Limited coverage"},
        {"option": "AccuWeather", "reason_rejected": "Requires premium API"}
    ],
    confidence=0.95
)

await transparency.log_thinking_end("Request processing complete")
```

### Error Tracking

```python
try:
    result = await risky_operation()
except Exception as e:
    await transparency.log_error(
        error_type="APIError",
        message=str(e),
        exception=e,
        context={"operation": "weather_fetch", "retry_count": 3},
        recoverable=True
    )
```

### Synchronous Usage

```python
from transparency import SyncTransparencyManager

# Wrap async manager for sync contexts (like LangGraph nodes)
async_manager = TransparencyManager(agent_id="sync-agent")
sync_transparency = SyncTransparencyManager(async_manager)

# Use in synchronous functions
def my_langgraph_node(state):
    sync_transparency.log_node_enter("my_node", LangGraphNodeType.CUSTOM, state)

    # Do work...

    sync_transparency.log_node_exit("my_node", LangGraphNodeType.CUSTOM, state, new_state)
    return new_state
```

## Configuration

### Output Destinations

```python
from transparency import TransparencyConfig, OutputDestination

config = TransparencyConfig(
    enabled=True,
    destinations=[
        OutputDestination.FILE,
        OutputDestination.CONSOLE,
        OutputDestination.KAFKA
    ],

    # File settings
    file_path="./transparency_logs",

    # Kafka settings (requires aiokafka)
    kafka_topic="agent.transparency",
    kafka_broker=kafka_broker_instance,

    # Filtering
    min_severity=Severity.DEBUG,
    event_type_filter=[],  # Empty = all events

    # Performance
    buffer_size=100,
    flush_interval_seconds=1.0,
    async_mode=True,

    # Formatting
    pretty_print=True,
    include_stack_traces=True
)

transparency = TransparencyManager(agent_id="my-agent", config=config)
```

### Severity Levels

Events are logged with severity levels for filtering:

- `TRACE` - Finest-grained debugging
- `DEBUG` - Detailed diagnostic information
- `INFO` - General informational messages
- `WARNING` - Warning messages
- `ERROR` - Error events
- `CRITICAL` - Critical failures

```python
# Only log INFO and above
config.min_severity = Severity.INFO
```

## Real-time Viewer

The library includes an optional web-based viewer for monitoring agent activity in real-time.

### Starting the Viewer

```bash
# Watch a log file
transparency-viewer --log-path ./logs/my-agent_transparency.jsonl

# Or from Kafka
transparency-viewer --kafka-bootstrap localhost:9092 --kafka-topic agent.my-agent.transparency

# Custom port
transparency-viewer --log-path ./logs/my-agent_transparency.jsonl --port 8080
```

Then open `http://localhost:8765` in your browser.

### Programmatic Usage

```python
from viewer.viewer_server import TransparencyViewerServer, ServerConfig, SourceType

# File-based viewer
config = ServerConfig(
    port=8765,
    source_type=SourceType.FILE,
    log_path="./logs/agent_transparency.jsonl"
)

server = TransparencyViewerServer(config)
await server.start()

# Keep running
await asyncio.Event().wait()
```

## Output Format

Events are logged in JSONL format (newline-delimited JSON):

```json
{
  "event_type": "thinking.step",
  "metadata": {
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-10T15:30:45.123456Z",
    "agent_id": "my-agent",
    "session_id": "session-123",
    "conversation_id": "conv-456",
    "sequence_number": 42,
    "severity": "debug",
    "tags": ["thinking", "analysis"]
  },
  "payload": {
    "phase": "analysis",
    "description": "Analyzing user request",
    "reasoning": "User wants weather information",
    "considerations": ["Location needed", "API selection"],
    "confidence_score": 0.95
  }
}
```

## Best Practices

1. **Start/Stop the Manager**: Always call `start()` and `stop()` to ensure proper buffering and flushing
2. **Use Context Managers**: Leverage `trace_node()`, `trace_llm_call()`, and `context_scope()` for automatic tracking
3. **Set Contexts**: Use session and conversation IDs to correlate related events
4. **Filter Appropriately**: Set `min_severity` and `event_type_filter` in production to reduce overhead
5. **Async Mode**: Keep `async_mode=True` for better performance in high-throughput scenarios
6. **Monitor Buffer Size**: Adjust `buffer_size` based on event volume

## Requirements

- Python 3.12+
- Core: No external dependencies
- UI Viewer: `aiohttp>=3.8.0`
- Kafka: `aiokafka>=0.8.0`

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- PyPI: https://pypi.org/project/agent-transparency/
- GitHub: https://github.com/agentsquad/transparency
- Issues: https://github.com/agentsquad/transparency/issues

## Author

Agent Squad - shine.six.s6@gmail.com
