# Getting Started

This guide will walk you through your first steps with Agent Transparency.

## Installation

Install the core library:

```bash
pip install agent-transparency
```

For additional features:

```bash
# With real-time viewer support
pip install agent-transparency[ui]

# With Kafka streaming support
pip install agent-transparency[kafka]

# All optional features
pip install agent-transparency[all]
```

## Basic Usage

### Creating a Transparency Manager

The `TransparencyManager` is the central class for logging events:

```python
from transparency import create_transparency_manager

# Create a manager with default settings
transparency = create_transparency_manager(
    agent_id="my-agent",
    file_path="./logs",
)
```

### Starting and Stopping

Always start the manager before logging events, and stop it when done:

```python
import asyncio

async def main():
    # Start the manager (enables background flushing)
    await transparency.start()

    try:
        # Your agent logic here
        await run_agent()
    finally:
        # Stop and flush remaining events
        await transparency.stop()

asyncio.run(main())
```

### Logging Events

Log events using the built-in methods:

```python
from transparency import ThinkingPhase

# Log input
await transparency.log_input_received(
    "What's the weather in San Francisco?",
    source="user"
)

# Log thinking
await transparency.log_thinking_step(
    phase=ThinkingPhase.ANALYSIS,
    description="Analyzing user request",
    reasoning="User wants current weather data for a specific location"
)

# Log decisions
await transparency.log_thinking_decision(
    decision="Use OpenWeatherMap API",
    rationale="Most reliable source with current conditions",
    confidence=0.95
)

# Log output
await transparency.log_output_generated(
    "The weather in San Francisco is 68°F and sunny.",
    target="user"
)
```

## Complete Example

Here's a complete example putting it all together:

```python
import asyncio
from transparency import (
    create_transparency_manager,
    ThinkingPhase,
)

async def process_user_request(transparency, user_input: str):
    """Process a user request with full transparency."""

    # Log the input
    await transparency.log_input_received(user_input, source="user")

    # Start thinking
    await transparency.log_thinking_start("Processing user request")

    # Analyze the request
    await transparency.log_thinking_step(
        phase=ThinkingPhase.ANALYSIS,
        description="Understanding user intent",
        reasoning="Extracting key information from the query"
    )

    # Make a decision
    await transparency.log_thinking_decision(
        decision="Provide weather information",
        rationale="User is asking about weather conditions",
        confidence=0.9
    )

    # Generate response
    response = "Based on my analysis, here's the information you requested."

    # Log the output
    await transparency.log_output_generated(response, target="user")

    # End thinking
    await transparency.log_thinking_end("Request processing complete")

    return response

async def main():
    # Create and start the transparency manager
    transparency = create_transparency_manager(
        agent_id="weather-agent",
        file_path="./transparency_logs",
    )
    await transparency.start()

    try:
        # Process a request
        result = await process_user_request(
            transparency,
            "What's the weather like today?"
        )
        print(f"Response: {result}")
    finally:
        # Stop the manager
        await transparency.stop()

if __name__ == "__main__":
    asyncio.run(main())
```

## Viewing the Logs

After running your agent, check the generated log file:

```bash
cat ./transparency_logs/weather-agent_transparency.jsonl
```

You'll see JSONL output like:

```json
{"event_type": "input.received", "metadata": {...}, "payload": {"raw_content": "What's the weather like today?", ...}}
{"event_type": "thinking.start", "metadata": {...}, "payload": {"phase": "perception", ...}}
{"event_type": "thinking.step", "metadata": {...}, "payload": {"phase": "analysis", ...}}
{"event_type": "thinking.decision", "metadata": {...}, "payload": {"description": "Provide weather information", ...}}
{"event_type": "output.generated", "metadata": {...}, "payload": {"content": "Based on my analysis...", ...}}
{"event_type": "thinking.end", "metadata": {...}, "payload": {"phase": "synthesis", ...}}
```

## Using the Real-time Viewer

For a better visualization experience, use the built-in viewer:

```bash
# Install with UI support
pip install agent-transparency[ui]

# Start the viewer
transparency-viewer --log-path ./transparency_logs/weather-agent_transparency.jsonl
```

Open `http://localhost:8765` in your browser to see events in real-time.

## Next Steps

- [Installation](/guide/installation) - Detailed installation options
- [Event Types](/guide/event-types) - Learn about all event types
- [Configuration](/guide/configuration) - Configure the transparency manager
- [LangGraph Integration](/guide/langgraph-integration) - Use with LangGraph
