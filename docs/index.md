---
layout: home

hero:
  name: Agent Transparency
  text: Complete visibility into AI agent behavior
  tagline: A comprehensive Python library for tracking the input, thought process, and output of AI agents
  image:
    src: /hero-image.svg
    alt: Agent Transparency
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Shinox-lab/agent-transparency

features:
  - icon:
      src: /icons/tracking.svg
    title: Comprehensive Event Tracking
    details: Log inputs, thinking processes, LLM calls, graph executions, outputs, and errors with fine-grained control.
  - icon:
      src: /icons/destinations.svg
    title: Multiple Output Destinations
    details: Write to files (JSONL), console, or Kafka streams. Easily extend to custom destinations.
  - icon:
      src: /icons/langgraph.svg
    title: LangGraph Integration
    details: Built-in support for tracking LangGraph node executions, state transitions, and routing decisions.
  - icon:
      src: /icons/async.svg
    title: Async & Sync APIs
    details: Both asynchronous and synchronous interfaces for maximum flexibility in any codebase.
  - icon:
      src: /icons/context.svg
    title: Context Management
    details: Track related events across sessions and conversations with correlation IDs.
  - icon:
      src: /icons/viewer.svg
    title: Real-time Viewer
    details: Optional web-based viewer for monitoring agent activity in real-time via WebSocket.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe50 50%, #47caff50 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## Quick Start

Install the library:

```bash
pip install agent-transparency
```

Start tracking your agent:

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

await transparency.log_output_generated(
    "The weather is sunny, 72°F",
    target="user"
)

# Stop when done
await transparency.stop()
```

## Why Agent Transparency?

Building reliable AI agents requires understanding what they're doing and why. Agent Transparency provides:

- **Debugging**: Trace exactly what happened during agent execution
- **Auditing**: Maintain complete logs for compliance and review
- **Understanding**: Visualize agent decision-making in real-time
- **Optimization**: Identify bottlenecks and optimize performance

## Output Format

Events are logged in JSONL format for easy parsing:

```json
{
  "event_type": "thinking.step",
  "metadata": {
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-10T15:30:45.123456Z",
    "agent_id": "my-agent",
    "session_id": "session-123",
    "sequence_number": 42,
    "severity": "debug"
  },
  "payload": {
    "phase": "analysis",
    "description": "Analyzing user request",
    "confidence_score": 0.95
  }
}
```

## Requirements

- Python 3.12+
- Core: No external dependencies
- UI Viewer: `aiohttp>=3.8.0`
- Kafka: `aiokafka>=0.8.0`
