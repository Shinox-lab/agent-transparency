"""
Transparency Manager Module

Provides the core transparency functionality for tracking agent input,
thought process, and output. This module handles event logging, output
destinations, and provides convenient APIs for different types of events.
"""

import asyncio
import json
import traceback
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import time

from .types import (
    EventType,
    ThinkingPhase,
    LangGraphNodeType,
    OutputDestination,
    Severity,
    EventMetadata,
    InputEvent,
    ThinkingEvent,
    LangGraphEvent,
    LLMEvent,
    OutputEvent,
    ActionEvent,
    StateSnapshot,
    ErrorEvent,
    TransparencyEvent,
    TransparencyConfig,
    TransparencyContext,
)


def _now_iso() -> str:
    """Get current UTC time in ISO format."""
    return datetime.now(timezone.utc).isoformat()


class TransparencyManager:
    """
    Main transparency manager that handles event logging across multiple
    destinations. Provides a comprehensive API for tracking the full
    lifecycle of agent operations.
    """

    def __init__(
        self,
        agent_id: str,
        config: Optional[TransparencyConfig] = None,
    ):
        self.agent_id = agent_id
        self.config = config or TransparencyConfig()
        self._context: Optional[TransparencyContext] = None
        self._buffer: deque = deque(maxlen=self.config.buffer_size)
        self._file_handle = None
        self._flush_task: Optional[asyncio.Task] = None
        self._running = False

        # Setup file output if configured
        if OutputDestination.FILE in self.config.destinations:
            self._setup_file_output()

    def _setup_file_output(self):
        """Setup file output directory and handle."""
        path = Path(self.config.file_path)
        path.mkdir(parents=True, exist_ok=True)
        self._log_file_path = path / f"{self.agent_id}_transparency.jsonl"

    async def start(self):
        """Start the transparency manager (background flush task)."""
        if self._running:
            return
        self._running = True
        if self.config.async_mode:
            self._flush_task = asyncio.create_task(self._background_flush())

    async def stop(self):
        """Stop the transparency manager and flush remaining events."""
        self._running = False
        if self._flush_task:
            self._flush_task.cancel()
            try:
                await self._flush_task
            except asyncio.CancelledError:
                pass
        await self._flush_buffer()

    async def _background_flush(self):
        """Background task to periodically flush the buffer."""
        while self._running:
            await asyncio.sleep(self.config.flush_interval_seconds)
            await self._flush_buffer()

    async def _flush_buffer(self):
        """Flush buffered events to destinations."""
        while self._buffer:
            event = self._buffer.popleft()
            await self._write_event(event)

    async def _write_event(self, event: TransparencyEvent):
        """Write an event to all configured destinations."""
        event_dict = event.to_dict()

        for destination in self.config.destinations:
            try:
                if destination == OutputDestination.FILE:
                    await self._write_to_file(event_dict)
                elif destination == OutputDestination.CONSOLE:
                    self._write_to_console(event_dict)
                elif destination == OutputDestination.KAFKA:
                    await self._write_to_kafka(event_dict)
            except Exception as e:
                print(f"[Transparency] Error writing to {destination}: {e}")

    async def _write_to_file(self, event_dict: Dict[str, Any]):
        """Write event to JSONL file."""
        if not hasattr(self, '_log_file_path'):
            return
        line = json.dumps(event_dict, default=str) + "\n"
        with open(self._log_file_path, "a") as f:
            f.write(line)

    def _write_to_console(self, event_dict: Dict[str, Any]):
        """Write event to console with formatting."""
        event_type = event_dict.get("event_type", "unknown")
        severity = event_dict.get("metadata", {}).get("severity", "info")
        timestamp = event_dict.get("metadata", {}).get("timestamp", "")

        # Color coding based on severity
        colors = {
            "trace": "\033[90m",    # Gray
            "debug": "\033[36m",    # Cyan
            "info": "\033[32m",     # Green
            "warning": "\033[33m",  # Yellow
            "error": "\033[31m",    # Red
            "critical": "\033[35m", # Magenta
        }
        reset = "\033[0m"
        color = colors.get(severity, "")

        if self.config.pretty_print:
            print(f"{color}[{timestamp}] [{severity.upper()}] {event_type}{reset}")
            payload = event_dict.get("payload", {})
            if payload:
                # Print key details based on event type
                self._print_payload_summary(event_type, payload, color, reset)
        else:
            print(json.dumps(event_dict, default=str))

    def _print_payload_summary(
        self,
        event_type: str,
        payload: Dict[str, Any],
        color: str,
        reset: str
    ):
        """Print a human-readable summary of the payload."""
        indent = "  "

        if "input" in event_type:
            content = payload.get("raw_content", "")[:100]
            print(f"{indent}Content: {content}...")
        elif "thinking" in event_type:
            phase = payload.get("phase", "")
            desc = payload.get("description", "")[:100]
            print(f"{indent}Phase: {phase} - {desc}")
        elif "graph.node" in event_type:
            node = payload.get("node_name", "")
            node_type = payload.get("node_type", "")
            print(f"{indent}Node: {node} ({node_type})")
        elif "llm" in event_type:
            model = payload.get("model_name", "")
            tokens = payload.get("total_tokens", "N/A")
            print(f"{indent}Model: {model}, Tokens: {tokens}")
        elif "action" in event_type:
            target = payload.get("target_agent_id", "")
            instruction = payload.get("instruction", "")[:80]
            print(f"{indent}Target: {target}, Instruction: {instruction}...")
        elif "state" in event_type:
            status = payload.get("squad_status", "")
            print(f"{indent}Status: {status}")
        elif "error" in event_type:
            error_type = payload.get("error_type", "")
            message = payload.get("message", "")[:100]
            print(f"{color}{indent}Error: {error_type} - {message}{reset}")

    async def _write_to_kafka(self, event_dict: Dict[str, Any]):
        """Write event to Kafka topic."""
        if not self.config.kafka_broker:
            return
        topic = self.config.kafka_topic or f"agent.{self.agent_id}.transparency"
        await self.config.kafka_broker.publish(event_dict, topic=topic)

    # =========================================================================
    # CONTEXT MANAGEMENT
    # =========================================================================

    def create_context(
        self,
        session_id: str = "",
        conversation_id: str = "",
    ) -> TransparencyContext:
        """Create a new transparency context for tracking correlated events."""
        return TransparencyContext(
            agent_id=self.agent_id,
            session_id=session_id,
            conversation_id=conversation_id,
        )

    def set_context(self, context: TransparencyContext):
        """Set the current active context."""
        self._context = context

    def get_context(self) -> Optional[TransparencyContext]:
        """Get the current active context."""
        return self._context

    @asynccontextmanager
    async def context_scope(
        self,
        session_id: str = "",
        conversation_id: str = "",
    ):
        """Context manager for scoped transparency context."""
        previous_context = self._context
        self._context = self.create_context(session_id, conversation_id)
        try:
            yield self._context
        finally:
            self._context = previous_context

    # =========================================================================
    # CORE EVENT LOGGING
    # =========================================================================

    def _create_metadata(
        self,
        severity: Severity = Severity.INFO,
        tags: Optional[List[str]] = None,
        parent_event_id: Optional[str] = None,
    ) -> EventMetadata:
        """Create event metadata with current context."""
        ctx = self._context or TransparencyContext(agent_id=self.agent_id)
        return EventMetadata(
            timestamp=_now_iso(),
            agent_id=self.agent_id,
            session_id=ctx.session_id,
            conversation_id=ctx.conversation_id,
            correlation_id=ctx.correlation_id,
            parent_event_id=parent_event_id,
            sequence_number=ctx.next_sequence(),
            severity=severity,
            tags=tags or [],
        )

    async def log_event(
        self,
        event_type: EventType,
        payload: Any,
        severity: Severity = Severity.INFO,
        tags: Optional[List[str]] = None,
        parent_event_id: Optional[str] = None,
    ):
        """Log a transparency event."""
        if not self.config.enabled:
            return

        # Check severity filter
        severity_order = list(Severity)
        if severity_order.index(severity) < severity_order.index(self.config.min_severity):
            return

        # Check event type filter
        if self.config.event_type_filter and event_type not in self.config.event_type_filter:
            return

        event = TransparencyEvent(
            event_type=event_type,
            metadata=self._create_metadata(severity, tags, parent_event_id),
            payload=payload,
        )

        if self.config.async_mode and self._running:
            self._buffer.append(event)
        else:
            await self._write_event(event)

    # =========================================================================
    # INPUT EVENTS
    # =========================================================================

    async def log_input_received(
        self,
        content: str,
        source: str = "user",
        source_agent_id: Optional[str] = None,
        content_type: str = "text",
    ):
        """Log when input is received by the agent."""
        await self.log_event(
            EventType.INPUT_RECEIVED,
            InputEvent(
                raw_content=content,
                content_type=content_type,
                source=source,
                source_agent_id=source_agent_id,
            ),
            severity=Severity.INFO,
            tags=["input"],
        )

    async def log_input_parsed(
        self,
        content: str,
        parsed_intent: Optional[str] = None,
        entities: Optional[Dict[str, Any]] = None,
    ):
        """Log when input has been parsed/understood."""
        await self.log_event(
            EventType.INPUT_PARSED,
            InputEvent(
                raw_content=content,
                parsed_intent=parsed_intent,
                extracted_entities=entities or {},
                validation_status="parsed",
            ),
            severity=Severity.DEBUG,
            tags=["input", "parsing"],
        )

    # =========================================================================
    # THINKING EVENTS
    # =========================================================================

    async def log_thinking_start(self, description: str = "Beginning analysis"):
        """Log when the agent starts its thinking process."""
        await self.log_event(
            EventType.THINKING_START,
            ThinkingEvent(
                phase=ThinkingPhase.PERCEPTION,
                description=description,
            ),
            severity=Severity.INFO,
            tags=["thinking"],
        )

    async def log_thinking_step(
        self,
        phase: ThinkingPhase,
        description: str,
        reasoning: str = "",
        considerations: Optional[List[str]] = None,
        confidence: Optional[float] = None,
    ):
        """Log a step in the thinking process."""
        await self.log_event(
            EventType.THINKING_STEP,
            ThinkingEvent(
                phase=phase,
                description=description,
                reasoning=reasoning,
                considerations=considerations or [],
                confidence_score=confidence,
            ),
            severity=Severity.DEBUG,
            tags=["thinking", phase.value],
        )

    async def log_thinking_decision(
        self,
        decision: str,
        rationale: str,
        alternatives: Optional[List[Dict[str, Any]]] = None,
        confidence: Optional[float] = None,
    ):
        """Log a decision made by the agent."""
        await self.log_event(
            EventType.THINKING_DECISION,
            ThinkingEvent(
                phase=ThinkingPhase.DECISION,
                description=decision,
                decision_rationale=rationale,
                alternatives_evaluated=alternatives or [],
                confidence_score=confidence,
            ),
            severity=Severity.INFO,
            tags=["thinking", "decision"],
        )

    async def log_thinking_end(self, summary: str = "Completed analysis"):
        """Log when thinking process completes."""
        await self.log_event(
            EventType.THINKING_END,
            ThinkingEvent(
                phase=ThinkingPhase.SYNTHESIS,
                description=summary,
            ),
            severity=Severity.INFO,
            tags=["thinking"],
        )

    # =========================================================================
    # LANGGRAPH EVENTS
    # =========================================================================

    async def log_graph_invoke_start(
        self,
        initial_state: Dict[str, Any],
    ):
        """Log when a LangGraph invoke starts."""
        await self.log_event(
            EventType.GRAPH_INVOKE_START,
            LangGraphEvent(
                node_name="__start__",
                node_type=LangGraphNodeType.CUSTOM,
                state_before=initial_state,
            ),
            severity=Severity.INFO,
            tags=["langgraph", "invoke"],
        )

    async def log_graph_invoke_end(
        self,
        final_state: Dict[str, Any],
        duration_ms: Optional[int] = None,
    ):
        """Log when a LangGraph invoke completes."""
        await self.log_event(
            EventType.GRAPH_INVOKE_END,
            LangGraphEvent(
                node_name="__end__",
                node_type=LangGraphNodeType.CUSTOM,
                state_after=final_state,
                duration_ms=duration_ms,
            ),
            severity=Severity.INFO,
            tags=["langgraph", "invoke"],
        )

    async def log_node_enter(
        self,
        node_name: str,
        node_type: LangGraphNodeType,
        state_before: Dict[str, Any],
    ):
        """Log when entering a LangGraph node."""
        await self.log_event(
            EventType.GRAPH_NODE_ENTER,
            LangGraphEvent(
                node_name=node_name,
                node_type=node_type,
                state_before=state_before,
            ),
            severity=Severity.DEBUG,
            tags=["langgraph", "node", node_name],
        )

    async def log_node_exit(
        self,
        node_name: str,
        node_type: LangGraphNodeType,
        state_before: Dict[str, Any],
        state_after: Dict[str, Any],
        duration_ms: Optional[int] = None,
    ):
        """Log when exiting a LangGraph node."""
        # Calculate state delta
        delta = self._compute_state_delta(state_before, state_after)

        await self.log_event(
            EventType.GRAPH_NODE_EXIT,
            LangGraphEvent(
                node_name=node_name,
                node_type=node_type,
                state_before=state_before,
                state_after=state_after,
                state_delta=delta,
                duration_ms=duration_ms,
            ),
            severity=Severity.DEBUG,
            tags=["langgraph", "node", node_name],
        )

    async def log_conditional_route(
        self,
        from_node: str,
        to_node: str,
        route_decision: str,
        state: Dict[str, Any],
    ):
        """Log a conditional routing decision."""
        await self.log_event(
            EventType.GRAPH_CONDITIONAL_ROUTE,
            LangGraphEvent(
                node_name=from_node,
                node_type=LangGraphNodeType.ROUTER,
                next_node=to_node,
                route_decision=route_decision,
                state_before=state,
            ),
            severity=Severity.INFO,
            tags=["langgraph", "routing"],
        )

    def _compute_state_delta(
        self,
        before: Dict[str, Any],
        after: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Compute the difference between two states."""
        delta = {}
        all_keys = set(before.keys()) | set(after.keys())

        for key in all_keys:
            before_val = before.get(key)
            after_val = after.get(key)

            if before_val != after_val:
                delta[key] = {
                    "before": self._safe_serialize(before_val),
                    "after": self._safe_serialize(after_val),
                }

        return delta

    def _safe_serialize(self, value: Any) -> Any:
        """Safely serialize a value for logging."""
        if value is None:
            return None
        if isinstance(value, (str, int, float, bool)):
            return value
        if isinstance(value, (list, tuple)):
            return [self._safe_serialize(v) for v in value[:10]]  # Limit list size
        if isinstance(value, dict):
            return {k: self._safe_serialize(v) for k, v in list(value.items())[:20]}
        # For LangChain messages and other objects
        if hasattr(value, 'content'):
            return f"<{type(value).__name__}: {str(value.content)[:100]}>"
        return f"<{type(value).__name__}>"

    # =========================================================================
    # LLM EVENTS
    # =========================================================================

    async def log_llm_request_start(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
    ):
        """Log when an LLM request starts."""
        await self.log_event(
            EventType.LLM_REQUEST_START,
            LLMEvent(
                model_name=model_name,
                prompt=prompt,
                system_prompt=system_prompt,
            ),
            severity=Severity.DEBUG,
            tags=["llm", "request"],
        )

    async def log_llm_response(
        self,
        model_name: str,
        prompt: str,
        response: str,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        latency_ms: Optional[int] = None,
    ):
        """Log an LLM response."""
        total = None
        if input_tokens is not None and output_tokens is not None:
            total = input_tokens + output_tokens

        await self.log_event(
            EventType.LLM_RESPONSE_RECEIVED,
            LLMEvent(
                model_name=model_name,
                prompt=prompt,
                response=response,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total,
                latency_ms=latency_ms,
            ),
            severity=Severity.INFO,
            tags=["llm", "response"],
        )

    async def log_llm_error(
        self,
        model_name: str,
        error: str,
        prompt: Optional[str] = None,
    ):
        """Log an LLM error."""
        await self.log_event(
            EventType.LLM_ERROR,
            LLMEvent(
                model_name=model_name,
                prompt=prompt or "",
                error=error,
            ),
            severity=Severity.ERROR,
            tags=["llm", "error"],
        )

    # =========================================================================
    # OUTPUT EVENTS
    # =========================================================================

    async def log_output_generated(
        self,
        content: str,
        target: str = "user",
        target_agent_id: Optional[str] = None,
        action_type: Optional[str] = None,
    ):
        """Log when output is generated."""
        await self.log_event(
            EventType.OUTPUT_GENERATED,
            OutputEvent(
                content=content,
                target=target,
                target_agent_id=target_agent_id,
                action_type=action_type,
            ),
            severity=Severity.INFO,
            tags=["output"],
        )

    async def log_output_dispatched(
        self,
        content: str,
        target: str,
        target_agent_id: Optional[str] = None,
    ):
        """Log when output has been dispatched."""
        await self.log_event(
            EventType.OUTPUT_DISPATCHED,
            OutputEvent(
                content=content,
                target=target,
                target_agent_id=target_agent_id,
                delivery_status="dispatched",
            ),
            severity=Severity.INFO,
            tags=["output", "dispatched"],
        )

    # =========================================================================
    # ACTION EVENTS
    # =========================================================================

    async def log_action_planned(
        self,
        target_agent_id: str,
        instruction: str,
        action_type: str = "command",
        parameters: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Log a planned action. Returns action_id for tracking."""
        action = ActionEvent(
            action_type=action_type,
            target_agent_id=target_agent_id,
            instruction=instruction,
            parameters=parameters or {},
            status="planned",
        )
        await self.log_event(
            EventType.ACTION_PLANNED,
            action,
            severity=Severity.INFO,
            tags=["action", "planned"],
        )
        return action.action_id

    async def log_action_dispatched(
        self,
        action_id: str,
        target_agent_id: str,
        instruction: str,
    ):
        """Log when an action has been dispatched."""
        await self.log_event(
            EventType.ACTION_DISPATCHED,
            ActionEvent(
                action_id=action_id,
                target_agent_id=target_agent_id,
                instruction=instruction,
                status="dispatched",
            ),
            severity=Severity.INFO,
            tags=["action", "dispatched"],
        )

    async def log_action_completed(
        self,
        action_id: str,
        result: Optional[str] = None,
    ):
        """Log when an action completes."""
        await self.log_event(
            EventType.ACTION_COMPLETED,
            ActionEvent(
                action_id=action_id,
                status="completed",
                result=result,
            ),
            severity=Severity.INFO,
            tags=["action", "completed"],
        )

    async def log_action_failed(
        self,
        action_id: str,
        error: str,
    ):
        """Log when an action fails."""
        await self.log_event(
            EventType.ACTION_FAILED,
            ActionEvent(
                action_id=action_id,
                status="failed",
                error=error,
            ),
            severity=Severity.ERROR,
            tags=["action", "failed"],
        )

    # =========================================================================
    # STATE EVENTS
    # =========================================================================

    async def log_state_snapshot(
        self,
        state: Dict[str, Any],
        trigger: str = "periodic",
    ):
        """Log a full state snapshot."""
        from langchain_core.messages import BaseMessage

        # Extract message previews safely
        messages = state.get("messages", [])
        message_count = len(messages)
        last_msg_preview = ""
        if messages:
            last_msg = messages[-1]
            if isinstance(last_msg, BaseMessage):
                last_msg_preview = str(last_msg.content)[:200]
            else:
                last_msg_preview = str(last_msg)[:200]

        snapshot = StateSnapshot(
            squad_status=state.get("squad_status", ""),
            plan=state.get("plan", []),
            assignments=state.get("assignments", {}),
            available_agents=state.get("available_squad_agents", []),
            message_count=message_count,
            last_message_preview=last_msg_preview,
            pending_actions=state.get("next_actions", []),
        )

        await self.log_event(
            EventType.STATE_SNAPSHOT,
            snapshot,
            severity=Severity.INFO,
            tags=["state", trigger],
        )

    async def log_state_transition(
        self,
        from_status: str,
        to_status: str,
        reason: str = "",
    ):
        """Log a state transition."""
        await self.log_event(
            EventType.STATE_TRANSITION,
            {
                "from_status": from_status,
                "to_status": to_status,
                "reason": reason,
            },
            severity=Severity.INFO,
            tags=["state", "transition"],
        )

    # =========================================================================
    # ERROR EVENTS
    # =========================================================================

    async def log_error(
        self,
        error_type: str,
        message: str,
        exception: Optional[Exception] = None,
        context: Optional[Dict[str, Any]] = None,
        recoverable: bool = True,
    ):
        """Log an error."""
        stack_trace = None
        if exception and self.config.include_stack_traces:
            stack_trace = traceback.format_exc()

        await self.log_event(
            EventType.ERROR_OCCURRED,
            ErrorEvent(
                error_type=error_type,
                message=message,
                stack_trace=stack_trace,
                context=context or {},
                recoverable=recoverable,
            ),
            severity=Severity.ERROR if recoverable else Severity.CRITICAL,
            tags=["error", error_type],
        )

    # =========================================================================
    # LIFECYCLE EVENTS
    # =========================================================================

    async def log_agent_startup(self, metadata: Optional[Dict[str, Any]] = None):
        """Log agent startup."""
        await self.log_event(
            EventType.AGENT_STARTUP,
            metadata or {"status": "started"},
            severity=Severity.INFO,
            tags=["lifecycle", "startup"],
        )

    async def log_agent_shutdown(self, reason: str = "normal"):
        """Log agent shutdown."""
        await self.log_event(
            EventType.AGENT_SHUTDOWN,
            {"reason": reason},
            severity=Severity.INFO,
            tags=["lifecycle", "shutdown"],
        )

    # =========================================================================
    # CONVENIENCE METHODS
    # =========================================================================

    @asynccontextmanager
    async def trace_node(
        self,
        node_name: str,
        node_type: LangGraphNodeType,
        state: Dict[str, Any],
    ):
        """Context manager for tracing a LangGraph node execution."""
        state_before = self._safe_serialize(state)
        start_time = time.time()

        await self.log_node_enter(node_name, node_type, state_before)

        try:
            yield
        finally:
            duration_ms = int((time.time() - start_time) * 1000)
            state_after = self._safe_serialize(state)
            await self.log_node_exit(
                node_name, node_type, state_before, state_after, duration_ms
            )

    @asynccontextmanager
    async def trace_llm_call(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str] = None,
    ):
        """Context manager for tracing an LLM call."""
        start_time = time.time()
        await self.log_llm_request_start(model_name, prompt, system_prompt)

        response_holder = {"response": "", "error": None}
        try:
            yield response_holder
        except Exception as e:
            response_holder["error"] = str(e)
            raise
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            if response_holder["error"]:
                await self.log_llm_error(
                    model_name, response_holder["error"], prompt
                )
            else:
                await self.log_llm_response(
                    model_name, prompt, response_holder["response"],
                    latency_ms=latency_ms
                )

    @asynccontextmanager
    async def trace_thinking(self, description: str = "Processing request"):
        """Context manager for tracing the thinking process."""
        await self.log_thinking_start(description)
        try:
            yield
        finally:
            await self.log_thinking_end(f"Completed: {description}")


