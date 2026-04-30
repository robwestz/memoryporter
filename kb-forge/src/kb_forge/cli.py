"""CLI for KB-Forge."""

import typer

app = typer.Typer(help="KB-Forge: Knowledge Base Forge")


@app.callback()
def main():
    """KB-Forge CLI — Scrape, index, and query documentation."""
    pass


if __name__ == "__main__":
    app()
