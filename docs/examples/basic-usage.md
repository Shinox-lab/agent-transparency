# Basic Usage

A complete example demonstrating fundamental transparency logging.

## Overview

This example shows:
- Creating a transparency manager
- Logging input, thinking, and output events
- Using context for event correlation
- Viewing the generated logs

## Complete Example

```python
import asyncio
from transparency import (
    create_transparency_manager,
    ThinkingPhase,
    OutputDestination,
)

async def process_request(transparency, user_input: str) -> str:
    """Process a user request with full transparency."""

    # Log the input
    await transparency.log_input_received(
        content=user_input,
        source="user",
        content_type="text"
    )

    # Start thinking process
    await transparency.log_thinking_start("Analyzing user request")

    # Perception phase
    await transparency.log_thinking_step(
        phase=ThinkingPhase.PERCEPTION,
        description="Understanding the input",
        reasoning="Parsing user message for intent and entities"
    )

    # Analysis phase
    await transparency.log_thinking_step(
        phase=ThinkingPhase.ANALYSIS,
        description="Analyzing the request",
        reasoning="Determining what action to take",
        considerations=[
            "Request type: question",
            "Topic: general inquiry",
            "Complexity: simple"
        ],
        confidence=0.85
    )

    # Decision phase
    await transparency.log_thinking_decision(
        decision="Generate a helpful response",
        rationale="User asked a straightforward question",
        alternatives=[
            {"option": "Ask for clarification", "reason_rejected": "Request is clear"},
            {"option": "Redirect to help", "reason_rejected": "Can answer directly"}
        ],
        confidence=0.92
    )

    # End thinking
    await transparency.log_thinking_end("Analysis complete, generating response")

    # Generate response
    response = f"I received your message: '{user_input}'. How can I help you today?"

    # Log the output
    await transparency.log_output_generated(
        content=response,
        target="user",
        action_type="response"
    )

    return response

async def main():
    # Create transparency manager with file and console output
    transparency = create_transparency_manager(
        agent_id="basic-example",
        file_path="./transparency_logs",
        destinations=[OutputDestination.FILE, OutputDestination.CONSOLE],
    )

    # Start the manager
    await transparency.start()

    try:
        # Log agent startup
        await transparency.log_agent_startup(
            metadata={"version": "1.0.0", "environment": "development"}
        )

        # Process some requests
        requests = [
            "Hello, how are you?",
            "What can you help me with?",
            "Tell me about AI agents.",
        ]

        for request in requests:
            print(f"\n{'='*50}")
            print(f"Processing: {request}")
            print('='*50)

            # Use context for each request
            async with transparency.context_scope(
                session_id="demo-session",
                conversation_id=f"conv-{requests.index(request)}",
            ):
                response = await process_request(transparency, request)
                print(f"Response: {response}")

        # Log agent shutdown
        await transparency.log_agent_shutdown(reason="demo_complete")

    finally:
        # Stop the manager (flushes remaining events)
        await transparency.stop()

    print("\n" + "="*50)
    print("Check ./transparency_logs/basic-example_transparency.jsonl for the full log")

if __name__ == "__main__":
    asyncio.run(main())
```

## Running the Example

```bash
python basic_usage.py
```

## Sample Output

### Console Output

```
==================================================
Processing: Hello, how are you?
==================================================
[2024-01-10T15:30:45.123456Z] [INFO] input.received
  Content: Hello, how are you?...
[2024-01-10T15:30:45.124456Z] [INFO] thinking.start
  Phase: perception - Analyzing user request
[2024-01-10T15:30:45.125456Z] [DEBUG] thinking.step
  Phase: perception - Understanding the input
[2024-01-10T15:30:45.126456Z] [DEBUG] thinking.step
  Phase: analysis - Analyzing the request
[2024-01-10T15:30:45.127456Z] [INFO] thinking.decision
  Phase: decision - Generate a helpful response
[2024-01-10T15:30:45.128456Z] [INFO] thinking.end
  Phase: synthesis - Analysis complete, generating response
[2024-01-10T15:30:45.129456Z] [INFO] output.generated
  Content: I received your message...
Response: I received your message: 'Hello, how are you?'. How can I help you today?
```

### JSONL Output

```json
{"event_type": "agent.startup", "metadata": {"event_id": "...", "timestamp": "2024-01-10T15:30:45.000000Z", "agent_id": "basic-example", "sequence_number": 1, "severity": "info"}, "payload": {"version": "1.0.0", "environment": "development"}}
{"event_type": "input.received", "metadata": {"event_id": "...", "timestamp": "2024-01-10T15:30:45.123456Z", "agent_id": "basic-example", "session_id": "demo-session", "conversation_id": "conv-0", "sequence_number": 2, "severity": "info"}, "payload": {"raw_content": "Hello, how are you?", "content_type": "text", "source": "user"}}
{"event_type": "thinking.start", "metadata": {...}, "payload": {"phase": "perception", "description": "Analyzing user request"}}
{"event_type": "thinking.step", "metadata": {...}, "payload": {"phase": "perception", "description": "Understanding the input", "reasoning": "Parsing user message for intent and entities"}}
{"event_type": "thinking.step", "metadata": {...}, "payload": {"phase": "analysis", "description": "Analyzing the request", "reasoning": "Determining what action to take", "considerations": ["Request type: question", "Topic: general inquiry", "Complexity: simple"], "confidence_score": 0.85}}
{"event_type": "thinking.decision", "metadata": {...}, "payload": {"phase": "decision", "description": "Generate a helpful response", "decision_rationale": "User asked a straightforward question", "alternatives_evaluated": [...], "confidence_score": 0.92}}
{"event_type": "thinking.end", "metadata": {...}, "payload": {"phase": "synthesis", "description": "Analysis complete, generating response"}}
{"event_type": "output.generated", "metadata": {...}, "payload": {"content": "I received your message: 'Hello, how are you?'. How can I help you today?", "target": "user", "action_type": "response"}}
```

## Viewing in Real-time

Start the viewer to see events as they happen:

```bash
# In one terminal, start the viewer
transparency-viewer --log-path ./transparency_logs/basic-example_transparency.jsonl

# In another terminal, run the example
python basic_usage.py
```

## Key Concepts Demonstrated

### 1. Manager Lifecycle

```python
transparency = create_transparency_manager(...)
await transparency.start()  # Enable buffering
# ... do work ...
await transparency.stop()   # Flush and cleanup
```

### 2. Context Correlation

```python
async with transparency.context_scope(
    session_id="demo-session",
    conversation_id="conv-0",
):
    # All events here share the same context
    await transparency.log_input_received(...)
```

### 3. Thinking Process

```python
await transparency.log_thinking_start(...)
await transparency.log_thinking_step(phase=ThinkingPhase.PERCEPTION, ...)
await transparency.log_thinking_step(phase=ThinkingPhase.ANALYSIS, ...)
await transparency.log_thinking_decision(...)
await transparency.log_thinking_end(...)
```

### 4. Multiple Destinations

```python
destinations=[OutputDestination.FILE, OutputDestination.CONSOLE]
```

## Next Steps

- [LangGraph Integration](/examples/langgraph) - Build a complete agent
- [LLM Call Tracking](/examples/llm-tracking) - Track LLM interactions
- [Error Handling](/examples/error-handling) - Handle and log errors
