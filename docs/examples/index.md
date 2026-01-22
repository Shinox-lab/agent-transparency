# Examples

Practical examples demonstrating Agent Transparency in various scenarios.

## Overview

These examples cover common use cases and integration patterns:

| Example | Description |
|---------|-------------|
| [Basic Usage](/examples/basic-usage) | Getting started with transparency logging |
| [LangGraph Integration](/examples/langgraph) | Full LangGraph agent with transparency |
| [LLM Call Tracking](/examples/llm-tracking) | Tracking LLM interactions |
| [Error Handling](/examples/error-handling) | Logging and recovering from errors |
| [Custom Events](/examples/custom-events) | Creating custom event types |

## Quick Examples

### Minimal Setup

```python
from transparency import create_transparency_manager

transparency = create_transparency_manager(agent_id="my-agent")
await transparency.start()

await transparency.log_input_received("Hello!")
await transparency.log_output_generated("Hi there!")

await transparency.stop()
```

### With Context

```python
async with transparency.context_scope(session_id="user-123"):
    await transparency.log_input_received("What's the weather?")
    await transparency.log_thinking_step(
        ThinkingPhase.ANALYSIS,
        "Analyzing weather request"
    )
    await transparency.log_output_generated("It's sunny!")
```

### LangGraph Node

```python
def my_node(state):
    sync_transparency.log_node_enter("my_node", LangGraphNodeType.CUSTOM, state)

    # Process...
    new_state = process(state)

    sync_transparency.log_node_exit("my_node", LangGraphNodeType.CUSTOM, state, new_state)
    return new_state
```

### LLM Tracking

```python
async with transparency.trace_llm_call("gpt-4", prompt) as ctx:
    response = await llm.generate(prompt)
    ctx["response"] = response.text
```

### Error Handling

```python
try:
    result = await risky_operation()
except Exception as e:
    await transparency.log_error(
        error_type="OperationError",
        message=str(e),
        exception=e,
        recoverable=True
    )
```

## Running the Examples

Most examples can be run directly:

```bash
# Clone the repository
git clone https://github.com/Shinox-lab/agent-transparency.git
cd agent-transparency

# Install with dev dependencies
pip install -e ".[dev]"

# Run an example
python examples/basic_usage.py
```

## Viewing Results

After running examples, view the logs:

```bash
# View JSONL output
cat ./transparency_logs/*_transparency.jsonl | jq .

# Use the viewer
transparency-viewer --log-path ./transparency_logs/example-agent_transparency.jsonl
```

## Example Structure

Each example follows this pattern:

1. **Setup**: Create and configure the transparency manager
2. **Execute**: Run the main logic with transparency logging
3. **Cleanup**: Stop the manager and flush events
4. **View**: Examine the generated logs

```python
import asyncio
from transparency import create_transparency_manager

async def main():
    # 1. Setup
    transparency = create_transparency_manager(
        agent_id="example-agent",
        file_path="./logs",
    )
    await transparency.start()

    try:
        # 2. Execute
        await run_example(transparency)

    finally:
        # 3. Cleanup
        await transparency.stop()

    # 4. View (check ./logs/example-agent_transparency.jsonl)

if __name__ == "__main__":
    asyncio.run(main())
```

## Next Steps

- [Basic Usage](/examples/basic-usage) - Start with the fundamentals
- [LangGraph Integration](/examples/langgraph) - Build a complete agent
- [API Reference](/api/) - Detailed API documentation
