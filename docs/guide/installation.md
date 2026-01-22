# Installation

Agent Transparency can be installed with various optional dependencies depending on your needs.

## Requirements

- Python 3.12 or higher

## Basic Installation

Install the core library with no external dependencies:

```bash
pip install agent-transparency
```

This gives you:
- `TransparencyManager` and `SyncTransparencyManager`
- All event types and data classes
- File and console output destinations

## Optional Features

### UI Viewer

Install with the real-time web viewer:

```bash
pip install agent-transparency[ui]
```

Additional dependencies:
- `aiohttp>=3.8.0`

This enables:
- `transparency-viewer` CLI command
- Web-based real-time event viewer
- WebSocket streaming

### Kafka Streaming

Install with Kafka support:

```bash
pip install agent-transparency[kafka]
```

Additional dependencies:
- `aiokafka>=0.8.0`

This enables:
- Streaming events to Kafka topics
- Consuming events from Kafka in the viewer

### All Features

Install with all optional dependencies:

```bash
pip install agent-transparency[all]
```

### Development

Install with development dependencies:

```bash
pip install agent-transparency[dev]
```

Additional dependencies:
- `pytest>=7.0.0`
- `pytest-asyncio>=0.21.0`
- `black>=23.0.0`
- `mypy>=1.0.0`
- `ruff>=0.1.0`

## Installation from Source

Clone the repository and install in development mode:

```bash
git clone https://github.com/Shinox-lab/agent-transparency.git
cd agent-transparency
pip install -e ".[dev]"
```

## Using with uv

If you're using [uv](https://github.com/astral-sh/uv) for package management:

```bash
# Basic installation
uv add agent-transparency

# With optional features
uv add "agent-transparency[ui]"
uv add "agent-transparency[kafka]"
uv add "agent-transparency[all]"
```

## Using with Poetry

If you're using [Poetry](https://python-poetry.org/):

```bash
# Basic installation
poetry add agent-transparency

# With optional features
poetry add agent-transparency -E ui
poetry add agent-transparency -E kafka
poetry add agent-transparency -E all
```

## Verifying Installation

Verify the installation by running:

```python
from transparency import (
    TransparencyManager,
    create_transparency_manager,
    EventType,
    ThinkingPhase,
    __version__,
)

print(f"Agent Transparency version: {__version__}")
print(f"Available event types: {len(EventType)}")
```

## Checking Optional Dependencies

Check which optional features are available:

```python
from transparency import (
    TransparencyViewerServer,
    ServerConfig,
    SourceType,
)

if TransparencyViewerServer is not None:
    print("UI viewer is available")
else:
    print("UI viewer not installed. Install with: pip install agent-transparency[ui]")
```

## Troubleshooting

### Import Errors

If you get import errors, ensure you're using Python 3.12+:

```bash
python --version
```

### Missing Optional Dependencies

If viewer-related features fail:

```bash
pip install agent-transparency[ui]
```

If Kafka features fail:

```bash
pip install agent-transparency[kafka]
```

### Permission Errors

If you get permission errors during installation:

```bash
pip install --user agent-transparency
```

Or use a virtual environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install agent-transparency
```

## Next Steps

- [Getting Started](/guide/getting-started) - Start using the library
- [Configuration](/guide/configuration) - Configure transparency settings
