# TransparencyViewerServer

Web-based server for real-time transparency event viewing.

## Overview

The `TransparencyViewerServer` provides:
- HTTP server for the viewer HTML
- WebSocket streaming for real-time events
- File watching or Kafka consumption
- Event buffering and history

## Installation

Requires the `ui` optional dependency:

```bash
pip install agent-transparency[ui]
```

## Class Definition

```python
class TransparencyViewerServer:
    def __init__(self, config: ServerConfig):
```

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `ServerConfig` | Server configuration |

## Methods

### start

```python
async def start(self) -> None:
```

Start the viewer server. This method:
1. Sets up HTTP routes
2. Starts WebSocket handling
3. Begins file watching or Kafka consuming
4. Runs until stopped

**Example:**
```python
server = TransparencyViewerServer(config)
await server.start()
```

## Configuration

### ServerConfig

```python
@dataclass
class ServerConfig:
    port: int = 8765
    host: str = "0.0.0.0"
    source_type: SourceType = SourceType.FILE
    log_path: Optional[str] = None
    kafka_bootstrap: Optional[str] = None
    kafka_topic: Optional[str] = None
    kafka_group_id: str = "transparency-viewer"
```

### File Source Configuration

```python
from transparency import ServerConfig, SourceType

config = ServerConfig(
    port=8765,
    host="0.0.0.0",
    source_type=SourceType.FILE,
    log_path="./logs/agent_transparency.jsonl",
)

server = TransparencyViewerServer(config)
await server.start()
```

### Kafka Source Configuration

```python
config = ServerConfig(
    port=8765,
    source_type=SourceType.KAFKA,
    kafka_bootstrap="localhost:9092",
    kafka_topic="agent.my-agent.transparency",
    kafka_group_id="viewer-unique-id",
)

server = TransparencyViewerServer(config)
await server.start()
```

## HTTP Endpoints

### GET /

Redirects to `/viewer.html`.

### GET /viewer.html

Serves the viewer HTML page.

### GET /api/events

Returns buffered events as JSON.

**Response:**
```json
[
    {"event_type": "input.received", ...},
    {"event_type": "thinking.step", ...}
]
```

### GET /ws

WebSocket endpoint for real-time streaming.

## WebSocket Protocol

### Connecting

```javascript
const ws = new WebSocket('ws://localhost:8765/ws');

ws.onopen = () => {
    console.log('Connected');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Event:', data);
};
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
        "description": "Analyzing request"
    }
}
```

### Client Commands

#### Get History

```javascript
ws.send(JSON.stringify({
    action: 'get_history',
    limit: 100
}));

// Response
{
    "type": "history",
    "events": [...]
}
```

#### Subscribe to Topic

```javascript
ws.send(JSON.stringify({
    action: 'subscribe',
    topic: 'new-topic'
}));
```

## Properties

### websockets

```python
websockets: Set[web.WebSocketResponse]
```

Set of connected WebSocket clients.

### event_buffer

```python
event_buffer: list
```

Buffered events (limited by `max_buffer_size`).

### max_buffer_size

```python
max_buffer_size: int = 1000
```

Maximum events to buffer.

## Usage Examples

### Basic Usage

```python
import asyncio
from transparency import TransparencyViewerServer, ServerConfig, SourceType

async def main():
    config = ServerConfig(
        port=8765,
        source_type=SourceType.FILE,
        log_path="./logs/agent_transparency.jsonl"
    )

    server = TransparencyViewerServer(config)
    await server.start()

asyncio.run(main())
```

### With Agent

```python
async def main():
    # Create transparency manager
    transparency = create_transparency_manager(
        agent_id="my-agent",
        file_path="./logs",
    )
    await transparency.start()

    # Start viewer
    viewer_config = ServerConfig(
        port=8765,
        source_type=SourceType.FILE,
        log_path="./logs/my-agent_transparency.jsonl"
    )
    viewer = TransparencyViewerServer(viewer_config)
    viewer_task = asyncio.create_task(viewer.start())

    try:
        # Run agent
        await run_my_agent(transparency)
    finally:
        await transparency.stop()

asyncio.run(main())
```

### CLI Usage

The library includes a CLI command:

```bash
# Basic usage
transparency-viewer --log-path ./logs/agent.jsonl

# Custom port
transparency-viewer --log-path ./logs/agent.jsonl --port 8080

# Kafka source
transparency-viewer \
    --kafka-bootstrap localhost:9092 \
    --kafka-topic agent.transparency
```

## CLI Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--port` | `8765` | Server port |
| `--host` | `0.0.0.0` | Server host |
| `--log-path` | auto | Path to JSONL file |
| `--kafka-bootstrap` | - | Kafka servers |
| `--kafka-topic` | - | Kafka topic |
| `--kafka-group-id` | auto | Consumer group ID |

## Error Handling

### Missing aiohttp

```python
if not AIOHTTP_AVAILABLE:
    print("Error: aiohttp is required")
    print("Install with: pip install agent-transparency[ui]")
```

### File Not Found

The server will wait for the file to be created if it doesn't exist.

### Kafka Connection Issues

```python
try:
    await consumer.start()
except Exception as e:
    print(f"Kafka error: {e}")
```

## See Also

- [Real-time Viewer Guide](/guide/viewer) - Usage patterns
- [Kafka Streaming](/guide/kafka-streaming) - Kafka integration
- [Configuration](/api/configuration) - ServerConfig details
