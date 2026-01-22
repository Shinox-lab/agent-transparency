# LLM Call Tracking

Track LLM interactions with complete visibility into prompts, responses, and usage.

## Overview

This example demonstrates:
- Logging LLM request start and response
- Tracking token usage and latency
- Using the trace_llm_call context manager
- Handling LLM errors

## Complete Example

```python
import asyncio
import time
from transparency import (
    create_transparency_manager,
    ThinkingPhase,
)

# Simulated LLM response
class MockLLMResponse:
    def __init__(self, text: str, input_tokens: int, output_tokens: int):
        self.text = text
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens

class MockLLM:
    """Simulated LLM for demonstration."""

    async def generate(self, prompt: str, system_prompt: str = None) -> MockLLMResponse:
        # Simulate latency
        await asyncio.sleep(0.1)

        # Simulate response
        response_text = f"Response to: {prompt[:50]}..."
        return MockLLMResponse(
            text=response_text,
            input_tokens=len(prompt.split()),
            output_tokens=len(response_text.split()),
        )

    async def generate_with_error(self, prompt: str) -> MockLLMResponse:
        await asyncio.sleep(0.05)
        raise Exception("Rate limit exceeded")

async def main():
    # Create transparency manager
    transparency = create_transparency_manager(
        agent_id="llm-tracking-example",
        file_path="./logs",
    )
    await transparency.start()

    llm = MockLLM()

    try:
        print("=" * 60)
        print("LLM Tracking Example")
        print("=" * 60)

        # Example 1: Manual LLM tracking
        print("\n1. Manual LLM Tracking")
        print("-" * 40)

        prompt = "What is machine learning and how does it work?"
        system_prompt = "You are a helpful AI teacher."

        # Log request start
        await transparency.log_llm_request_start(
            model_name="gpt-4",
            prompt=prompt,
            system_prompt=system_prompt
        )

        start_time = time.time()
        response = await llm.generate(prompt, system_prompt)
        latency_ms = int((time.time() - start_time) * 1000)

        # Log response
        await transparency.log_llm_response(
            model_name="gpt-4",
            prompt=prompt,
            response=response.text,
            input_tokens=response.input_tokens,
            output_tokens=response.output_tokens,
            latency_ms=latency_ms
        )

        print(f"Prompt: {prompt}")
        print(f"Response: {response.text}")
        print(f"Tokens: {response.input_tokens} in, {response.output_tokens} out")
        print(f"Latency: {latency_ms}ms")

        # Example 2: Using context manager
        print("\n2. Context Manager Tracking")
        print("-" * 40)

        prompt2 = "Explain neural networks in simple terms"

        async with transparency.trace_llm_call(
            model_name="gpt-4",
            prompt=prompt2,
            system_prompt="You are a patient teacher."
        ) as ctx:
            response2 = await llm.generate(prompt2)
            ctx["response"] = response2.text

        print(f"Prompt: {prompt2}")
        print(f"Response: {response2.text}")

        # Example 3: Multiple LLM calls in a chain
        print("\n3. Chain of LLM Calls")
        print("-" * 40)

        await transparency.log_thinking_start("Processing multi-step request")

        # First call: Analyze
        await transparency.log_thinking_step(
            ThinkingPhase.ANALYSIS,
            "Analyzing the request"
        )

        prompt_analyze = "Analyze this topic: AI safety"
        await transparency.log_llm_request_start("gpt-4", prompt_analyze)
        start = time.time()
        analysis = await llm.generate(prompt_analyze)
        await transparency.log_llm_response(
            "gpt-4", prompt_analyze, analysis.text,
            input_tokens=analysis.input_tokens,
            output_tokens=analysis.output_tokens,
            latency_ms=int((time.time() - start) * 1000)
        )
        print(f"Analysis: {analysis.text}")

        # Second call: Synthesize
        await transparency.log_thinking_step(
            ThinkingPhase.SYNTHESIS,
            "Synthesizing the analysis"
        )

        prompt_synth = f"Based on: {analysis.text[:50]}... Create a summary"
        await transparency.log_llm_request_start("gpt-4", prompt_synth)
        start = time.time()
        synthesis = await llm.generate(prompt_synth)
        await transparency.log_llm_response(
            "gpt-4", prompt_synth, synthesis.text,
            input_tokens=synthesis.input_tokens,
            output_tokens=synthesis.output_tokens,
            latency_ms=int((time.time() - start) * 1000)
        )
        print(f"Synthesis: {synthesis.text}")

        await transparency.log_thinking_end("Multi-step processing complete")

        # Example 4: Error handling
        print("\n4. LLM Error Handling")
        print("-" * 40)

        try:
            async with transparency.trace_llm_call(
                model_name="gpt-4",
                prompt="This will fail"
            ) as ctx:
                await llm.generate_with_error("This will fail")
                ctx["response"] = "Never reached"

        except Exception as e:
            print(f"Caught error: {e}")
            # The context manager automatically logs the error

        # Example 5: Different models
        print("\n5. Multiple Models")
        print("-" * 40)

        models = ["gpt-4", "gpt-3.5-turbo", "claude-3"]

        for model in models:
            prompt = f"Hello from {model}"

            await transparency.log_llm_request_start(model, prompt)
            start = time.time()
            response = await llm.generate(prompt)
            await transparency.log_llm_response(
                model, prompt, response.text,
                latency_ms=int((time.time() - start) * 1000)
            )

            print(f"{model}: {response.text}")

    finally:
        await transparency.stop()

    print("\n" + "=" * 60)
    print("Check ./logs/llm-tracking-example_transparency.jsonl")

if __name__ == "__main__":
    asyncio.run(main())
```

