# KB-Forge UI

Web interface for KB-Forge knowledge base management.

## Quick Start

```bash
cd kb-forge/ui
python main.py
```

Open http://localhost:8000 in your browser.

## Features

- **Scrape**: Extract content from URLs into knowledge bases
- **Query**: Search KBs with semantic queries
- **Build**: Autonomous KB building with GAN harness
- **Manage**: View and organize all your knowledge bases

## API

See `api_spec.yaml` for complete API documentation.

## Development

```bash
# Install dependencies
pip install fastapi uvicorn

# Run with hot reload
python main.py

# Or directly with uvicorn
uvicorn main:app --reload
```

## File Structure

```
ui/
├── server.py           # FastAPI backend
├── main.py            # Entry point
├── api_spec.yaml      # API specification
├── design.md          # UI design document
├── static/
│   ├── style.css      # All styles
│   └── app.js         # Frontend JavaScript
└── templates/
    └── index.html     # Main HTML template
```
