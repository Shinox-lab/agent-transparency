# Configuration

Configuration classes for Agent Transparency.

## TransparencyConfig

Main configuration class for the transparency system.

### Class Definition

```python
@dataclass
class TransparencyConfig:
    enabled: bool = True
    destinations: List[OutputDestination] = field(
        default_factory=lambda: [OutputDestination.FILE, OutputDestination.CONSOLE]
    )

    # File output settings
    file_path: str = "./transparency_logs"
    file_rotation_size_mb: int = 10
    file_retention_days: int = 30

    # Kafka output settings
    kafka_topic: str = ""
    kafka_broker: Any = None

    # Filtering settings
    min_severity: Severity = Severity.DEBUG
    event_type_filter: List[EventType] = field(default_factory=list)

    # Performance settings
    buffer_size: int = 100
    flush_interval_seconds: float = 1.0
    async_mode: bool = True

    # Privacy settings
    redact_sensitive_data: bool = False
    sensitive_fields: List[str] = field(default_factory=list)

    # Formatting
    pretty_print: bool = True
    include_stack_traces: bool = True
```

### Fields

#### Basic Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | `bool` | `True` | Enable or disable transparency |

#### Output Destinations

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `destinations` | `List[OutputDestination]` | `[FILE, CONSOLE]` | Where to write events |

#### File Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `file_path` | `str` | `"./transparency_logs"` | Directory for log files |
| `file_rotation_size_mb` | `int` | `10` | Rotate at this size (MB) |
| `file_retention_days` | `int` | `30` | Delete files older than this |

#### Kafka Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `kafka_topic` | `str` | `""` | Kafka topic name |
| `kafka_broker` | `Any` | `None` | Kafka producer instance |

#### Filtering Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `min_severity` | `Severity` | `DEBUG` | Minimum severity to log |
| `event_type_filter` | `List[EventType]` | `[]` | Event types to include (empty = all) |

#### Performance Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `buffer_size` | `int` | `100` | Max events to buffer |
| `flush_interval_seconds` | `float` | `1.0` | Seconds between flushes |
| `async_mode` | `bool` | `True` | Enable async buffering |

#### Privacy Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `redact_sensitive_data` | `bool` | `False` | Enable data redaction |
| `sensitive_fields` | `List[str]` | `[]` | Fields to redact |

#### Formatting Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pretty_print` | `bool` | `True` | Format console output |
| `include_stack_traces` | `bool` | `True` | Include traces in errors |

### Examples

#### Development Configuration

```python
config = TransparencyConfig(
    enabled=True,
    destinations=[OutputDestination.CONSOLE],
    min_severity=Severity.DEBUG,
    pretty_print=True,
)
```

#### Production Configuration

```python
config = TransparencyConfig(
    enabled=True,
    destinations=[OutputDestination.FILE, OutputDestination.KAFKA],
    file_path="/var/log/agent",
    min_severity=Severity.INFO,
    pretty_print=False,
    include_stack_traces=True,
    buffer_size=500,
    flush_interval_seconds=0.5,
)
```

#### Minimal Logging

```python
config = TransparencyConfig(
    enabled=True,
    destinations=[OutputDestination.FILE],
    min_severity=Severity.WARNING,
    event_type_filter=[
        EventType.ERROR_OCCURRED,
        EventType.ERROR_FATAL,
        EventType.LLM_ERROR,
    ],
)
```

---

## TransparencyContext

Context for tracking related events.

### Class Definition

```python
@dataclass
class TransparencyContext:
    agent_id: str
    session_id: str = ""
    conversation_id: str = ""
    correlation_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    parent_span_id: Optional[str] = None
    sequence_counter: int = 0
```

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `agent_id` | `str` | required | The agent's identifier |
| `session_id` | `str` | `""` | Session identifier |
| `conversation_id` | `str` | `""` | Conversation identifier |
| `correlation_id` | `str` | auto-generated | Unique correlation ID |
| `parent_span_id` | `str` | `None` | Parent context ID |
| `sequence_counter` | `int` | `0` | Event sequence counter |

### Methods

#### next_sequence

```python
def next_sequence(self) -> int:
```

Get the next sequence number and increment counter.

**Returns:** `int` - The next sequence number

#### create_child_context

```python
def create_child_context(self) -> TransparencyContext:
```

Create a child context for nested operations.

**Returns:** `TransparencyContext` - New child context

### Examples

#### Creating Context

```python
context = TransparencyContext(
    agent_id="my-agent",
    session_id="user-123",
    conversation_id="conv-456",
)
```

#### Using Context

```python
# Set as active
transparency.set_context(context)

# Get next sequence
seq = context.next_sequence()  # 1
seq = context.next_sequence()  # 2
```

#### Child Context

```python
parent = TransparencyContext(agent_id="agent", session_id="session")
child = parent.create_child_context()

# Child inherits parent info and links to it
print(child.parent_span_id)  # parent's correlation_id
```

---

## ServerConfig

Configuration for the transparency viewer server.

### Class Definition

```python
@dataclass
class ServerConfig:
    port: int = 8765
    host: str = "0.0.0.0"
    source_type: SourceType = SourceType.FILE

    # File source config
    log_path: Optional[str] = None

    # Kafka source config
    kafka_bootstrap: Optional[str] = None
    kafka_topic: Optional[str] = None
    kafka_group_id: str = "transparency-viewer"
```

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `port` | `int` | `8765` | Server port |
| `host` | `str` | `"0.0.0.0"` | Server host |
| `source_type` | `SourceType` | `FILE` | Event source type |
| `log_path` | `str` | `None` | Path to JSONL log file |
| `kafka_bootstrap` | `str` | `None` | Kafka bootstrap servers |
| `kafka_topic` | `str` | `None` | Kafka topic to consume |
| `kafka_group_id` | `str` | `"transparency-viewer"` | Kafka consumer group |

### Examples

#### File Source

```python
config = ServerConfig(
    port=8080,
    source_type=SourceType.FILE,
    log_path="./logs/agent_transparency.jsonl",
)
```

#### Kafka Source

```python
config = ServerConfig(
    port=8765,
    source_type=SourceType.KAFKA,
    kafka_bootstrap="localhost:9092",
    kafka_topic="agent.transparency",
    kafka_group_id="viewer-001",
)
```

## See Also

- [Configuration Guide](/guide/configuration) - Usage patterns
- [Enums](/api/enums) - OutputDestination, Severity, SourceType
