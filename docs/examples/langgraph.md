# LangGraph Integration

A complete example of integrating Agent Transparency with LangGraph.

## Overview

This example demonstrates:
- Tracking graph invoke start/end
- Logging node enter/exit with state
- Conditional routing with transparency
- Using sync wrapper for LangGraph nodes

## Complete Example

```python
import asyncio
import time
from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import StateGraph, END
from operator import add

from transparency import (
    TransparencyManager,
    SyncTransparencyManager,
    LangGraphNodeType,
    ThinkingPhase,
    create_transparency_manager,
)

# Define state
class AgentState(TypedDict):
    messages: Annotated[List[str], add]
    current_task: Optional[str]
    plan: Optional[List[str]]
    result: Optional[str]
    iterations: int

# Create transparency managers
transparency = create_transparency_manager(
    agent_id="langgraph-example",
    file_path="./logs",
)
sync_transparency = SyncTransparencyManager(transparency)

# Node definitions
def monitor_node(state: AgentState) -> AgentState:
    """Monitor node - checks current state."""
    sync_transparency.log_node_enter(
        "monitor",
        LangGraphNodeType.MONITOR,
        dict(state)
    )

    sync_transparency.log_thinking_step(
        ThinkingPhase.PERCEPTION,
        "Monitoring current state",
        reasoning=f"Checking state: {len(state['messages'])} messages, iteration {state['iterations']}"
    )

    new_state = {
        **state,
        "iterations": state["iterations"] + 1
    }

    sync_transparency.log_node_exit(
        "monitor",
        LangGraphNodeType.MONITOR,
        dict(state),
        new_state
    )

    return new_state

def planner_node(state: AgentState) -> AgentState:
    """Planner node - creates execution plan."""
    start_time = time.time()
    sync_transparency.log_node_enter(
        "planner",
        LangGraphNodeType.PLANNER,
        dict(state)
    )

    sync_transparency.log_thinking_step(
        ThinkingPhase.PLANNING,
        "Creating execution plan",
        reasoning="Analyzing task to determine steps"
    )

    # Simulate planning
    task = state.get("current_task", "default task")
    plan = [
        f"Step 1: Analyze '{task}'",
        f"Step 2: Process '{task}'",
        f"Step 3: Generate result for '{task}'",
    ]

    new_state = {
        **state,
        "plan": plan,
        "messages": [f"Plan created with {len(plan)} steps"]
    }

    duration = int((time.time() - start_time) * 1000)
    sync_transparency.log_node_exit(
        "planner",
        LangGraphNodeType.PLANNER,
        dict(state),
        new_state,
        duration_ms=duration
    )

    return new_state

def executor_node(state: AgentState) -> AgentState:
    """Executor node - executes the plan."""
    start_time = time.time()
    sync_transparency.log_node_enter(
        "executor",
        LangGraphNodeType.EXECUTOR,
        dict(state)
    )

    sync_transparency.log_thinking_step(
        ThinkingPhase.REASONING,
        "Executing plan steps",
        reasoning=f"Processing {len(state.get('plan', []))} steps"
    )

    # Simulate execution
    plan = state.get("plan", [])
    results = [f"Completed: {step}" for step in plan]
    result = " | ".join(results)

    new_state = {
        **state,
        "result": result,
        "messages": [f"Executed {len(plan)} steps"]
    }

    duration = int((time.time() - start_time) * 1000)
    sync_transparency.log_node_exit(
        "executor",
        LangGraphNodeType.EXECUTOR,
        dict(state),
        new_state,
        duration_ms=duration
    )

    return new_state

def responder_node(state: AgentState) -> AgentState:
    """Responder node - generates final response."""
    sync_transparency.log_node_enter(
        "responder",
        LangGraphNodeType.SUMMARIZER,
        dict(state)
    )

    sync_transparency.log_thinking_step(
        ThinkingPhase.SYNTHESIS,
        "Generating final response",
        reasoning="Combining results into user response"
    )

    response = f"Task completed: {state.get('result', 'No result')}"

    new_state = {
        **state,
        "messages": [response]
    }

    sync_transparency.log_node_exit(
        "responder",
        LangGraphNodeType.SUMMARIZER,
        dict(state),
        new_state
    )

    return new_state

def router(state: AgentState) -> str:
    """Route to next node based on state."""
    if state.get("plan") is None:
        next_node = "planner"
        decision = "no_plan"
    elif state.get("result") is None:
        next_node = "executor"
        decision = "has_plan_no_result"
    elif state.get("iterations", 0) >= 3:
        next_node = "responder"
        decision = "max_iterations"
    else:
        next_node = END
        decision = "complete"

    sync_transparency.log_conditional_route(
        from_node="router",
        to_node=next_node,
        route_decision=decision,
        state=dict(state)
    )

    return next_node

def build_graph() -> StateGraph:
    """Build the LangGraph."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("monitor", monitor_node)
    graph.add_node("planner", planner_node)
    graph.add_node("executor", executor_node)
    graph.add_node("responder", responder_node)

    # Set entry point
    graph.set_entry_point("monitor")

    # Add edges
    graph.add_edge("monitor", "planner")

    graph.add_conditional_edges(
        "planner",
        router,
        {
            "executor": "executor",
            "responder": "responder",
            END: END,
        }
    )

    graph.add_conditional_edges(
        "executor",
        router,
        {
            "responder": "responder",
            END: END,
        }
    )

    graph.add_edge("responder", END)

    return graph.compile()

async def run_example():
    """Run the LangGraph example."""
    # Start transparency
    await transparency.start()

    try:
        # Log agent startup
        await transparency.log_agent_startup({
            "graph_type": "example",
            "nodes": ["monitor", "planner", "executor", "responder"]
        })

        # Build graph
        graph = build_graph()

        # Initial state
        initial_state: AgentState = {
            "messages": ["Starting graph execution"],
            "current_task": "Process user request",
            "plan": None,
            "result": None,
            "iterations": 0,
        }

        # Log graph invoke start
        await transparency.log_graph_invoke_start(initial_state)

        start_time = time.time()

        # Run the graph
        final_state = await graph.ainvoke(initial_state)

        duration = int((time.time() - start_time) * 1000)

        # Log graph invoke end
        await transparency.log_graph_invoke_end(
            final_state=dict(final_state),
            duration_ms=duration
        )

        # Log final output
        await transparency.log_output_generated(
            content=final_state.get("result", "No result"),
            target="user"
        )

        print("\nFinal State:")
        print(f"  Messages: {final_state['messages']}")
        print(f"  Result: {final_state['result']}")
        print(f"  Iterations: {final_state['iterations']}")

        # Log agent shutdown
        await transparency.log_agent_shutdown("complete")

    finally:
        await transparency.stop()

    print("\nCheck ./logs/langgraph-example_transparency.jsonl for the full log")

if __name__ == "__main__":
    asyncio.run(run_example())
```

