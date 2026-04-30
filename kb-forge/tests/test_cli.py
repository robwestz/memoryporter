"""Tests for CLI."""

import pytest
from typer.testing import CliRunner
from kb_forge.cli import app


runner = CliRunner()


class TestCLI:
    """Test CLI commands."""

    def test_cli_help(self):
        """Test CLI help works."""
        result = runner.invoke(app, ["--help"])
        assert result.exit_code == 0
        assert "KB-Forge" in result.output

    def test_scrape_help(self):
        """Test scrape command help."""
        result = runner.invoke(app, ["scrape", "--help"])
        assert result.exit_code == 0
        assert "URL" in result.output

    def test_list_help(self):
        """Test list command help."""
        result = runner.invoke(app, ["list-kbs", "--help"])
        assert result.exit_code == 0

    def test_query_help(self):
        """Test query command help."""
        result = runner.invoke(app, ["query", "--help"])
        assert result.exit_code == 0
        assert "--kb" in result.output

    def test_list_empty(self, tmp_path, monkeypatch):
        """Test list with no KBs."""
        # Mock storage path
        from kb_forge import storage
        original_init = storage.StorageManager.__init__
        
        def mock_init(self, base_path=None):
            self.base_path = tmp_path
            self.base_path.mkdir(parents=True, exist_ok=True)
        
        monkeypatch.setattr(storage.StorageManager, "__init__", mock_init)
        
        result = runner.invoke(app, ["list-kbs"])
        assert result.exit_code == 0
        assert "No knowledge bases found" in result.output
