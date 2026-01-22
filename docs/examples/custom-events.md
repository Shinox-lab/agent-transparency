# Custom Events

Create and log custom event types for domain-specific tracking.

## Overview

This example demonstrates:
- Using the generic `log_event` method
- Creating custom payloads
- Using custom tags for filtering
- Building domain-specific logging helpers

## Complete Example

```python
import asyncio
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from transparency import (
    create_transparency_manager,
    EventType,
    Severity,
)

# Custom payload classes
@dataclass
class ToolCallEvent:
    """Custom event for tool/function calls."""
    tool_name: str
    arguments: Dict[str, Any] = field(default_factory=dict)
    result: Optional[str] = None
    duration_ms: Optional[int] = None
    success: bool = True
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "arguments": self.arguments,
            "result": self.result,
            "duration_ms": self.duration_ms,
            "success": self.success,
            "error": self.error,
        }

@dataclass
class RAGEvent:
    """Custom event for RAG operations."""
    query: str
    documents_retrieved: int = 0
    top_chunks: List[str] = field(default_factory=list)
    relevance_scores: List[float] = field(default_factory=list)
    duration_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "documents_retrieved": self.documents_retrieved,
            "top_chunks": self.top_chunks,
            "relevance_scores": self.relevance_scores,
            "duration_ms": self.duration_ms,
        }

@dataclass
class MemoryEvent:
    """Custom event for memory operations."""
    operation: str  # "store", "retrieve", "forget"
    memory_type: str  # "short_term", "long_term", "episodic"
    key: Optional[str] = None
    content_preview: Optional[str] = None
    success: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "operation": self.operation,
            "memory_type": self.memory_type,
            "key": self.key,
            "content_preview": self.content_preview,
            "success": self.success,
        }

# Custom logging helpers
class ExtendedTransparency:
    """Extended transparency with custom event methods."""

    def __init__(self, transparency):
        self.transparency = transparency

    async def log_tool_call(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        result: Optional[str] = None,
        duration_ms: Optional[int] = None,
        success: bool = True,
        error: Optional[str] = None,
    ):
        """Log a tool/function call."""
        event = ToolCallEvent(
            tool_name=tool_name,
            arguments=arguments,
            result=result,
            duration_ms=duration_ms,
            success=success,
            error=error,
        )

        await self.transparency.log_event(
            EventType.DEBUG_LOG,  # Using DEBUG_LOG for custom events
            event.to_dict(),
            severity=Severity.INFO if success else Severity.ERROR,
            tags=["tool", tool_name, "success" if success else "error"],
        )

    async def log_rag_retrieval(
        self,
        query: str,
        documents_retrieved: int,
        top_chunks: List[str],
        relevance_scores: List[float],
        duration_ms: Optional[int] = None,
    ):
        """Log a RAG retrieval operation."""
        event = RAGEvent(
            query=query,
            documents_retrieved=documents_retrieved,
            top_chunks=top_chunks,
            relevance_scores=relevance_scores,
            duration_ms=duration_ms,
        )

        await self.transparency.log_event(
            EventType.DEBUG_LOG,
            event.to_dict(),
            severity=Severity.DEBUG,
            tags=["rag", "retrieval"],
        )

    async def log_memory_operation(
        self,
        operation: str,
        memory_type: str,
        key: Optional[str] = None,
        content_preview: Optional[str] = None,
        success: bool = True,
    ):
        """Log a memory operation."""
        event = MemoryEvent(
            operation=operation,
            memory_type=memory_type,
            key=key,
            content_preview=content_preview,
            success=success,
        )

        await self.transparency.log_event(
            EventType.DEBUG_LOG,
            event.to_dict(),
            severity=Severity.DEBUG,
            tags=["memory", operation, memory_type],
        )

async def main():
    transparency = create_transparency_manager(
        agent_id="custom-events-example",
        file_path="./logs",
    )
    await transparency.start()

    # Create extended transparency
    ext = ExtendedTransparency(transparency)

    try:
        print("=" * 60)
        print("Custom Events Example")
        print("=" * 60)

        # Example 1: Tool calls
        print("\n1. Tool Call Events")
        print("-" * 40)

        await ext.log_tool_call(
            tool_name="web_search",
            arguments={"query": "latest AI news", "max_results": 5},
            result="Found 5 relevant articles",
            duration_ms=250,
            success=True
        )
        print("Logged: web_search tool call (success)")

        await ext.log_tool_call(
            tool_name="calculator",
            arguments={"expression": "sqrt(-1)"},
            success=False,
            error="Cannot compute square root of negative number"
        )
        print("Logged: calculator tool call (error)")

        # Example 2: RAG events
        print("\n2. RAG Retrieval Events")
        print("-" * 40)

        await ext.log_rag_retrieval(
            query="How does photosynthesis work?",
            documents_retrieved=10,
            top_chunks=[
                "Photosynthesis is the process by which plants...",
                "The light-dependent reactions occur in...",
                "Chlorophyll absorbs light energy..."
            ],
            relevance_scores=[0.95, 0.89, 0.85],
            duration_ms=120
        )
        print("Logged: RAG retrieval with 10 documents")

        # Example 3: Memory events
        print("\n3. Memory Operation Events")
        print("-" * 40)

        await ext.log_memory_operation(
            operation="store",
            memory_type="long_term",
            key="user_preference_theme",
            content_preview="dark_mode",
            success=True
        )
        print("Logged: memory store operation")

        await ext.log_memory_operation(
            operation="retrieve",
            memory_type="episodic",
            key="last_conversation",
            content_preview="User asked about weather...",
            success=True
        )
        print("Logged: memory retrieve operation")

        # Example 4: Generic custom events
        print("\n4. Generic Custom Events")
        print("-" * 40)

        # Custom metrics event
        await transparency.log_event(
            EventType.DEBUG_LOG,
            {
                "event_category": "metrics",
                "cpu_usage": 45.2,
                "memory_mb": 512,
                "active_connections": 3
            },
            severity=Severity.INFO,
            tags=["metrics", "system"]
        )
        print("Logged: system metrics")

        # Custom user interaction event
        await transparency.log_event(
            EventType.DEBUG_LOG,
            {
                "event_category": "user_interaction",
                "interaction_type": "button_click",
                "element_id": "submit_button",
                "timestamp_client": "2024-01-10T15:30:45Z"
            },
            severity=Severity.DEBUG,
            tags=["ui", "interaction"]
        )
        print("Logged: user interaction")

        # Custom workflow event
        await transparency.log_event(
            EventType.DEBUG_LOG,
            {
                "event_category": "workflow",
                "workflow_name": "document_processing",
                "stage": "ocr_complete",
                "pages_processed": 15,
                "confidence": 0.92
            },
            severity=Severity.INFO,
            tags=["workflow", "document_processing"]
        )
        print("Logged: workflow stage")

    finally:
        await transparency.stop()

    print("\n" + "=" * 60)
    print("Check ./logs/custom-events-example_transparency.jsonl")

if __name__ == "__main__":
    asyncio.run(main())
```

