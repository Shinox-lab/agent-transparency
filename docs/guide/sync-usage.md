# Synchronous Usage

While Agent Transparency is designed async-first, it provides a synchronous wrapper for use in sync code paths like LangGraph nodes.

## Overview

The `SyncTransparencyManager` wraps the async `TransparencyManager` to provide synchronous methods. This is essential for:

- LangGraph synchronous nodes
- Callback handlers
- Legacy synchronous code
- Thread-based applications

## Basic Usage

### Creating the Sync Manager

```python
from transparency import TransparencyManager, SyncTransparencyManager

# Create async manager first
async_manager = TransparencyManager(agent_id="my-agent")

# Create sync wrapper
sync_transparency = SyncTransparencyManager(async_manager)
```

### Using in Sync Functions

```python
def my_sync_function():
    """A synchronous function with transparency."""

    sync_transparency.log_thinking_step(
        ThinkingPhase.ANALYSIS,
        "Analyzing data",
        reasoning="Processing user request"
    )

    # Do work...
    result = process_data()

    sync_transparency.log_state_snapshot(
        {"result": result},
        trigger="processing_complete"
    )

    return result
```

## Available Sync Methods

The `SyncTransparencyManager` provides these synchronous methods:

| Method | Description |
|--------|-------------|
| `log_node_enter` | Log entering a LangGraph node |
| `log_node_exit` | Log exiting a LangGraph node |
| `log_thinking_step` | Log a thinking step |
| `log_llm_response` | Log an LLM response |
| `log_state_snapshot` | Log a state snapshot |
| `log_conditional_route` | Log a routing decision |

### Node Tracking

```python
def my_langgraph_node(state):
    """Synchronous LangGraph node."""

    sync_transparency.log_node_enter(
        node_name="my_node",
        node_type=LangGraphNodeType.CUSTOM,
        state_before=dict(state)
    )

    # Process...
    new_state = {"result": "processed"}

    sync_transparency.log_node_exit(
        node_name="my_node",
        node_type=LangGraphNodeType.CUSTOM,
        state_before=dict(state),
        state_after=new_state,
        duration_ms=100
    )

    return new_state
```

### Thinking Steps

```python
def analyze(data):
    """Analyze data with thinking logs."""

    sync_transparency.log_thinking_step(
        phase=ThinkingPhase.ANALYSIS,
        description="Analyzing input data",
        reasoning="Identifying patterns and anomalies"
    )

    # Analysis logic...
    return results
```

### LLM Responses

```python
def call_llm_sync(prompt: str) -> str:
    """Synchronous LLM call with logging."""

    # Make the call
    response = llm.generate(prompt)

    # Log it
    sync_transparency.log_llm_response(
        model_name="gpt-4",
        prompt=prompt,
        response=response.text,
        latency_ms=response.latency
    )

    return response.text
```

### Conditional Routing

```python
def router(state) -> str:
    """Route to next node."""

    if state.get("needs_research"):
        next_node = "researcher"
    else:
        next_node = "executor"

    sync_transparency.log_conditional_route(
        from_node="router",
        to_node=next_node,
        route_decision=f"needs_research={state.get('needs_research')}",
        state=dict(state)
    )

    return next_node
```

## LangGraph Integration

### Complete Node Example

```python
from langgraph.graph import StateGraph
from transparency import (
    TransparencyManager,
    SyncTransparencyManager,
    LangGraphNodeType,
    ThinkingPhase,
)
from typing import TypedDict

class MyState(TypedDict):
    input: str
    result: str

# Create managers
async_manager = TransparencyManager(agent_id="langgraph-agent")
sync_transparency = SyncTransparencyManager(async_manager)

def planner_node(state: MyState) -> MyState:
    """Planning node with sync transparency."""

    # Log entry
    sync_transparency.log_node_enter(
        "planner",
        LangGraphNodeType.PLANNER,
        dict(state)
    )

    # Log thinking
    sync_transparency.log_thinking_step(
        ThinkingPhase.PLANNING,
        "Creating execution plan",
        reasoning=f"Planning based on input: {state['input'][:50]}"
    )

    # Do planning
    plan = f"Plan for: {state['input']}"
    new_state = {**state, "result": plan}

    # Log exit
    sync_transparency.log_node_exit(
        "planner",
        LangGraphNodeType.PLANNER,
        dict(state),
        new_state
    )

    return new_state

def executor_node(state: MyState) -> MyState:
    """Execution node with sync transparency."""

    sync_transparency.log_node_enter(
        "executor",
        LangGraphNodeType.EXECUTOR,
        dict(state)
    )

    # Execute
    result = f"Executed: {state['result']}"
    new_state = {**state, "result": result}

    sync_transparency.log_node_exit(
        "executor",
        LangGraphNodeType.EXECUTOR,
        dict(state),
        new_state
    )

    return new_state

# Build graph
def build_graph():
    graph = StateGraph(MyState)
    graph.add_node("planner", planner_node)
    graph.add_node("executor", executor_node)
    graph.set_entry_point("planner")
    graph.add_edge("planner", "executor")
    return graph.compile()
```

