"""Tests for scraper module."""

import pytest
from kb_forge.scraper import Scraper, ScrapeScope


class TestScraper:
    """Test Scraper class."""

    def test_scraper_initialization(self):
        """Test scraper can be initialized."""
        scraper = Scraper()
        assert scraper is not None
        assert scraper.mcp_tool == "firecrawl"

    def test_scrape_scope_enum(self):
        """Test ScrapeScope enum values."""
        assert ScrapeScope.SINGLE == "single"
        assert ScrapeScope.SECTION == "section"
        assert ScrapeScope.FULL == "full"