# =============================================================================
# SYNCHRONOUS WRAPPER
# =============================================================================

class SyncTransparencyManager:
    """
    Synchronous wrapper for TransparencyManager.
    Useful for non-async code paths (like LangGraph nodes).
    """

    def __init__(self, async_manager: TransparencyManager):
        self._async_manager = async_manager
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def _get_loop(self) -> asyncio.AbstractEventLoop:
        """Get or create an event loop."""
        try:
            return asyncio.get_running_loop()
        except RuntimeError:
            if self._loop is None:
                self._loop = asyncio.new_event_loop()
            return self._loop

    def _run(self, coro):
        """Run a coroutine synchronously."""
        loop = self._get_loop()
        if loop.is_running():
            # Schedule as a task if loop is already running
            asyncio.ensure_future(coro)
        else:
            loop.run_until_complete(coro)

    def log_node_enter(
        self,
        node_name: str,
        node_type: LangGraphNodeType,
        state_before: Dict[str, Any],
    ):
        """Synchronous version of log_node_enter."""
        self._run(self._async_manager.log_node_enter(node_name, node_type, state_before))

    def log_node_exit(
        self,
        node_name: str,
        node_type: LangGraphNodeType,
        state_before: Dict[str, Any],
        state_after: Dict[str, Any],
        duration_ms: Optional[int] = None,
    ):
        """Synchronous version of log_node_exit."""
        self._run(self._async_manager.log_node_exit(
            node_name, node_type, state_before, state_after, duration_ms
        ))

    def log_thinking_step(
        self,
        phase: ThinkingPhase,
        description: str,
        reasoning: str = "",
    ):
        """Synchronous version of log_thinking_step."""
        self._run(self._async_manager.log_thinking_step(phase, description, reasoning))

    def log_llm_response(
        self,
        model_name: str,
        prompt: str,
        response: str,
        latency_ms: Optional[int] = None,
    ):
        """Synchronous version of log_llm_response."""
        self._run(self._async_manager.log_llm_response(
            model_name, prompt, response, latency_ms=latency_ms
        ))

    def log_state_snapshot(self, state: Dict[str, Any], trigger: str = "node_exit"):
        """Synchronous version of log_state_snapshot."""
        self._run(self._async_manager.log_state_snapshot(state, trigger))

    def log_conditional_route(
        self,
        from_node: str,
        to_node: str,
        route_decision: str,
        state: Dict[str, Any],
    ):
        """Synchronous version of log_conditional_route."""
        self._run(self._async_manager.log_conditional_route(
            from_node, to_node, route_decision, state
        ))


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def create_transparency_manager(
    agent_id: str,
    kafka_broker: Any = None,
    file_path: str = "./transparency_logs",
    destinations: Optional[List[OutputDestination]] = None,
    enabled: bool = True,
) -> TransparencyManager:
    """
    Factory function to create a configured TransparencyManager.

    Args:
        agent_id: The agent's identifier
        kafka_broker: Optional KafkaBroker instance for Kafka output
        file_path: Path for file-based logging
        destinations: List of output destinations
        enabled: Whether transparency is enabled

    Returns:
        Configured TransparencyManager instance
    """
    if destinations is None:
        destinations = [OutputDestination.FILE, OutputDestination.CONSOLE]
        if kafka_broker:
            destinations.append(OutputDestination.KAFKA)

    config = TransparencyConfig(
        enabled=enabled,
        destinations=destinations,
        file_path=file_path,
        kafka_broker=kafka_broker,
        kafka_topic=f"agent.{agent_id}.transparency",
    )

    return TransparencyManager(agent_id, config)
