# LLM Tracking

Track all interactions with Language Learning Models (LLMs) including prompts, responses, token usage, and latency.

## Overview

LLM tracking captures:
- **Request details**: Model, prompt, system prompt
- **Response details**: Generated text, tokens used
- **Performance metrics**: Latency, cost estimates
- **Errors**: Failed requests and error messages

## Basic LLM Tracking

### Manual Tracking

Log LLM requests and responses separately:

```python
# Log request start
await transparency.log_llm_request_start(
    model_name="gpt-4",
    prompt="What is the capital of France?",
    system_prompt="You are a helpful assistant."
)

# Make the actual LLM call
response = await llm.generate(prompt)

# Log the response
await transparency.log_llm_response(
    model_name="gpt-4",
    prompt="What is the capital of France?",
    response=response.text,
    input_tokens=25,
    output_tokens=10,
    latency_ms=450
)
```

### Using Context Manager

The `trace_llm_call` context manager provides automatic timing:

```python
async with transparency.trace_llm_call(
    model_name="gpt-4",
    prompt="Explain quantum computing in simple terms",
    system_prompt="You are a teacher explaining complex topics simply."
) as ctx:
    # Make your LLM call
    response = await llm.generate(prompt)

    # Store the response for logging
    ctx["response"] = response.text

# Latency is automatically calculated
```

## Tracking Token Usage

Capture token counts for cost analysis:

```python
await transparency.log_llm_response(
    model_name="gpt-4",
    prompt=prompt,
    response=response.text,
    input_tokens=response.usage.prompt_tokens,
    output_tokens=response.usage.completion_tokens,
    latency_ms=response.latency_ms,
)
```

The library automatically calculates `total_tokens` from input and output tokens.

## Error Tracking

Log LLM errors for debugging:

```python
try:
    response = await llm.generate(prompt)
except RateLimitError as e:
    await transparency.log_llm_error(
        model_name="gpt-4",
        error=str(e),
        prompt=prompt
    )
    raise
except TimeoutError as e:
    await transparency.log_llm_error(
        model_name="gpt-4",
        error="Request timed out after 30 seconds",
        prompt=prompt
    )
    raise
```

## Integration Examples

### With OpenAI

```python
import openai
from transparency import create_transparency_manager
import time

transparency = create_transparency_manager(agent_id="openai-agent")

async def call_openai(prompt: str, system_prompt: str = None) -> str:
    """Call OpenAI with transparency logging."""
    await transparency.log_llm_request_start(
        model_name="gpt-4",
        prompt=prompt,
        system_prompt=system_prompt
    )

    start_time = time.time()
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt or "You are helpful."},
                {"role": "user", "content": prompt}
            ]
        )

        latency_ms = int((time.time() - start_time) * 1000)
        result = response.choices[0].message.content

        await transparency.log_llm_response(
            model_name="gpt-4",
            prompt=prompt,
            response=result,
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            latency_ms=latency_ms
        )

        return result

    except Exception as e:
        await transparency.log_llm_error(
            model_name="gpt-4",
            error=str(e),
            prompt=prompt
        )
        raise
```

### With Anthropic

```python
import anthropic
from transparency import create_transparency_manager
import time

transparency = create_transparency_manager(agent_id="anthropic-agent")

async def call_claude(prompt: str, system_prompt: str = None) -> str:
    """Call Claude with transparency logging."""
    await transparency.log_llm_request_start(
        model_name="claude-3-opus",
        prompt=prompt,
        system_prompt=system_prompt
    )

    start_time = time.time()
    try:
        client = anthropic.AsyncAnthropic()
        response = await client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            system=system_prompt or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}]
        )

        latency_ms = int((time.time() - start_time) * 1000)
        result = response.content[0].text

        await transparency.log_llm_response(
            model_name="claude-3-opus",
            prompt=prompt,
            response=result,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            latency_ms=latency_ms
        )

        return result

    except Exception as e:
        await transparency.log_llm_error(
            model_name="claude-3-opus",
            error=str(e),
            prompt=prompt
        )
        raise
```

### With LangChain

