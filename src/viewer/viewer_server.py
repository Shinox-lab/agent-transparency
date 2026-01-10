"""
Transparency Viewer Server

A lightweight server that:
1. Serves the HTML viewer
2. Provides WebSocket streaming from Kafka or file watching
3. Supports real-time event display

Usage:
    # File watching mode (default)
    python viewer_server.py --log-path ./transparency_logs/agent-squad-lead-01_transparency.jsonl

    # Kafka mode
    python viewer_server.py --kafka-bootstrap localhost:9092 --kafka-topic agent.squad-lead.transparency

    # Custom port
    python viewer_server.py --port 8080
"""

import argparse
import asyncio
import json
import uuid
from pathlib import Path
from typing import Optional, Set
from dataclasses import dataclass
from enum import Enum as PyEnum

try:
    from aiohttp import web
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False

try:
    from aiokafka import AIOKafkaConsumer
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False


class SourceType(PyEnum):
    FILE = "file"
    KAFKA = "kafka"


@dataclass
class ServerConfig:
    """Configuration for the viewer server."""
    port: int = 8765
    host: str = "0.0.0.0"
    source_type: SourceType = SourceType.FILE

    # File source config
    log_path: Optional[str] = None

    # Kafka source config
    kafka_bootstrap: Optional[str] = None
    kafka_topic: Optional[str] = None
    kafka_group_id: str = "transparency-viewer"


