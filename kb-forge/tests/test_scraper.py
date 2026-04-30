"""Tests for scraper module."""

import pytest
from pathlib import Path
from kb_forge.scraper import Scraper, ScrapeScope, InvalidURLError


class TestScraper:
    """Test Scraper class."""

    def test_scraper_initialization(self):
        """Test scraper can be initialized."""
        scraper = Scraper()
        assert scraper is not None
        assert scraper.mcp_tool == "firecrawl"

    def test_scraper_initialization_custom_tool(self):
        """Test scraper with custom MCP tool."""
        scraper = Scraper(mcp_tool="tavily")
        assert scraper.mcp_tool == "tavily"

    def test_scrape_scope_enum(self):
        """Test ScrapeScope enum values."""
        assert ScrapeScope.SINGLE == "single"
        assert ScrapeScope.SECTION == "section"
        assert ScrapeScope.FULL == "full"

    def test_scrape_single_url(self):
        """Test scraping a single URL."""
        scraper = Scraper()
        result = scraper.scrape("https://example.com/docs")

        assert result["url"] == "https://example.com/docs"
        assert "content" in result
        assert result["scope"] == "single"
        assert result["saved_path"] is None

    def test_scrape_with_output_dir(self, tmp_path):
        """Test scraping with output directory."""
        scraper = Scraper()
        result = scraper.scrape(
            "https://example.com/docs",
            scope=ScrapeScope.SINGLE,
            output_dir=tmp_path
        )

        assert result["saved_path"] is not None
        assert Path(result["saved_path"]).exists()
        assert Path(result["saved_path"]).read_text() == result["content"]

    def test_scrape_invalid_url_no_protocol(self):
        """Test scraping URL without protocol."""
        scraper = Scraper()
        with pytest.raises(InvalidURLError, match="http:// or https://"):
            scraper.scrape("example.com/docs")

    def test_scrape_invalid_url_format(self):
        """Test scraping malformed URL."""
        scraper = Scraper()
        with pytest.raises(InvalidURLError):
            scraper.scrape("https://invalid url with spaces")

    def test_scrape_batch(self):
        """Test batch scraping."""
        scraper = Scraper()
        urls = [
            "https://example.com/page1",
            "https://example.com/page2"
        ]
        results = scraper.scrape_batch(urls, scope=ScrapeScope.SINGLE)

        assert len(results) == 2
        for result in results:
            assert "url" in result
            assert "content" in result
            assert "scope" in result

    def test_scrape_batch_with_output_dir(self, tmp_path):
        """Test batch scraping with output directory."""
        scraper = Scraper()
        urls = [
            "https://example.com/page1",
            "https://example.com/page2"
        ]
        results = scraper.scrape_batch(urls, output_dir=tmp_path)

        assert len(results) == 2
        for result in results:
            assert result["saved_path"] is not None
            assert Path(result["saved_path"]).exists()

    def test_scrape_different_scopes(self):
        """Test scraping with different scopes."""
        scraper = Scraper()

        for scope in [ScrapeScope.SINGLE, ScrapeScope.SECTION, ScrapeScope.FULL]:
            result = scraper.scrape("https://example.com/docs", scope=scope)
            assert result["scope"] == scope.value