```python
from langchain_openai import ChatOpenAI
from langchain.callbacks.base import BaseCallbackHandler
from transparency import TransparencyManager
import time

class TransparencyCallback(BaseCallbackHandler):
    """LangChain callback for transparency logging."""

    def __init__(self, transparency: TransparencyManager):
        self.transparency = transparency
        self.start_time = None
        self.current_prompt = None

    def on_llm_start(self, serialized, prompts, **kwargs):
        self.start_time = time.time()
        self.current_prompt = prompts[0] if prompts else ""

        # Note: Use asyncio.create_task for async logging in sync callback
        import asyncio
        asyncio.create_task(
            self.transparency.log_llm_request_start(
                model_name=serialized.get("name", "unknown"),
                prompt=self.current_prompt
            )
        )

    def on_llm_end(self, response, **kwargs):
        latency_ms = int((time.time() - self.start_time) * 1000)
        result = response.generations[0][0].text

        import asyncio
        asyncio.create_task(
            self.transparency.log_llm_response(
                model_name="gpt-4",
                prompt=self.current_prompt,
                response=result,
                latency_ms=latency_ms
            )
        )

    def on_llm_error(self, error, **kwargs):
        import asyncio
        asyncio.create_task(
            self.transparency.log_llm_error(
                model_name="gpt-4",
                error=str(error),
                prompt=self.current_prompt
            )
        )

# Usage
transparency = TransparencyManager(agent_id="langchain-agent")
callback = TransparencyCallback(transparency)

llm = ChatOpenAI(model="gpt-4", callbacks=[callback])
response = await llm.ainvoke("What is AI?")
```

## LLM Event Payload

LLM events include detailed payload information:

```json
{
  "event_type": "llm.response.received",
  "metadata": {
    "event_id": "...",
    "timestamp": "2024-01-10T15:30:45.123456Z",
    "agent_id": "my-agent",
    "severity": "info"
  },
  "payload": {
    "model_name": "gpt-4",
    "prompt": "What is the capital of France?",
    "response": "The capital of France is Paris.",
    "system_prompt": "You are a helpful assistant.",
    "temperature": null,
    "max_tokens": null,
    "input_tokens": 25,
    "output_tokens": 10,
    "total_tokens": 35,
    "latency_ms": 450,
    "cost_usd": null,
    "error": null
  }
}
```

## Combining with Thinking Events

Track LLM calls within the context of agent reasoning:

```python
async def analyze_with_llm(query: str):
    """Analyze a query using LLM with full transparency."""

    # Start thinking
    await transparency.log_thinking_start("Analyzing query with LLM")

    # Log thinking step
    await transparency.log_thinking_step(
        phase=ThinkingPhase.ANALYSIS,
        description="Preparing LLM prompt",
        reasoning="Structuring the query for optimal LLM response"
    )

    # Make LLM call with tracking
    async with transparency.trace_llm_call(
        model_name="gpt-4",
        prompt=f"Analyze this query: {query}",
        system_prompt="You are an expert analyst."
    ) as ctx:
        response = await llm.generate(prompt)
        ctx["response"] = response.text

    # Log decision based on LLM output
    await transparency.log_thinking_decision(
        decision="Analysis complete",
        rationale=f"LLM provided analysis: {response.text[:100]}...",
        confidence=0.9
    )

    # End thinking
    await transparency.log_thinking_end("Query analysis complete")

    return response.text
```

## Best Practices

1. **Always log both request and response** for complete visibility
2. **Capture token usage** for cost tracking and optimization
3. **Include latency** for performance monitoring
4. **Log errors** with the original prompt for debugging
5. **Use context managers** for automatic timing
6. **Redact sensitive data** if prompts contain PII

## Analyzing LLM Usage

Query your logs to analyze LLM usage:

```python
import json
from collections import defaultdict

def analyze_llm_usage(log_path: str):
    """Analyze LLM usage from transparency logs."""
    stats = defaultdict(lambda: {
        "calls": 0,
        "total_tokens": 0,
        "total_latency_ms": 0,
        "errors": 0
    })

    with open(log_path, 'r') as f:
        for line in f:
            event = json.loads(line)
            if event["event_type"] == "llm.response.received":
                model = event["payload"]["model_name"]
                stats[model]["calls"] += 1
                stats[model]["total_tokens"] += event["payload"].get("total_tokens", 0)
                stats[model]["total_latency_ms"] += event["payload"].get("latency_ms", 0)

            elif event["event_type"] == "llm.error":
                model = event["payload"]["model_name"]
                stats[model]["errors"] += 1

    # Print summary
    for model, data in stats.items():
        avg_latency = data["total_latency_ms"] / data["calls"] if data["calls"] > 0 else 0
        print(f"\n{model}:")
        print(f"  Calls: {data['calls']}")
        print(f"  Total tokens: {data['total_tokens']}")
        print(f"  Avg latency: {avg_latency:.0f}ms")
        print(f"  Errors: {data['errors']}")
```

## Next Steps

- [Error Handling](/examples/error-handling) - Handle and log errors
- [Configuration](/guide/configuration) - Configure LLM event filtering
- [Real-time Viewer](/guide/viewer) - Monitor LLM calls in real-time