class TransparencyViewerServer:
    """
    HTTP + WebSocket server for the transparency viewer.

    Serves the HTML viewer and streams events via WebSocket.
    """

    def __init__(self, config: ServerConfig):
        self.config = config
        self.websockets: Set[web.WebSocketResponse] = set()
        self.event_buffer: list = []
        self.max_buffer_size = 1000
        self._running = False
        self._file_position = 0

    async def start(self):
        """Start the server."""
        if not AIOHTTP_AVAILABLE:
            print("Error: aiohttp is required. Install with: pip install aiohttp")
            return

        app = web.Application()
        app.router.add_get('/', self.handle_index)
        app.router.add_get('/viewer.html', self.handle_viewer)
        app.router.add_get('/ws', self.handle_websocket)
        app.router.add_get('/api/events', self.handle_get_events)
        app.router.add_static('/static/', Path(__file__).parent)

        runner = web.AppRunner(app)
        await runner.setup()

        site = web.TCPSite(runner, self.config.host, self.config.port)
        await site.start()

        self._running = True
        print(f"Transparency Viewer Server running at http://{self.config.host}:{self.config.port}")
        print(f"Open http://localhost:{self.config.port} in your browser")

        # Start the event source
        if self.config.source_type == SourceType.FILE:
            asyncio.create_task(self._watch_file())
        elif self.config.source_type == SourceType.KAFKA:
            asyncio.create_task(self._consume_kafka())

        # Keep running
        while self._running:
            await asyncio.sleep(1)

    async def handle_index(self, _request: web.Request) -> web.Response:
        """Redirect to viewer."""
        raise web.HTTPFound('/viewer.html')

    async def handle_viewer(self, _request: web.Request) -> web.Response:
        """Serve the viewer HTML."""
        viewer_path = Path(__file__).parent / 'viewer.html'
        if viewer_path.exists():
            return web.FileResponse(viewer_path)
        return web.Response(text="Viewer not found", status=404)

    async def handle_get_events(self, _request: web.Request) -> web.Response:
        """Return buffered events as JSON."""
        return web.json_response(self.event_buffer)

    async def handle_websocket(self, request: web.Request) -> web.WebSocketResponse:
        """Handle WebSocket connections."""
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        self.websockets.add(ws)
        print(f"WebSocket client connected. Total: {len(self.websockets)}")

        # Send buffered events
        for event in self.event_buffer:
            await ws.send_json(event)

        try:
            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    data = json.loads(msg.data)
                    await self._handle_ws_message(ws, data)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    print(f"WebSocket error: {ws.exception()}")
        finally:
            self.websockets.discard(ws)
            print(f"WebSocket client disconnected. Total: {len(self.websockets)}")

        return ws

    async def _handle_ws_message(self, ws: web.WebSocketResponse, data: dict):
        """Handle incoming WebSocket messages."""
        action = data.get('action')

        if action == 'subscribe':
            # Client subscribing to a topic (for Kafka switching)
            topic = data.get('topic')
            print(f"Client subscribed to topic: {topic}")

        elif action == 'get_history':
            # Client requesting historical events
            limit = data.get('limit', 100)
            events = self.event_buffer[-limit:]
            await ws.send_json({'type': 'history', 'events': events})

    async def _broadcast(self, event: dict):
        """Broadcast an event to all connected WebSocket clients."""
        if not self.websockets:
            return

        # Buffer the event
        self.event_buffer.append(event)
        if len(self.event_buffer) > self.max_buffer_size:
            self.event_buffer = self.event_buffer[-self.max_buffer_size:]

        # Broadcast to all clients
        dead_sockets = set()
        for ws in self.websockets:
            try:
                await ws.send_json(event)
            except Exception:
                dead_sockets.add(ws)

        # Clean up dead connections
        self.websockets -= dead_sockets

    async def _watch_file(self):
        """Watch a JSONL file for new events."""
        if not self.config.log_path:
            print("No log path specified for file watching")
            return

        log_path = Path(self.config.log_path)

        # Load existing events
        if log_path.exists():
            print(f"Loading existing events from {log_path}")
            with open(log_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            event = json.loads(line)
                            self.event_buffer.append(event)
                        except json.JSONDecodeError:
                            pass
                self._file_position = f.tell()

            print(f"Loaded {len(self.event_buffer)} existing events")

        # Watch for new events
        print(f"Watching for new events in {log_path}")
        while self._running:
            try:
                if log_path.exists():
                    with open(log_path, 'r') as f:
                        f.seek(self._file_position)
                        for line in f:
                            line = line.strip()
                            if line:
                                try:
                                    event = json.loads(line)
                                    await self._broadcast(event)
                                except json.JSONDecodeError:
                                    pass
                        self._file_position = f.tell()
            except Exception as e:
                print(f"Error watching file: {e}")

            await asyncio.sleep(0.5)  # Poll every 500ms

    async def _consume_kafka(self):
        """Consume events from Kafka."""
        if not KAFKA_AVAILABLE:
            print("Error: aiokafka is required for Kafka support. Install with: pip install aiokafka")
            return

        if not self.config.kafka_bootstrap or not self.config.kafka_topic:
            print("Kafka bootstrap servers and topic are required")
            return

        print(f"Connecting to Kafka at {self.config.kafka_bootstrap}")
        print(f"Subscribing to topic: {self.config.kafka_topic}")

        consumer = AIOKafkaConsumer(
            self.config.kafka_topic,
            bootstrap_servers=self.config.kafka_bootstrap,
            group_id=self.config.kafka_group_id,
            auto_offset_reset='earliest',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )

        try:
            await consumer.start()
            print("Connected to Kafka")

            async for message in consumer:
                if not self._running:
                    break
                await self._broadcast(message.value)

        except Exception as e:
            print(f"Kafka error: {e}")
        finally:
            await consumer.stop()


def main():
    parser = argparse.ArgumentParser(description='Transparency Viewer Server')
    parser.add_argument('--port', type=int, default=8765, help='Server port (default: 8765)')
    parser.add_argument('--host', default='0.0.0.0', help='Server host (default: 0.0.0.0)')

    # File source
    parser.add_argument('--log-path', help='Path to JSONL log file to watch')

    # Kafka source
    parser.add_argument('--kafka-bootstrap', help='Kafka bootstrap servers (e.g., localhost:9092)')
    parser.add_argument('--kafka-topic', help='Kafka topic to consume')
    parser.add_argument('--kafka-group-id', help='Kafka consumer group ID (default: random for fresh view)')

    args = parser.parse_args()
    
    # Test if aiohttp is available, if not then tell user to install [ui] falvour as "uv add transparency-viewer[ui]"
    if not AIOHTTP_AVAILABLE:
        print("Error: aiohttp is required. Install with: pip install aiohttp")
        return

    # Generate random group ID if not specified to ensure we read from start
    if not args.kafka_group_id:
        args.kafka_group_id = f"transparency-viewer-{uuid.uuid4().hex[:8]}"
        print(f"Using ephemeral consumer group: {args.kafka_group_id}")

    # Determine source type
    if args.kafka_bootstrap and args.kafka_topic:
        source_type = SourceType.KAFKA
    else:
        source_type = SourceType.FILE
        # Default log path if not specified
        if not args.log_path:
            # Look for transparency_logs in current directory
            default_path = Path.cwd() / 'transparency_logs'
            jsonl_files = list(default_path.glob('*.jsonl')) if default_path.exists() else []
            
            if jsonl_files:
                args.log_path = str(jsonl_files[0])
                print(f"Using default log path: {args.log_path}")
            else:
                print(f"No log files found in {default_path}. Specify --log-path or create transparency logs first.")
                return

    config = ServerConfig(
        port=args.port,
        host=args.host,
        source_type=source_type,
        log_path=args.log_path,
        kafka_bootstrap=args.kafka_bootstrap,
        kafka_topic=args.kafka_topic,
        kafka_group_id=args.kafka_group_id
    )

    server = TransparencyViewerServer(config)

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\nShutting down...")


if __name__ == '__main__':
    main()
