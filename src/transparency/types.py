"""
Transparency Types Module

Defines all event types, phase types, and data structures for the
Agent Transparency System. This module provides a comprehensive type
system for tracking the input, thought process, and output of agents.
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timezone
import uuid


# =============================================================================
# ENUMS - Event Classification
# =============================================================================

class EventType(str, Enum):
    """
    Classifies the nature of transparency events.
    Events are categorized by their role in the agent lifecycle.
    """
    # --- Lifecycle Events ---
    AGENT_STARTUP = "agent.startup"
    AGENT_SHUTDOWN = "agent.shutdown"
    AGENT_HEALTH_CHECK = "agent.health_check"

    # --- Input Events ---
    INPUT_RECEIVED = "input.received"
    INPUT_VALIDATED = "input.validated"
    INPUT_PARSED = "input.parsed"
    INPUT_REJECTED = "input.rejected"

    # --- Thinking/Processing Events ---
    THINKING_START = "thinking.start"
    THINKING_STEP = "thinking.step"
    THINKING_DECISION = "thinking.decision"
    THINKING_END = "thinking.end"

    # --- LangGraph Specific Events ---
    GRAPH_INVOKE_START = "graph.invoke.start"
    GRAPH_INVOKE_END = "graph.invoke.end"
    GRAPH_NODE_ENTER = "graph.node.enter"
    GRAPH_NODE_EXIT = "graph.node.exit"
    GRAPH_EDGE_TRAVERSE = "graph.edge.traverse"
    GRAPH_CONDITIONAL_ROUTE = "graph.conditional.route"
    GRAPH_STATE_UPDATE = "graph.state.update"

    # --- LLM Interaction Events ---
    LLM_REQUEST_START = "llm.request.start"
    LLM_REQUEST_END = "llm.request.end"
    LLM_PROMPT_SENT = "llm.prompt.sent"
    LLM_RESPONSE_RECEIVED = "llm.response.received"
    LLM_TOKEN_USAGE = "llm.token.usage"
    LLM_ERROR = "llm.error"

    # --- Output Events ---
    OUTPUT_GENERATED = "output.generated"
    OUTPUT_VALIDATED = "output.validated"
    OUTPUT_DISPATCHED = "output.dispatched"
    OUTPUT_FAILED = "output.failed"

    # --- Action Events ---
    ACTION_PLANNED = "action.planned"
    ACTION_DISPATCHED = "action.dispatched"
    ACTION_COMPLETED = "action.completed"
    ACTION_FAILED = "action.failed"

    # --- Communication Events ---
    MESSAGE_SENT = "message.sent"
    MESSAGE_RECEIVED = "message.received"
    MESSAGE_ACKNOWLEDGED = "message.acknowledged"

    # --- State Events ---
    STATE_SNAPSHOT = "state.snapshot"
    STATE_TRANSITION = "state.transition"

    # --- Error Events ---
    ERROR_OCCURRED = "error.occurred"
    ERROR_RECOVERED = "error.recovered"
    ERROR_FATAL = "error.fatal"

    # --- Debug Events ---
    DEBUG_LOG = "debug.log"
    DEBUG_TRACE = "debug.trace"


class ThinkingPhase(str, Enum):
    """
    Represents the phases of the agent's thinking process.
    """
    PERCEPTION = "perception"       # Understanding input
    ANALYSIS = "analysis"           # Analyzing the situation
    PLANNING = "planning"           # Formulating a plan
    REASONING = "reasoning"         # Logical reasoning
    EVALUATION = "evaluation"       # Evaluating options
    DECISION = "decision"           # Making a decision
    SYNTHESIS = "synthesis"         # Combining information
    REFLECTION = "reflection"       # Self-reflection on process


class LangGraphNodeType(str, Enum):
    """
    Categorizes LangGraph node types for the transparency system.
    """
    MONITOR = "monitor"
    PLANNER = "planner"
    EXECUTOR = "executor"
    UPDATER = "updater"
    ROUTER = "router"
    TOOL_CALLER = "tool_caller"
    RETRIEVER = "retriever"
    SUMMARIZER = "summarizer"
    VALIDATOR = "validator"
    CUSTOM = "custom"


class OutputDestination(str, Enum):
    """
    Defines where transparency events can be sent.
    """
    FILE = "file"
    KAFKA = "kafka"
    CONSOLE = "console"
    WEBHOOK = "webhook"
    MEMORY = "memory"  # In-memory buffer for testing


class Severity(str, Enum):
    """
    Event severity levels.
    """
    TRACE = "trace"
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# =============================================================================
# DATA CLASSES - Event Structures
# =============================================================================

@dataclass
class EventMetadata:
    """
    Common metadata attached to all transparency events.
    """
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent_id: str = ""
    session_id: str = ""
    conversation_id: str = ""
    correlation_id: str = ""  # For tracing related events
    parent_event_id: Optional[str] = None  # For hierarchical events
    sequence_number: int = 0
    severity: Severity = Severity.INFO
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp,
            "agent_id": self.agent_id,
            "session_id": self.session_id,
            "conversation_id": self.conversation_id,
            "correlation_id": self.correlation_id,
            "parent_event_id": self.parent_event_id,
            "sequence_number": self.sequence_number,
            "severity": self.severity.value,
            "tags": self.tags,
        }


@dataclass
class InputEvent:
    """
    Captures details about input received by the agent.
    """
    raw_content: str
    content_type: str = "text"  # text, json, binary, etc.
    source: str = ""  # user, agent, system, etc.
    source_agent_id: Optional[str] = None
    parsed_intent: Optional[str] = None
    extracted_entities: Dict[str, Any] = field(default_factory=dict)
    validation_status: str = "pending"
    validation_errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "raw_content": self.raw_content,
            "content_type": self.content_type,
            "source": self.source,
            "source_agent_id": self.source_agent_id,
            "parsed_intent": self.parsed_intent,
            "extracted_entities": self.extracted_entities,
            "validation_status": self.validation_status,
            "validation_errors": self.validation_errors,
        }


@dataclass
class ThinkingEvent:
    """
    Captures the agent's internal reasoning and thought process.
    """
    phase: ThinkingPhase
    description: str
    reasoning: str = ""
    considerations: List[str] = field(default_factory=list)
    alternatives_evaluated: List[Dict[str, Any]] = field(default_factory=list)
    decision_rationale: Optional[str] = None
    confidence_score: Optional[float] = None  # 0.0 to 1.0
    duration_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "phase": self.phase.value,
            "description": self.description,
            "reasoning": self.reasoning,
            "considerations": self.considerations,
            "alternatives_evaluated": self.alternatives_evaluated,
            "decision_rationale": self.decision_rationale,
            "confidence_score": self.confidence_score,
            "duration_ms": self.duration_ms,
        }


@dataclass
class LangGraphEvent:
    """
    Captures LangGraph-specific execution details.
    """
    node_name: str
    node_type: LangGraphNodeType
    state_before: Dict[str, Any] = field(default_factory=dict)
    state_after: Dict[str, Any] = field(default_factory=dict)
    state_delta: Dict[str, Any] = field(default_factory=dict)
    next_node: Optional[str] = None
    route_decision: Optional[str] = None
    duration_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_name": self.node_name,
            "node_type": self.node_type.value,
            "state_before": self.state_before,
            "state_after": self.state_after,
            "state_delta": self.state_delta,
            "next_node": self.next_node,
            "route_decision": self.route_decision,
            "duration_ms": self.duration_ms,
        }


@dataclass
class LLMEvent:
    """
    Captures LLM interaction details.
    """
    model_name: str
    prompt: str = ""
    response: str = ""
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    cost_usd: Optional[float] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "prompt": self.prompt,
            "response": self.response,
            "system_prompt": self.system_prompt,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "latency_ms": self.latency_ms,
            "cost_usd": self.cost_usd,
            "error": self.error,
        }


@dataclass
class OutputEvent:
    """
    Captures details about output generated by the agent.
    """
    content: str
    content_type: str = "text"
    target: str = ""  # user, agent_id, broadcast, etc.
    target_agent_id: Optional[str] = None
    action_type: Optional[str] = None  # command, response, notification, etc.
    delivery_status: str = "pending"
    delivery_error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "content_type": self.content_type,
            "target": self.target,
            "target_agent_id": self.target_agent_id,
            "action_type": self.action_type,
            "delivery_status": self.delivery_status,
            "delivery_error": self.delivery_error,
        }


@dataclass
class ActionEvent:
    """
    Captures details about actions taken by the agent.
    """
    action_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str = ""
    target_agent_id: Optional[str] = None
    instruction: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    status: str = "planned"  # planned, dispatched, completed, failed
    result: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action_id": self.action_id,
            "action_type": self.action_type,
            "target_agent_id": self.target_agent_id,
            "instruction": self.instruction,
            "parameters": self.parameters,
            "status": self.status,
            "result": self.result,
            "error": self.error,
        }


@dataclass
class StateSnapshot:
    """
    Captures a complete snapshot of agent state.
    """
    squad_status: str = ""
    plan: List[List[str]] = field(default_factory=list)
    assignments: Dict[str, str] = field(default_factory=dict)
    available_agents: List[str] = field(default_factory=list)
    message_count: int = 0
    last_message_preview: str = ""
    pending_actions: List[Dict[str, Any]] = field(default_factory=list)
    custom_state: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "squad_status": self.squad_status,
            "plan": self.plan,
            "assignments": self.assignments,
            "available_agents": self.available_agents,
            "message_count": self.message_count,
            "last_message_preview": self.last_message_preview,
            "pending_actions": self.pending_actions,
            "custom_state": self.custom_state,
        }


@dataclass
class ErrorEvent:
    """
    Captures error information.
    """
    error_type: str
    message: str
    stack_trace: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)
    recoverable: bool = True
    recovery_action: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error_type": self.error_type,
            "message": self.message,
            "stack_trace": self.stack_trace,
            "context": self.context,
            "recoverable": self.recoverable,
            "recovery_action": self.recovery_action,
        }


@dataclass
class TransparencyEvent:
    """
    The main transparency event envelope that wraps all event types.
    """
    event_type: EventType
    metadata: EventMetadata
    payload: Union[
        InputEvent,
        ThinkingEvent,
        LangGraphEvent,
        LLMEvent,
        OutputEvent,
        ActionEvent,
        StateSnapshot,
        ErrorEvent,
        Dict[str, Any]  # For custom/generic payloads
    ]

    def to_dict(self) -> Dict[str, Any]:
        payload_dict = (
            self.payload.to_dict()
            if hasattr(self.payload, 'to_dict')
            else self.payload
        )
        return {
            "event_type": self.event_type.value,
            "metadata": self.metadata.to_dict(),
            "payload": payload_dict,
        }


# =============================================================================
# CONFIGURATION TYPES
# =============================================================================

@dataclass
class TransparencyConfig:
    """
    Configuration for the transparency system.
    """
    enabled: bool = True
    destinations: List[OutputDestination] = field(
        default_factory=lambda: [OutputDestination.FILE, OutputDestination.CONSOLE]
    )

    # File output settings
    file_path: str = "./transparency_logs"
    file_rotation_size_mb: int = 10
    file_retention_days: int = 30

    # Kafka output settings
    kafka_topic: str = ""  # Will be set based on agent_id
    kafka_broker: Any = None  # KafkaBroker instance

    # Filtering settings
    min_severity: Severity = Severity.DEBUG
    event_type_filter: List[EventType] = field(default_factory=list)  # Empty = all

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


# =============================================================================
# CONTEXT TYPES
# =============================================================================

@dataclass
class TransparencyContext:
    """
    Context that flows through the transparency system.
    Tracks the current execution context for proper event correlation.
    """
    agent_id: str
    session_id: str = ""
    conversation_id: str = ""
    correlation_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    parent_span_id: Optional[str] = None
    sequence_counter: int = 0

    def next_sequence(self) -> int:
        """Get the next sequence number."""
        self.sequence_counter += 1
        return self.sequence_counter

    def create_child_context(self) -> 'TransparencyContext':
        """Create a child context for nested operations."""
        return TransparencyContext(
            agent_id=self.agent_id,
            session_id=self.session_id,
            conversation_id=self.conversation_id,
            correlation_id=self.correlation_id,
            parent_span_id=self.correlation_id,
            sequence_counter=self.sequence_counter,
        )
