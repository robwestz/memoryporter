"""Web scraper using Firecrawl/Tavily MCP."""

from enum import Enum
from typing import Dict, List, Optional
from pathlib import Path
import json
import re


class ScrapeScope(str, Enum):
    """Scraping scope options."""
    SINGLE = "single"
    SECTION = "section"
    FULL = "full"


class ScraperError(Exception):
    """Base exception for scraper errors."""
    pass


class InvalidURLError(ScraperError):
    """Raised when URL is invalid."""
    pass


class Scraper:
    """Scrape documentation from URLs."""

    def __init__(self, mcp_tool: str = "firecrawl"):
        """Initialize scraper.

        Args:
            mcp_tool: Which MCP tool to use (firecrawl or tavily)
        """
        self.mcp_tool = mcp_tool

    def _validate_url(self, url: str) -> None:
        """Validate URL format.

        Args:
            url: URL to validate

        Raises:
            InvalidURLError: If URL is invalid
        """
        # Basic URL validation
        if not url.startswith(("http://", "https://")):
            raise InvalidURLError(f"URL must start with http:// or https://: {url}")

        # Check for valid URL pattern
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, url, re.IGNORECASE):
            raise InvalidURLError(f"Invalid URL format: {url}")

    def _call_mcp(self, url: str, scope: str) -> str:
        """Call MCP tool to scrape URL.

        Args:
            url: URL to scrape
            scope: single, section, or full

        Returns:
            Scraped content as markdown

        Note:
            This is a placeholder. Real implementation uses MCP in Task 10.
            For now, returns mock content for testing.
        """
        # PLACEHOLDER: Real MCP integration in Task 10
        # For now, simulate by returning a mock response
        # This allows testing the flow without MCP server
        return f"# Mock content for {url}\n\nThis is placeholder content for {scope} scope."

    def scrape(
        self,
        url: str,
        scope: ScrapeScope = ScrapeScope.SINGLE,
        output_dir: Optional[Path] = None
    ) -> Dict:
        """Scrape content from URL.

        Args:
            url: Target URL to scrape
            scope: SINGLE, SECTION, or FULL
            output_dir: Where to save raw content

        Returns:
            Dict with url, content, scope, and saved path

        Raises:
            InvalidURLError: If URL is invalid
        """
        # Validate URL
        self._validate_url(url)

        # Call MCP (placeholder)
        content = self._call_mcp(url, scope.value)

        # Build result
        result = {
            "url": url,
            "content": content,
            "scope": scope.value,
            "saved_path": None
        }

        # Save to file if output_dir provided
        if output_dir:
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)

            # Generate safe filename from URL
            safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_")[:100]
            file_path = output_dir / f"{safe_name}.md"

            file_path.write_text(content, encoding="utf-8")
            result["saved_path"] = str(file_path)

        return result

    def scrape_batch(
        self,
        urls: List[str],
        scope: ScrapeScope = ScrapeScope.SINGLE,
        output_dir: Optional[Path] = None
    ) -> List[Dict]:
        """Scrape multiple URLs.

        Args:
            urls: List of URLs to scrape
            scope: SINGLE, SECTION, or FULL
            output_dir: Where to save raw content

        Returns:
            List of scrape results

        Raises:
            InvalidURLError: If any URL is invalid
        """
        results = []
        for url in urls:
            result = self.scrape(url, scope, output_dir)
            results.append(result)
        return results