## Running the Example

```bash
python langgraph_example.py
```

## Sample Output

### Console Output

```
[2024-01-10T15:30:45.123Z] [DEBUG] graph.node.enter
  Node: monitor (monitor)
[2024-01-10T15:30:45.124Z] [DEBUG] thinking.step
  Phase: perception - Monitoring current state
[2024-01-10T15:30:45.125Z] [DEBUG] graph.node.exit
  Node: monitor (monitor)
[2024-01-10T15:30:45.126Z] [DEBUG] graph.node.enter
  Node: planner (planner)
[2024-01-10T15:30:45.127Z] [DEBUG] thinking.step
  Phase: planning - Creating execution plan
[2024-01-10T15:30:45.128Z] [DEBUG] graph.node.exit
  Node: planner (planner)
[2024-01-10T15:30:45.129Z] [INFO] graph.conditional.route
  From: router To: executor
...

Final State:
  Messages: ['Task completed: Completed: Step 1... | Completed: Step 2... | Completed: Step 3...']
  Result: Completed: Step 1... | Completed: Step 2... | Completed: Step 3...
  Iterations: 1
```

## Key Patterns

### 1. Sync Wrapper for Nodes

```python
sync_transparency = SyncTransparencyManager(transparency)

def my_node(state):
    sync_transparency.log_node_enter(...)
    # ... node logic ...
    sync_transparency.log_node_exit(...)
```

### 2. Node Enter/Exit Pattern

```python
def planner_node(state):
    start_time = time.time()
    sync_transparency.log_node_enter("planner", LangGraphNodeType.PLANNER, dict(state))

    # ... do work ...

    duration = int((time.time() - start_time) * 1000)
    sync_transparency.log_node_exit("planner", LangGraphNodeType.PLANNER, dict(state), new_state, duration)
```

### 3. Routing Decisions

```python
def router(state) -> str:
    # Determine next node
    next_node = "executor" if condition else END

    # Log the decision
    sync_transparency.log_conditional_route(
        from_node="router",
        to_node=next_node,
        route_decision="condition_met",
        state=dict(state)
    )

    return next_node
```

### 4. Graph Lifecycle

```python
await transparency.log_graph_invoke_start(initial_state)
final_state = await graph.ainvoke(initial_state)
await transparency.log_graph_invoke_end(final_state, duration_ms=duration)
```

## Viewing the Graph Execution

Use the viewer to see the execution flow:

```bash
transparency-viewer --log-path ./logs/langgraph-example_transparency.jsonl
```

## Next Steps

- [LLM Call Tracking](/examples/llm-tracking) - Add LLM calls to nodes
- [Error Handling](/examples/error-handling) - Handle node failures
- [LangGraph Guide](/guide/langgraph-integration) - Detailed guide