## Running the Example

```bash
python llm_tracking_example.py
```

## Sample JSONL Output

```json
{"event_type": "llm.request.start", "metadata": {"agent_id": "llm-tracking-example", "severity": "debug"}, "payload": {"model_name": "gpt-4", "prompt": "What is machine learning...", "system_prompt": "You are a helpful AI teacher."}}
{"event_type": "llm.response.received", "metadata": {"agent_id": "llm-tracking-example", "severity": "info"}, "payload": {"model_name": "gpt-4", "prompt": "What is machine learning...", "response": "Response to: What is...", "input_tokens": 10, "output_tokens": 5, "total_tokens": 15, "latency_ms": 105}}
{"event_type": "llm.error", "metadata": {"agent_id": "llm-tracking-example", "severity": "error"}, "payload": {"model_name": "gpt-4", "prompt": "This will fail", "error": "Rate limit exceeded"}}
```

## Integration Patterns

### With OpenAI

```python
import openai

async def call_openai_with_tracking(transparency, prompt: str) -> str:
    await transparency.log_llm_request_start("gpt-4", prompt)
    start = time.time()

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )

        await transparency.log_llm_response(
            model_name="gpt-4",
            prompt=prompt,
            response=response.choices[0].message.content,
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            latency_ms=int((time.time() - start) * 1000)
        )

        return response.choices[0].message.content

    except Exception as e:
        await transparency.log_llm_error("gpt-4", str(e), prompt)
        raise
```

### With LangChain

```python
from langchain.callbacks.base import BaseCallbackHandler

class TransparencyCallback(BaseCallbackHandler):
    def __init__(self, transparency):
        self.transparency = transparency
        self.start_time = None

    def on_llm_start(self, serialized, prompts, **kwargs):
        self.start_time = time.time()
        asyncio.create_task(
            self.transparency.log_llm_request_start(
                model_name=serialized.get("name", "unknown"),
                prompt=prompts[0]
            )
        )

    def on_llm_end(self, response, **kwargs):
        asyncio.create_task(
            self.transparency.log_llm_response(
                model_name="llm",
                prompt="",
                response=response.generations[0][0].text,
                latency_ms=int((time.time() - self.start_time) * 1000)
            )
        )
```

## Next Steps

- [Error Handling](/examples/error-handling) - Handle and recover from errors
- [Custom Events](/examples/custom-events) - Create custom event types
- [LLM Tracking Guide](/guide/llm-tracking) - Detailed guide
