"""KB-Forge agent system.

Multi-agent GAN-style harness for autonomous KB building.
"""

from .kb_builder_harness.harness import KBBuilderHarness, HarnessResult

__all__ = ["KBBuilderHarness", "HarnessResult"]
