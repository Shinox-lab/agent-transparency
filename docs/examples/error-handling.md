# Error Handling

Track errors and recovery with complete visibility for debugging.

## Overview

This example demonstrates:
- Logging recoverable and fatal errors
- Including stack traces and context
- Error recovery patterns
- Combining with other event types

## Complete Example

```python
import asyncio
import traceback
from transparency import (
    create_transparency_manager,
    ThinkingPhase,
    Severity,
    EventType,
)

class APIError(Exception):
    """Custom API error."""
    pass

class ValidationError(Exception):
    """Custom validation error."""
    pass

async def risky_operation(should_fail: bool = False) -> str:
    """Simulated operation that may fail."""
    await asyncio.sleep(0.1)
    if should_fail:
        raise APIError("Connection timeout after 30 seconds")
    return "Operation successful"

async def validate_input(data: dict) -> dict:
    """Validate input data."""
    if not data.get("required_field"):
        raise ValidationError("Missing required field")
    return data

async def main():
    transparency = create_transparency_manager(
        agent_id="error-handling-example",
        file_path="./logs",
    )
    await transparency.start()

    try:
        print("=" * 60)
        print("Error Handling Example")
        print("=" * 60)

        # Example 1: Basic error logging
        print("\n1. Basic Error Logging")
        print("-" * 40)

        try:
            result = await risky_operation(should_fail=True)
        except APIError as e:
            await transparency.log_error(
                error_type="APIError",
                message=str(e),
                exception=e,
                context={
                    "operation": "risky_operation",
                    "attempt": 1
                },
                recoverable=True
            )
            print(f"Caught error: {e}")

        # Example 2: Error with retry pattern
        print("\n2. Error with Retry")
        print("-" * 40)

        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                await transparency.log_thinking_step(
                    ThinkingPhase.REASONING,
                    f"Attempt {attempt} of {max_retries}",
                    reasoning="Retrying failed operation"
                )

                # Fail first two attempts
                should_fail = attempt < 3
                result = await risky_operation(should_fail=should_fail)

                print(f"Attempt {attempt}: Success!")
                break

            except APIError as e:
                await transparency.log_error(
                    error_type="APIError",
                    message=str(e),
                    exception=e,
                    context={
                        "attempt": attempt,
                        "max_retries": max_retries,
                        "will_retry": attempt < max_retries
                    },
                    recoverable=attempt < max_retries
                )
                print(f"Attempt {attempt}: Failed - {e}")

                if attempt == max_retries:
                    print("Max retries reached, giving up")

        # Example 3: Validation error
        print("\n3. Validation Error")
        print("-" * 40)

        await transparency.log_input_received(
            content='{"name": "test"}',
            source="user",
            content_type="json"
        )

        try:
            data = {"name": "test"}  # Missing required_field
            validated = await validate_input(data)
        except ValidationError as e:
            await transparency.log_error(
                error_type="ValidationError",
                message=str(e),
                context={
                    "input_data": data,
                    "missing_fields": ["required_field"]
                },
                recoverable=True
            )

            # Log input rejected
            await transparency.log_event(
                EventType.INPUT_REJECTED,
                {
                    "reason": str(e),
                    "input": data
                },
                severity=Severity.WARNING
            )
            print(f"Validation failed: {e}")

        # Example 4: Fatal error
        print("\n4. Fatal Error (Simulated)")
        print("-" * 40)

        # Simulate a fatal error scenario
        await transparency.log_error(
            error_type="DatabaseError",
            message="Database connection lost",
            context={
                "database": "primary",
                "last_query": "SELECT * FROM users"
            },
            recoverable=False
        )
        print("Logged fatal error (simulated)")

        # Example 5: Error with full context
        print("\n5. Error with Full Context")
        print("-" * 40)

        await transparency.log_thinking_start("Processing complex request")

        try:
            await transparency.log_thinking_step(
                ThinkingPhase.ANALYSIS,
                "Analyzing request"
            )

            await transparency.log_llm_request_start(
                model_name="gpt-4",
                prompt="Analyze this data"
            )

            # Simulate LLM error
            raise APIError("LLM service unavailable")

        except APIError as e:
            # Log LLM-specific error
            await transparency.log_llm_error(
                model_name="gpt-4",
                error=str(e),
                prompt="Analyze this data"
            )

            # Log general error with context
            await transparency.log_error(
                error_type="LLMServiceError",
                message=str(e),
                exception=e,
                context={
                    "service": "openai",
                    "model": "gpt-4",
                    "phase": "analysis"
                },
                recoverable=True
            )

            # Make a decision based on error
            await transparency.log_thinking_decision(
                decision="Fall back to cached response",
                rationale="LLM service is unavailable",
                alternatives=[
                    {"option": "Retry", "reason_rejected": "Service down"},
                    {"option": "Return error", "reason_rejected": "Bad UX"}
                ],
                confidence=0.7
            )

            print(f"LLM error handled: {e}")
            print("Falling back to cached response")

        finally:
            await transparency.log_thinking_end("Request processing complete (with errors)")

        # Example 6: Error recovery logging
        print("\n6. Error Recovery")
        print("-" * 40)

        await transparency.log_error(
            error_type="CacheError",
            message="Cache miss for key: user_123",
            recoverable=True
        )

        # Log recovery action
        await transparency.log_event(
            EventType.ERROR_RECOVERED,
            {
                "error_type": "CacheError",
                "recovery_action": "Fetched from database",
                "recovery_time_ms": 150
            },
            severity=Severity.INFO,
            tags=["error", "recovery"]
        )
        print("Error recovered: fetched from database")

    finally:
        await transparency.stop()

    print("\n" + "=" * 60)
    print("Check ./logs/error-handling-example_transparency.jsonl")

if __name__ == "__main__":
    asyncio.run(main())
```