### Running the Graph

```python
import asyncio

async def main():
    # Start the async manager
    await async_manager.start()

    try:
        # Log graph start
        await async_manager.log_graph_invoke_start(
            initial_state={"input": "Hello world", "result": ""}
        )

        # Run the graph (synchronous nodes use sync_transparency internally)
        graph = build_graph()
        result = graph.invoke({"input": "Hello world", "result": ""})

        # Log graph end
        await async_manager.log_graph_invoke_end(final_state=result)

        print(f"Result: {result}")

    finally:
        await async_manager.stop()

asyncio.run(main())
```

## How It Works

The `SyncTransparencyManager` handles async/sync bridging:

```python
class SyncTransparencyManager:
    def __init__(self, async_manager: TransparencyManager):
        self._async_manager = async_manager
        self._loop = None

    def _get_loop(self):
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
            # Schedule as task if loop is already running
            asyncio.ensure_future(coro)
        else:
            # Run in new loop
            loop.run_until_complete(coro)
```

## Thread Safety

When using from multiple threads:

```python
import threading
from transparency import TransparencyManager, SyncTransparencyManager

# Create shared manager
async_manager = TransparencyManager(agent_id="threaded-agent")

def worker(worker_id: int):
    """Worker thread function."""
    # Each thread can use the sync wrapper
    sync_transparency = SyncTransparencyManager(async_manager)

    sync_transparency.log_thinking_step(
        ThinkingPhase.ANALYSIS,
        f"Worker {worker_id} processing"
    )

# Start workers
threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

## Performance Considerations

### Event Loop Reuse

The sync manager creates one event loop and reuses it:

```python
# First call creates the loop
sync_transparency.log_thinking_step(...)  # Creates loop

# Subsequent calls reuse it
sync_transparency.log_thinking_step(...)  # Reuses loop
```

### Avoid Mixing Async and Sync

If you have an async context, use the async manager directly:

```python
# BAD: Using sync in async context
async def my_async_function():
    sync_transparency.log_thinking_step(...)  # Inefficient

# GOOD: Using async in async context
async def my_async_function():
    await async_manager.log_thinking_step(...)  # Direct
```

### Buffering

Events are still buffered through the async manager:

```python
# Events are buffered
sync_transparency.log_thinking_step(...)
sync_transparency.log_thinking_step(...)

# Flush when done (call on async manager)
await async_manager.stop()
```

## Common Patterns

### Hybrid Async/Sync

```python
# Async orchestrator, sync nodes
async def run_agent():
    await async_manager.start()

    try:
        await async_manager.log_input_received("User message")

        # Sync function does its own logging
        result = sync_processing_function()

        await async_manager.log_output_generated(result)
    finally:
        await async_manager.stop()

def sync_processing_function():
    """Sync function using sync manager."""
    sync_transparency.log_thinking_step(...)
    return "result"
```

### Callback Handler

```python
from langchain.callbacks.base import BaseCallbackHandler

class TransparencyCallback(BaseCallbackHandler):
    """Sync callback with transparency."""

    def __init__(self, sync_manager: SyncTransparencyManager):
        self.sync_transparency = sync_manager

    def on_llm_end(self, response, **kwargs):
        self.sync_transparency.log_llm_response(
            model_name="gpt-4",
            prompt="...",
            response=response.text
        )
```

## Limitations

1. **No context managers**: Use manual enter/exit calls
2. **Subset of methods**: Not all async methods are wrapped
3. **Performance overhead**: Async/sync bridging has some overhead
4. **Event loop**: May conflict with existing loops in some environments

## Next Steps

- [LangGraph Integration](/guide/langgraph-integration) - Full LangGraph guide
- [API Reference](/api/sync-transparency-manager) - Complete sync API
- [Examples](/examples/langgraph) - More sync examples
