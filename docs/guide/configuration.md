# Configuration

Agent Transparency provides flexible configuration options to customize logging behavior, output destinations, and performance settings.

## TransparencyConfig

The `TransparencyConfig` dataclass contains all configuration options:

```python
from transparency import TransparencyConfig, OutputDestination, Severity

config = TransparencyConfig(
    # Enable/disable transparency
    enabled=True,

    # Output destinations
    destinations=[
        OutputDestination.FILE,
        OutputDestination.CONSOLE,
    ],

    # File settings
    file_path="./transparency_logs",
    file_rotation_size_mb=10,
    file_retention_days=30,

    # Filtering
    min_severity=Severity.DEBUG,
    event_type_filter=[],  # Empty = all events

    # Performance
    buffer_size=100,
    flush_interval_seconds=1.0,
    async_mode=True,

    # Formatting
    pretty_print=True,
    include_stack_traces=True,
)
```

## Configuration Options

### Basic Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `bool` | `True` | Enable or disable all transparency logging |

```python
# Disable transparency in production if needed
config = TransparencyConfig(enabled=False)
```

### Output Destinations

Control where events are written:

| Destination | Description |
|-------------|-------------|
| `FILE` | Write to JSONL files |
| `CONSOLE` | Print to stdout with formatting |
| `KAFKA` | Stream to Kafka topics |
| `WEBHOOK` | Send to HTTP endpoints |
| `MEMORY` | In-memory buffer (for testing) |

```python
from transparency import OutputDestination

# File only
config = TransparencyConfig(
    destinations=[OutputDestination.FILE]
)

# Console only (for development)
config = TransparencyConfig(
    destinations=[OutputDestination.CONSOLE]
)

# Multiple destinations
config = TransparencyConfig(
    destinations=[
        OutputDestination.FILE,
        OutputDestination.CONSOLE,
        OutputDestination.KAFKA,
    ]
)
```

### File Settings

Configure file-based logging:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `file_path` | `str` | `"./transparency_logs"` | Directory for log files |
| `file_rotation_size_mb` | `int` | `10` | Rotate files at this size |
| `file_retention_days` | `int` | `30` | Delete files older than this |

```python
config = TransparencyConfig(
    destinations=[OutputDestination.FILE],
    file_path="/var/log/agent",
    file_rotation_size_mb=50,
    file_retention_days=90,
)
```

Log files are named: `{agent_id}_transparency.jsonl`

### Kafka Settings

Configure Kafka streaming:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `kafka_topic` | `str` | `""` | Kafka topic (default: `agent.{agent_id}.transparency`) |
| `kafka_broker` | `Any` | `None` | KafkaBroker instance |

```python
from aiokafka import AIOKafkaProducer

config = TransparencyConfig(
    destinations=[OutputDestination.KAFKA],
    kafka_broker=producer,
    kafka_topic="agent.events.transparency",
)
```

### Severity Filtering

Filter events by severity level:

| Severity | Level | Description |
|----------|-------|-------------|
| `TRACE` | 0 | Finest-grained debugging |
| `DEBUG` | 1 | Detailed diagnostic info |
| `INFO` | 2 | General information |
| `WARNING` | 3 | Warning messages |
| `ERROR` | 4 | Error events |
| `CRITICAL` | 5 | Critical failures |

```python
from transparency import Severity

# Only log INFO and above (no DEBUG/TRACE)
config = TransparencyConfig(
    min_severity=Severity.INFO
)

# Log everything including TRACE
config = TransparencyConfig(
    min_severity=Severity.TRACE
)

# Only log errors and critical
config = TransparencyConfig(
    min_severity=Severity.ERROR
)
```

### Event Type Filtering

Filter specific event types:

