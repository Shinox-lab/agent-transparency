# Real-time Viewer

Agent Transparency includes a web-based viewer for monitoring agent activity in real-time.

## Overview

The viewer provides:
- **Real-time streaming**: Watch events as they happen
- **Event filtering**: Focus on specific event types
- **Color-coded display**: Quickly identify event severity
- **WebSocket updates**: Instant event delivery
- **Historical data**: Load existing logs on startup

## Installation

The viewer requires the `ui` optional dependency:

```bash
pip install agent-transparency[ui]
```

## Quick Start

### Using the CLI

Start the viewer from command line:

```bash
# Watch a log file
transparency-viewer --log-path ./logs/my-agent_transparency.jsonl

# Custom port
transparency-viewer --log-path ./logs/agent.jsonl --port 8080

# Watch from Kafka
transparency-viewer --kafka-bootstrap localhost:9092 --kafka-topic agent.my-agent.transparency
```

Then open `http://localhost:8765` in your browser.

### Programmatic Usage

Start the viewer from your Python code:

```python
import asyncio
from transparency import TransparencyViewerServer, ServerConfig, SourceType

async def main():
    config = ServerConfig(
        port=8765,
        host="0.0.0.0",
        source_type=SourceType.FILE,
        log_path="./logs/my-agent_transparency.jsonl"
    )

    server = TransparencyViewerServer(config)
    await server.start()

if __name__ == "__main__":
    asyncio.run(main())
```

## Configuration

### ServerConfig Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `int` | `8765` | Server port |
| `host` | `str` | `"0.0.0.0"` | Server host |
| `source_type` | `SourceType` | `FILE` | Event source type |
| `log_path` | `str` | `None` | Path to JSONL log file |
| `kafka_bootstrap` | `str` | `None` | Kafka bootstrap servers |
| `kafka_topic` | `str` | `None` | Kafka topic to consume |
| `kafka_group_id` | `str` | `"transparency-viewer"` | Kafka consumer group |

### File Source

Watch a JSONL log file for new events:

```python
config = ServerConfig(
    source_type=SourceType.FILE,
    log_path="./logs/agent_transparency.jsonl"
)
```

The viewer will:
1. Load all existing events from the file
2. Watch for new events as they're written
3. Stream updates to connected browsers

### Kafka Source

Consume events from Kafka:

```python
config = ServerConfig(
    source_type=SourceType.KAFKA,
    kafka_bootstrap="localhost:9092",
    kafka_topic="agent.my-agent.transparency",
    kafka_group_id="viewer-unique-id"  # Use unique ID for fresh view
)
```

## Viewer Interface

### Event Display

Events are displayed with:
- **Timestamp**: When the event occurred
- **Event Type**: Color-coded by category
- **Severity**: Visual indication of importance
- **Payload Summary**: Key information from the event

### Color Coding

| Color | Severity |
|-------|----------|
| Gray | TRACE |
| Cyan | DEBUG |
| Green | INFO |
| Yellow | WARNING |
| Red | ERROR |
| Magenta | CRITICAL |

### Event Categories

Events are grouped by category:
- **Lifecycle**: Agent start/stop
- **Input**: Received messages
- **Thinking**: Reasoning steps
- **LangGraph**: Graph execution
- **LLM**: Language model calls
- **Output**: Generated responses
- **Error**: Problems encountered

## WebSocket API

The viewer uses WebSocket for real-time updates. You can connect your own clients:

### Connecting

```javascript
const ws = new WebSocket('ws://localhost:8765/ws');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Event:', data);
};
```

### Available Commands

Send commands to the server:

```javascript
// Get historical events
ws.send(JSON.stringify({
    action: 'get_history',
    limit: 100
}));

// Subscribe to topic (for Kafka switching)
ws.send(JSON.stringify({
    action: 'subscribe',
    topic: 'new-topic'
}));
```

### Event Format

Events are sent as JSON:

```json
{
    "event_type": "thinking.step",
    "metadata": {
        "event_id": "...",
        "timestamp": "2024-01-10T15:30:45.123456Z",
        "agent_id": "my-agent",
        "severity": "debug"
    },
    "payload": {
        "phase": "analysis",
        "description": "Analyzing user request"
    }
}
```

## REST API

The viewer also provides REST endpoints:

### Get Events

```bash
# Get all buffered events
curl http://localhost:8765/api/events
```

Response:
```json
[
    {"event_type": "input.received", ...},
    {"event_type": "thinking.step", ...}
]
```

## Running with Your Agent

### Side by Side

Run the viewer alongside your agent:

```python
import asyncio
from transparency import (
    create_transparency_manager,
    TransparencyViewerServer,
    ServerConfig,
    SourceType,
)

async def main():
    # Create transparency manager
    transparency = create_transparency_manager(
        agent_id="my-agent",
        file_path="./logs",
    )
    await transparency.start()

    # Start viewer in background
    viewer_config = ServerConfig(
        port=8765,
        source_type=SourceType.FILE,
        log_path="./logs/my-agent_transparency.jsonl"
    )
    viewer = TransparencyViewerServer(viewer_config)
    viewer_task = asyncio.create_task(viewer.start())

    try:
        # Run your agent
        await run_my_agent(transparency)
    finally:
        await transparency.stop()

if __name__ == "__main__":
    asyncio.run(main())
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  agent:
    build: .
    volumes:
      - ./logs:/app/logs
    environment:
      - TRANSPARENCY_LOG_PATH=/app/logs

  viewer:
    image: python:3.12
    command: transparency-viewer --log-path /logs/agent_transparency.jsonl
    volumes:
      - ./logs:/logs
    ports:
      - "8765:8765"
    depends_on:
      - agent
```

## Customizing the Viewer

### Custom HTML

The viewer serves `viewer.html` from the package directory. You can override it:

```python
from pathlib import Path

# Copy and customize the default viewer
viewer_html = Path(__file__).parent / "custom_viewer.html"

# The server will serve files from its directory
# Place your custom viewer.html there
```

### Custom Styling

Modify the viewer's CSS for your branding:

```html
<style>
    /* Override default colors */
    .event-info { border-left: 3px solid #your-brand-color; }
    .event-error { background-color: #your-error-bg; }
</style>
```

## Performance Considerations

### Buffer Size

The viewer maintains an in-memory buffer of recent events:

```python
server = TransparencyViewerServer(config)
server.max_buffer_size = 2000  # Keep last 2000 events
```

### File Polling

File watching polls every 500ms by default. For high-volume logs, consider using Kafka instead.

### Multiple Clients

The viewer supports multiple simultaneous WebSocket connections. Events are broadcast to all connected clients.

## Troubleshooting

### Viewer Won't Start

Check if aiohttp is installed:
```bash
pip install agent-transparency[ui]
```

### No Events Appearing

1. Verify the log file path is correct
2. Check that events are being written to the file
3. Ensure the file is in JSONL format

### WebSocket Disconnecting

- Check for network issues
- Verify the server is still running
- Check server logs for errors

## Next Steps

- [Kafka Streaming](/guide/kafka-streaming) - Stream events to Kafka
- [Configuration](/guide/configuration) - Configure the transparency manager
- [Examples](/examples/) - See viewer in action
