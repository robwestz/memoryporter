"""Tests for MCP server."""

import pytest
from kb_forge.mcp_server import mcp


class TestMCPServer:
    """Test MCP server tools."""

    def test_mcp_server_exists(self):
        """Test MCP server can be imported."""
        assert mcp is not None
        assert mcp.name == "kb-forge"

    def test_kb_list_tool(self, tmp_path, monkeypatch):
        """Test kb_list tool."""
        # Mock storage path
        from kb_forge import storage
        original_init = storage.StorageManager.__init__
        
        def mock_init(self, base_path=None):
            self.base_path = tmp_path
            self.base_path.mkdir(parents=True, exist_ok=True)
        
        monkeypatch.setattr(storage.StorageManager, "__init__", mock_init)
        
        from kb_forge.mcp_server import kb_list
        result = kb_list()
        
        assert result["count"] == 0
        assert result["knowledge_bases"] == {}

    def test_kb_query_not_found(self, tmp_path, monkeypatch):
        """Test kb_query with non-existent KB."""
        from kb_forge import storage
        
        def mock_init(self, base_path=None):
            self.base_path = tmp_path
            self.base_path.mkdir(parents=True, exist_ok=True)
        
        monkeypatch.setattr(storage.StorageManager, "__init__", mock_init)
        
        from kb_forge.mcp_server import kb_query
        result = kb_query("nonexistent", "test question")
        
        assert result["status"] == "error"
        assert "not found" in result["error"]
