"""
Entry point for running transparency viewer as a module.

Usage:
    uv run python -m transparency --help
    uv run python -m transparency --kafka-bootstrap localhost:9092 --kafka-topic agent.squad-lead.transparency
"""

from transparency.viewer_server import main

if __name__ == "__main__":
    main()