## Running the Example

```bash
python custom_events_example.py
```

## Sample JSONL Output

```json
{"event_type": "debug.log", "metadata": {"severity": "info", "tags": ["tool", "web_search", "success"]}, "payload": {"tool_name": "web_search", "arguments": {"query": "latest AI news", "max_results": 5}, "result": "Found 5 relevant articles", "duration_ms": 250, "success": true}}
{"event_type": "debug.log", "metadata": {"severity": "debug", "tags": ["rag", "retrieval"]}, "payload": {"query": "How does photosynthesis work?", "documents_retrieved": 10, "top_chunks": [...], "relevance_scores": [0.95, 0.89, 0.85], "duration_ms": 120}}
{"event_type": "debug.log", "metadata": {"severity": "debug", "tags": ["memory", "store", "long_term"]}, "payload": {"operation": "store", "memory_type": "long_term", "key": "user_preference_theme", "content_preview": "dark_mode", "success": true}}
```

## Filtering Custom Events

Filter by tags when analyzing logs:

```python
def filter_by_tag(log_path: str, tag: str):
    with open(log_path, 'r') as f:
        for line in f:
            event = json.loads(line)
            if tag in event["metadata"].get("tags", []):
                yield event

# Get all tool events
for event in filter_by_tag("logs/agent.jsonl", "tool"):
    print(event)

# Get all RAG events
for event in filter_by_tag("logs/agent.jsonl", "rag"):
    print(event)
```

## Best Practices

1. **Use consistent tags** for filtering
2. **Create helper methods** for common custom events
3. **Include timestamps** for duration tracking
4. **Use appropriate severity** based on importance
5. **Limit payload size** for large objects

## Next Steps

- [Configuration](/guide/configuration) - Filter custom events
- [API Reference](/api/transparency-manager) - log_event API
- [Event Types](/guide/event-types) - Built-in events