```python
from transparency import EventType

# Only log thinking and LLM events
config = TransparencyConfig(
    event_type_filter=[
        EventType.THINKING_START,
        EventType.THINKING_STEP,
        EventType.THINKING_DECISION,
        EventType.THINKING_END,
        EventType.LLM_REQUEST_START,
        EventType.LLM_RESPONSE_RECEIVED,
    ]
)

# Empty list = log all events (default)
config = TransparencyConfig(
    event_type_filter=[]
)
```

### Performance Settings

Tune performance characteristics:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `buffer_size` | `int` | `100` | Max events to buffer before flush |
| `flush_interval_seconds` | `float` | `1.0` | Time between automatic flushes |
| `async_mode` | `bool` | `True` | Enable async buffering |

```python
# High-throughput settings
config = TransparencyConfig(
    buffer_size=500,
    flush_interval_seconds=0.5,
    async_mode=True,
)

# Low-latency settings (immediate writes)
config = TransparencyConfig(
    buffer_size=1,
    flush_interval_seconds=0.1,
    async_mode=False,  # Synchronous writes
)
```

### Formatting Settings

Control output formatting:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pretty_print` | `bool` | `True` | Format console output nicely |
| `include_stack_traces` | `bool` | `True` | Include stack traces in errors |

```python
# Compact output for production
config = TransparencyConfig(
    pretty_print=False,
    include_stack_traces=False,
)
```

### Privacy Settings

Control data redaction:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `redact_sensitive_data` | `bool` | `False` | Enable sensitive data redaction |
| `sensitive_fields` | `List[str]` | `[]` | Fields to redact |

```python
config = TransparencyConfig(
    redact_sensitive_data=True,
    sensitive_fields=["password", "api_key", "token", "secret"],
)
```

## Using Configuration

### With Factory Function

The easiest way to configure:

```python
from transparency import create_transparency_manager, OutputDestination

transparency = create_transparency_manager(
    agent_id="my-agent",
    file_path="./logs",
    destinations=[OutputDestination.FILE, OutputDestination.CONSOLE],
    enabled=True,
)
```

### With Full Config

For complete control:

```python
from transparency import TransparencyManager, TransparencyConfig

config = TransparencyConfig(
    enabled=True,
    destinations=[OutputDestination.FILE],
    file_path="./logs",
    min_severity=Severity.INFO,
    buffer_size=200,
    flush_interval_seconds=2.0,
)

transparency = TransparencyManager(
    agent_id="my-agent",
    config=config,
)
```

## Environment-Based Configuration

A common pattern is to configure based on environment:

```python
import os
from transparency import (
    TransparencyConfig,
    OutputDestination,
    Severity,
)

def create_config(env: str) -> TransparencyConfig:
    """Create configuration based on environment."""

    if env == "development":
        return TransparencyConfig(
            enabled=True,
            destinations=[OutputDestination.CONSOLE],
            min_severity=Severity.DEBUG,
            pretty_print=True,
        )

    elif env == "staging":
        return TransparencyConfig(
            enabled=True,
            destinations=[OutputDestination.FILE, OutputDestination.CONSOLE],
            min_severity=Severity.DEBUG,
            file_path="./logs",
        )

    elif env == "production":
        return TransparencyConfig(
            enabled=True,
            destinations=[OutputDestination.FILE, OutputDestination.KAFKA],
            min_severity=Severity.INFO,
            file_path="/var/log/agent",
            pretty_print=False,
            include_stack_traces=True,
        )

    else:
        return TransparencyConfig()

# Use in your application
env = os.getenv("ENVIRONMENT", "development")
config = create_config(env)
transparency = TransparencyManager(agent_id="my-agent", config=config)
```

## Runtime Configuration Changes

Some settings can be changed at runtime:

```python
# Disable temporarily
transparency.config.enabled = False

# Re-enable
transparency.config.enabled = True

# Change severity filter
transparency.config.min_severity = Severity.ERROR
```

## Next Steps

- [Context Management](/guide/context-management) - Track related events
- [LangGraph Integration](/guide/langgraph-integration) - Configure for LangGraph
- [API Reference](/api/configuration) - Complete configuration reference
