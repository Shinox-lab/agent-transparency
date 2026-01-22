# Context Management

Context management allows you to track related events across sessions and conversations, enabling better correlation and analysis of agent behavior.

## Why Context Matters

Without context, events are isolated data points. With context, you can:

- **Trace conversations**: Follow all events in a single conversation
- **Track sessions**: See everything that happened in a user session
- **Correlate events**: Link related events across different parts of your system
- **Debug issues**: Quickly find all events related to a problem

## TransparencyContext

The `TransparencyContext` dataclass holds context information:

```python
from transparency import TransparencyContext

context = TransparencyContext(
    agent_id="my-agent",
    session_id="session-123",
    conversation_id="conv-456",
    correlation_id="abc-def-ghi",  # Auto-generated if not provided
    parent_span_id=None,
    sequence_counter=0,
)
```

### Context Fields

| Field | Description |
|-------|-------------|
| `agent_id` | The agent's identifier |
| `session_id` | User or system session ID |
| `conversation_id` | Specific conversation within a session |
| `correlation_id` | Unique ID for tracing related events (auto-generated) |
| `parent_span_id` | Parent context for nested operations |
| `sequence_counter` | Event sequence number within context |

## Creating Context

### Using `create_context`

Create a context manually:

```python
context = transparency.create_context(
    session_id="user-123-session",
    conversation_id="conv-2024-01-10-001",
)
```

### Setting Active Context

Set the active context for all subsequent events:

```python
# Create and set context
context = transparency.create_context(
    session_id="session-123",
    conversation_id="conv-456",
)
transparency.set_context(context)

# All events now include this context
await transparency.log_input_received("Hello")
await transparency.log_thinking_step(ThinkingPhase.ANALYSIS, "Processing")
await transparency.log_output_generated("Hi there!")
```

### Getting Current Context

Retrieve the active context:

```python
current_context = transparency.get_context()
if current_context:
    print(f"Session: {current_context.session_id}")
    print(f"Conversation: {current_context.conversation_id}")
```

## Context Scopes

Use context managers for scoped context:

```python
async with transparency.context_scope(
    session_id="session-123",
    conversation_id="conv-456",
):
    # All events in this block share the context
    await transparency.log_input_received("What's the weather?")
    await transparency.log_thinking_start("Processing")

    # Nested operations also use the same context
    result = await process_request()

    await transparency.log_output_generated(result)
# Context is automatically restored after the block
```

### Nested Scopes

Scopes can be nested:

```python
async with transparency.context_scope(session_id="session-123"):
    # Session-level context
    await transparency.log_input_received("User logged in")

    async with transparency.context_scope(
        session_id="session-123",
        conversation_id="conv-1",
    ):
        # First conversation
        await transparency.log_input_received("Hello")
        await transparency.log_output_generated("Hi!")

    async with transparency.context_scope(
        session_id="session-123",
        conversation_id="conv-2",
    ):
        # Second conversation (same session)
        await transparency.log_input_received("What's 2+2?")
        await transparency.log_output_generated("4")
```

## Child Contexts

Create child contexts for nested operations:

```python
# Get current context
parent_context = transparency.get_context()

# Create a child context (inherits parent info)
child_context = parent_context.create_child_context()
transparency.set_context(child_context)

# Child events link to parent
await transparency.log_thinking_step(
    ThinkingPhase.ANALYSIS,
    "Sub-task analysis"
)

# Restore parent context when done
transparency.set_context(parent_context)
```

## Sequence Numbers

Each context maintains a sequence counter for event ordering:

```python
context = transparency.create_context(session_id="session-123")
transparency.set_context(context)

# Each event gets an incrementing sequence number
await transparency.log_input_received("First")   # sequence: 1
await transparency.log_input_received("Second")  # sequence: 2
await transparency.log_input_received("Third")   # sequence: 3

# Access the current sequence
next_seq = context.next_sequence()  # returns 4
```

## Correlation IDs

Every context gets a unique correlation ID for tracing:

```python
context = transparency.create_context(session_id="session-123")
print(f"Correlation ID: {context.correlation_id}")
# Output: Correlation ID: 550e8400-e29b-41d4-a716-446655440000
```

Use correlation IDs to:
- Filter logs for a specific request
- Link events across services
- Build distributed traces

## Practical Patterns

### Per-Request Context

Create a new context for each incoming request:

```python
async def handle_request(request_id: str, user_id: str, message: str):
    async with transparency.context_scope(
        session_id=user_id,
        conversation_id=request_id,
    ):
        await transparency.log_input_received(message, source="user")

        # Process the request
        response = await process_message(message)

        await transparency.log_output_generated(response, target="user")
        return response
```

### LangGraph Node Context

Track context through graph execution:

```python
async def my_node(state):
    # Use existing context from state if available
    if "transparency_context" in state:
        transparency.set_context(state["transparency_context"])

    await transparency.log_node_enter(
        node_name="my_node",
        node_type=LangGraphNodeType.CUSTOM,
        state_before=state
    )

    # Process...
    new_state = await process(state)

    await transparency.log_node_exit(
        node_name="my_node",
        node_type=LangGraphNodeType.CUSTOM,
        state_before=state,
        state_after=new_state
    )

    return new_state
```

### Multi-Agent Context

Track context across multiple agents:

```python
async def orchestrator_agent(user_request: str):
    # Create main context
    async with transparency.context_scope(
        session_id=f"orchestrator-{uuid.uuid4()}",
        conversation_id="main",
    ):
        await transparency.log_input_received(user_request)

        # Dispatch to sub-agents
        context = transparency.get_context()

        # Pass correlation ID to sub-agents
        result = await call_sub_agent(
            "researcher",
            user_request,
            correlation_id=context.correlation_id
        )

        await transparency.log_output_generated(result)
```

## Filtering by Context

When analyzing logs, filter by context fields:

```python
import json

def filter_events(log_path: str, session_id: str = None, conversation_id: str = None):
    """Filter events by context."""
    with open(log_path, 'r') as f:
        for line in f:
            event = json.loads(line)
            metadata = event.get("metadata", {})

            if session_id and metadata.get("session_id") != session_id:
                continue
            if conversation_id and metadata.get("conversation_id") != conversation_id:
                continue

            yield event

# Example: Get all events from a specific conversation
for event in filter_events(
    "logs/agent_transparency.jsonl",
    session_id="user-123",
    conversation_id="conv-456"
):
    print(f"{event['event_type']}: {event['payload']}")
```

## Best Practices

1. **Always set context** before logging events
2. **Use meaningful IDs** that can be traced back to users or requests
3. **Create new contexts** for new conversations or requests
4. **Use child contexts** for nested operations
5. **Include correlation IDs** when calling external services
6. **Log context in errors** for easier debugging

## Next Steps

- [LangGraph Integration](/guide/langgraph-integration) - Context with LangGraph
- [API Reference](/api/transparency-manager) - Complete context API
- [Examples](/examples/) - Real-world context patterns