## Running the Example

```bash
python error_handling_example.py
```

## Sample JSONL Output

```json
{"event_type": "error.occurred", "metadata": {"severity": "error"}, "payload": {"error_type": "APIError", "message": "Connection timeout after 30 seconds", "stack_trace": "...", "context": {"operation": "risky_operation", "attempt": 1}, "recoverable": true}}
{"event_type": "error.occurred", "metadata": {"severity": "critical"}, "payload": {"error_type": "DatabaseError", "message": "Database connection lost", "recoverable": false}}
{"event_type": "error.recovered", "metadata": {"severity": "info"}, "payload": {"error_type": "CacheError", "recovery_action": "Fetched from database", "recovery_time_ms": 150}}
```

## Error Handling Patterns

### Retry with Logging

```python
async def retry_with_logging(operation, max_retries=3):
    for attempt in range(1, max_retries + 1):
        try:
            return await operation()
        except Exception as e:
            is_last = attempt == max_retries
            await transparency.log_error(
                error_type=type(e).__name__,
                message=str(e),
                context={"attempt": attempt},
                recoverable=not is_last
            )
            if is_last:
                raise
```

### Circuit Breaker Pattern

```python
class CircuitBreaker:
    def __init__(self, transparency, threshold=5):
        self.transparency = transparency
        self.failures = 0
        self.threshold = threshold
        self.open = False

    async def call(self, operation):
        if self.open:
            await self.transparency.log_error(
                error_type="CircuitOpen",
                message="Circuit breaker is open",
                recoverable=False
            )
            raise Exception("Circuit open")

        try:
            result = await operation()
            self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            if self.failures >= self.threshold:
                self.open = True
            await self.transparency.log_error(
                error_type=type(e).__name__,
                message=str(e),
                context={"failures": self.failures}
            )
            raise
```

## Next Steps

- [Custom Events](/examples/custom-events) - Create custom event types
- [Configuration](/guide/configuration) - Configure error logging
- [API Reference](/api/transparency-manager) - Full error API
