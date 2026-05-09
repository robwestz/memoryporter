"""Unit tests for wapt.cli_core skeleton — help, subcommand stubs, --json flag."""
from __future__ import annotations

from typer.testing import CliRunner

from wapt.cli_core import app

runner = CliRunner()


class TestHelp:
    def test_root_help(self):
        result = runner.invoke(app, ["--help"])
        assert result.exit_code == 0
        assert "wapt" in result.output.lower()

    def test_no_args_shows_help(self):
        result = runner.invoke(app, [])
        # no_args_is_help=True: Click returns exit 2 (UsageError) and prints help.
        assert result.exit_code in (0, 2)
        assert "wapt" in result.output.lower() or "usage" in result.output.lower()

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


class TestSubcommandSmoke:
    """With no config, list/health exit 5 (InvalidConfig) — correct prod
    behavior, not a crash. init writes config and is idempotent."""

    def test_list_exits_cleanly_without_config(self, monkeypatch, tmp_path):
        monkeypatch.setattr(
            "wapt.cli_core.DEFAULT_CONFIG_PATH", tmp_path / "missing.toml"
        )
        result = runner.invoke(app, ["list"])
        assert result.exit_code == 5  # InvalidConfig

    def test_health_exits_cleanly_without_config(self, monkeypatch, tmp_path):
        monkeypatch.setattr(
            "wapt.cli_core.DEFAULT_CONFIG_PATH", tmp_path / "missing.toml"
        )
        result = runner.invoke(app, ["health"])
        assert result.exit_code == 5

    def test_doctor_runs(self):
        # doctor is still a stub (Phase 3) — does not need config yet.
        result = runner.invoke(app, ["doctor"])
        assert result.exit_code == 0

    def test_init_writes_config(self, monkeypatch, tmp_path):
        cfg = tmp_path / "config.toml"
        monkeypatch.setattr("wapt.cli_core.DEFAULT_CONFIG_PATH", cfg)
        result = runner.invoke(app, ["init"])
        assert result.exit_code == 0
        assert cfg.exists()

    def test_init_skips_when_exists(self, monkeypatch, tmp_path):
        cfg = tmp_path / "config.toml"
        cfg.write_text("# pre-existing\n", encoding="utf-8")
        monkeypatch.setattr("wapt.cli_core.DEFAULT_CONFIG_PATH", cfg)
        result = runner.invoke(app, ["init"])
        assert result.exit_code == 0
        assert "already exists" in result.output.lower()

    def test_init_force_overwrites(self, monkeypatch, tmp_path):
        cfg = tmp_path / "config.toml"
        cfg.write_text("# old content\n", encoding="utf-8")
        monkeypatch.setattr("wapt.cli_core.DEFAULT_CONFIG_PATH", cfg)
        result = runner.invoke(app, ["init", "--force"])
        assert result.exit_code == 0
        assert "[paths]" in cfg.read_text(encoding="utf-8")
