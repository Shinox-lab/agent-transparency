# SyncTransparencyManager

Synchronous wrapper for TransparencyManager, designed for use in synchronous code paths like LangGraph nodes.

## Class Definition

```python
class SyncTransparencyManager:
    def __init__(self, async_manager: TransparencyManager):
```

## Constructor

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `async_manager` | `TransparencyManager` | The async manager to wrap |

### Example

```python
from transparency import TransparencyManager, SyncTransparencyManager

# Create async manager
async_manager = TransparencyManager(agent_id="my-agent")

# Create sync wrapper
sync_transparency = SyncTransparencyManager(async_manager)
```

## Methods

### log_node_enter

```python
def log_node_enter(
    self,
    node_name: str,
    node_type: LangGraphNodeType,
    state_before: Dict[str, Any],
) -> None:
```

Synchronous version of `log_node_enter`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `node_name` | `str` | Name of the node |
| `node_type` | `LangGraphNodeType` | Type of node |
| `state_before` | `Dict[str, Any]` | State before entering |

**Example:**

```python
def my_node(state):
    sync_transparency.log_node_enter(
        "my_node",
        LangGraphNodeType.CUSTOM,
        dict(state)
    )
    # ... node logic
```

### log_node_exit

```python
def log_node_exit(
    self,
    node_name: str,
    node_type: LangGraphNodeType,
    state_before: Dict[str, Any],
    state_after: Dict[str, Any],
    duration_ms: Optional[int] = None,
) -> None:
```

Synchronous version of `log_node_exit`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `node_name` | `str` | Name of the node |
| `node_type` | `LangGraphNodeType` | Type of node |
| `state_before` | `Dict[str, Any]` | State before node |
| `state_after` | `Dict[str, Any]` | State after node |
| `duration_ms` | `int` | Optional execution duration |

**Example:**

```python
def my_node(state):
    state_before = dict(state)
    start = time.time()

    # ... node logic
    new_state = {"result": "done"}

    duration = int((time.time() - start) * 1000)
    sync_transparency.log_node_exit(
        "my_node",
        LangGraphNodeType.CUSTOM,
        state_before,
        new_state,
        duration
    )
    return new_state
```

### log_thinking_step

```python
def log_thinking_step(
    self,
    phase: ThinkingPhase,
    description: str,
    reasoning: str = "",
) -> None:
```

Synchronous version of `log_thinking_step`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `phase` | `ThinkingPhase` | Current thinking phase |
| `description` | `str` | Description of this step |
| `reasoning` | `str` | Detailed reasoning |

**Example:**

```python
def analyze(data):
    sync_transparency.log_thinking_step(
        ThinkingPhase.ANALYSIS,
        "Analyzing input data",
        reasoning="Looking for patterns"
    )
    # ... analysis logic
```

### log_llm_response

```python
def log_llm_response(
    self,
    model_name: str,
    prompt: str,
    response: str,
    latency_ms: Optional[int] = None,
) -> None:
```

Synchronous version of `log_llm_response`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `model_name` | `str` | Name of the LLM model |
| `prompt` | `str` | The prompt sent |
| `response` | `str` | The response received |
| `latency_ms` | `int` | Request latency in milliseconds |

**Example:**

```python
def call_llm(prompt):
    start = time.time()
    response = llm.generate(prompt)
    latency = int((time.time() - start) * 1000)

    sync_transparency.log_llm_response(
        "gpt-4",
        prompt,
        response.text,
        latency
    )
    return response.text
```

### log_state_snapshot

```python
def log_state_snapshot(
    self,
    state: Dict[str, Any],
    trigger: str = "node_exit",
) -> None:
```

Synchronous version of `log_state_snapshot`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `state` | `Dict[str, Any]` | State to snapshot |
| `trigger` | `str` | What triggered the snapshot |

**Example:**

```python
def my_node(state):
    # ... process
    sync_transparency.log_state_snapshot(
        new_state,
        trigger="after_processing"
    )
```

### log_conditional_route

```python
def log_conditional_route(
    self,
    from_node: str,
    to_node: str,
    route_decision: str,
    state: Dict[str, Any],
) -> None:
```

Synchronous version of `log_conditional_route`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from_node` | `str` | Source node |
| `to_node` | `str` | Destination node |
| `route_decision` | `str` | Reason for routing |
| `state` | `Dict[str, Any]` | Current state |

**Example:**

```python
def router(state) -> str:
    if state.get("needs_research"):
        next_node = "researcher"
    else:
        next_node = "executor"

    sync_transparency.log_conditional_route(
        "router",
        next_node,
        f"needs_research={state.get('needs_research')}",
        dict(state)
    )
    return next_node
```

## Usage Patterns

### LangGraph Node

```python
from transparency import (
    TransparencyManager,
    SyncTransparencyManager,
    LangGraphNodeType,
    ThinkingPhase,
)

async_manager = TransparencyManager(agent_id="agent")
sync_transparency = SyncTransparencyManager(async_manager)

def planner_node(state):
    """Synchronous LangGraph node."""
    state_before = dict(state)

    sync_transparency.log_node_enter(
        "planner",
        LangGraphNodeType.PLANNER,
        state_before
    )

    sync_transparency.log_thinking_step(
        ThinkingPhase.PLANNING,
        "Creating plan",
        reasoning="Analyzing requirements"
    )

    # Do planning...
    plan = create_plan(state)
    new_state = {**state, "plan": plan}

    sync_transparency.log_node_exit(
        "planner",
        LangGraphNodeType.PLANNER,
        state_before,
        new_state
    )

    return new_state
```

### With Async Orchestration

```python
async def main():
    # Start async manager
    await async_manager.start()

    try:
        # Log graph start (async)
        await async_manager.log_graph_invoke_start(initial_state)

        # Run graph with sync nodes
        graph = build_graph()  # Uses sync nodes internally
        result = await graph.ainvoke(initial_state)

        # Log graph end (async)
        await async_manager.log_graph_invoke_end(result)

    finally:
        await async_manager.stop()
```

## Internal Mechanics

### Event Loop Handling

```python
def _get_loop(self) -> asyncio.AbstractEventLoop:
    """Get or create an event loop."""
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        if self._loop is None:
            self._loop = asyncio.new_event_loop()
        return self._loop

def _run(self, coro):
    """Run a coroutine synchronously."""
    loop = self._get_loop()
    if loop.is_running():
        asyncio.ensure_future(coro)
    else:
        loop.run_until_complete(coro)
```

## Limitations

1. **Subset of methods**: Not all async methods are available
2. **No context managers**: Use manual enter/exit
3. **Threading considerations**: Safe but may have overhead
4. **Buffer flushing**: Handled by async manager

## See Also

- [TransparencyManager](/api/transparency-manager) - Full async API
- [Synchronous Usage Guide](/guide/sync-usage) - Usage patterns
- [LangGraph Integration](/guide/langgraph-integration) - LangGraph examples
