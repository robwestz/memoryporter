"""Tests for GAN-style harness."""

import pytest
from pathlib import Path
from kb_forge.agents.kb_builder_harness.harness import KBBuilderHarness, HarnessResult


class TestHarness:
    """Test harness functionality."""

    def test_harness_loads_config(self, tmp_path):
        """Test harness loads configuration."""
        # Create minimal config
        config_path = tmp_path / "config.yaml"
        config_path.write_text("""
max_iterations: 5
pass_threshold: 7.0
planner:
  model: opus
  prompt_file: planner_agent.md
generator:
  model: opus
  prompt_file: generator_agent.md
evaluator:
  model: opus
  prompt_file: evaluator_agent.md
  criteria:
    - coverage
output:
  feedback_dir: ./feedback
  manifest_dir: ./manifests
  progress_log: ./progress.log
""")

        harness = KBBuilderHarness(config_path)
        assert harness.config["max_iterations"] == 5
        assert harness.config["pass_threshold"] == 7.0

    def test_run_planner_simple_request(self, tmp_path):
        """Test planner parses simple requests."""
        config_path = tmp_path / "config.yaml"
        config_path.write_text("""
max_iterations: 5
pass_threshold: 7.0
planner:
  model: opus
  prompt_file: planner_agent.md
generator:
  model: opus
  prompt_file: generator_agent.md
evaluator:
  model: opus
  prompt_file: evaluator_agent.md
output:
  feedback_dir: ./feedback
  manifest_dir: ./manifests
  progress_log: ./progress.log
""")

        harness = KBBuilderHarness(config_path)
        spec = harness._run_planner("Devin docs from https://docs.devin.ai")

        assert spec["kb_name"] == "devin-docs"
        assert spec["sources"][0]["url"] == "https://docs.devin.ai"

    def test_run_planner_url_only(self, tmp_path):
        """Test planner extracts name from URL."""
        config_path = tmp_path / "config.yaml"
        config_path.write_text("""
max_iterations: 5
pass_threshold: 7.0
planner:
  model: opus
  prompt_file: planner_agent.md
generator:
  model: opus
  prompt_file: generator_agent.md
evaluator:
  model: opus
  prompt_file: evaluator_agent.md
output:
  feedback_dir: ./feedback
  manifest_dir: ./manifests
  progress_log: ./progress.log
""")

        harness = KBBuilderHarness(config_path)
        spec = harness._run_planner("https://example.com/docs")

        assert "example.com" in spec["kb_name"]
        assert spec["sources"][0]["url"] == "https://example.com/docs"

    def test_feedback_directory_created(self, tmp_path):
        """Test feedback directory is created on init."""
        config_path = tmp_path / "config.yaml"
        config_path.write_text("""
max_iterations: 5
pass_threshold: 7.0
planner:
  model: opus
  prompt_file: planner_agent.md
generator:
  model: opus
  prompt_file: generator_agent.md
evaluator:
  model: opus
  prompt_file: evaluator_agent.md
output:
  feedback_dir: {tmp_path}/feedback
  manifest_dir: {tmp_path}/manifests
  progress_log: ./progress.log
""".format(tmp_path=tmp_path))

        harness = KBBuilderHarness(config_path)
        assert harness.feedback_dir.exists()
