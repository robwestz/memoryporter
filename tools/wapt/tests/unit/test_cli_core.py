"""Unit tests for wapt.cli_core skeleton — help, subcommand stubs, --json flag."""
from __future__ import annotations

import pytest
from typer.testing import CliRunner

from wapt.cli_core import app

runner = CliRunner(mix_stderr=False)


class TestHelp:
    def test_root_help(self):
        result = runner.invoke(app, ["--help"])
        assert result.exit_code == 0
        assert "wapt" in result.output.lower()

    def test_no_args_shows_help(self):
        result = runner.invoke(app, [])
        assert result.exit_code == 0

    def test_add_help(self):
        result = runner.invoke(app, ["add", "--help"])
        assert result.exit_code == 0
        assert "add" in result.output.lower()

    def test_remove_help(self):
        result = runner.invoke(app, ["remove", "--help"])
        assert result.exit_code == 0

    def test_list_help(self):
        result = runner.invoke(app, ["list", "--help"])
        assert result.exit_code == 0

    def test_init_help(self):
        result = runner.invoke(app, ["init", "--help"])
        assert result.exit_code == 0

    def test_doctor_help(self):
        result = runner.invoke(app, ["doctor", "--help"])
        assert result.exit_code == 0

    def test_health_help(self):
        result = runner.invoke(app, ["health", "--help"])
        assert result.exit_code == 0


class TestJsonFlag:
    def test_json_flag_accepted_at_root(self):
        """--json flag must be accepted without error at the root level."""
        result = runner.invoke(app, ["--json", "--help"])
        assert result.exit_code == 0

    def test_unknown_flag_exits_nonzero(self):
        result = runner.invoke(app, ["--nonexistent-flag"])
        assert result.exit_code != 0


class TestSubcommandStubs:
    """Stub subcommands should be reachable without crashing."""

    def test_list_runs(self):
        result = runner.invoke(app, ["list"])
        assert result.exit_code == 0

    def test_doctor_runs(self):
        result = runner.invoke(app, ["doctor"])
        assert result.exit_code == 0

    def test_health_runs(self):
        result = runner.invoke(app, ["health"])
        assert result.exit_code == 0

    def test_init_runs(self):
        result = runner.invoke(app, ["init"])
        assert result.exit_code == 0
