"""
Agent Transparency Library

A comprehensive library for tracking the input, thought process, and output
of AI agents. Provides extreme transparency into agent behavior for debugging,
auditing, and understanding agent decisions.

Usage:
    from transparency import (
        TransparencyManager,
        SyncTransparencyManager,
        create_transparency_manager,
        EventType,
        ThinkingPhase,
        LangGraphNodeType,
    )

    # Create a transparency manager
    transparency = create_transparency_manager(
        agent_id="my-agent",
        file_path="./logs",
    )

    # Start the manager
    await transparency.start()

    # Log events
    await transparency.log_input_received("User message here")
    await transparency.log_thinking_step(
        ThinkingPhase.ANALYSIS,
        "Analyzing user request"
    )
    await transparency.log_output_generated("Response to user")

    # Stop when done
    await transparency.stop()
"""

# Types - Event classification and structures
from .types import (
    # Enums
    EventType,
    ThinkingPhase,
    LangGraphNodeType,
    OutputDestination,
    Severity,
    # Data classes
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
    # Configuration
    TransparencyConfig,
    TransparencyContext,
)

# Main transparency manager
from .transparency import (
    TransparencyManager,
    SyncTransparencyManager,
    create_transparency_manager,
)

# Viewer server (optional import - requires aiohttp)
try:
    from .viewer_server import TransparencyViewerServer, ServerConfig, SourceType
    _VIEWER_AVAILABLE = True
except ImportError:
    _VIEWER_AVAILABLE = False
    TransparencyViewerServer = None
    ServerConfig = None
    SourceType = None

__all__ = [
    # Enums
    "EventType",
    "ThinkingPhase",
    "LangGraphNodeType",
    "OutputDestination",
    "Severity",
    # Data classes
    "EventMetadata",
    "InputEvent",
    "ThinkingEvent",
    "LangGraphEvent",
    "LLMEvent",
    "OutputEvent",
    "ActionEvent",
    "StateSnapshot",
    "ErrorEvent",
    "TransparencyEvent",
    # Configuration
    "TransparencyConfig",
    "TransparencyContext",
    # Managers
    "TransparencyManager",
    "SyncTransparencyManager",
    "create_transparency_manager",
    # Viewer (optional)
    "TransparencyViewerServer",
    "ServerConfig",
    "SourceType",
]

__version__ = "1.0.0"
