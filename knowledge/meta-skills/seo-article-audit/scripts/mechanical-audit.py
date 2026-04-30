#!/usr/bin/env python3
"""
mechanical-audit.py — Layer 1 mechanical checks for SEO backlink articles.

Usage:
    python mechanical-audit.py <article_file> \\
        --anchor "anchor text here" \\
        --target "https://target.com/page" \\
        --publisher "publisherdomain.com" \\
        [--language sv|en] \\
        [--entities "entity1,entity2,entity3,entity4"]

Output:
    Prints the Layer 1 results table to stdout.
    Exits 0 if all applicable checks pass, 1 if any fail.

Notes:
    - Self-contained: does not require article_validator.py from BACOWR
    - Does not perform Layer 2 (editorial audit requires LLM judgment)
    - Does not fetch or verify trustlink URLs — structural checks only
"""

import argparse
import re
import sys
from urllib.parse import urlparse


# ---------------------------------------------------------------------------
# 23 Forbidden AI phrases (Check 8)
# ---------------------------------------------------------------------------
FORBIDDEN_PHRASES = [
    "i en värld där",
    "det är viktigt att notera",
    "det är värt att notera",
    "i denna artikel kommer vi att",
    "denna artikel utforskar",
    "sammanfattningsvis kan sägas",
    "sammanfattningsvis",
    "låt oss utforska",
    "i dagens digitala värld",
    "i dagens läge",
    "det har blivit allt viktigare",
    "har du någonsin undrat",
    "i den här guiden",
    "vi kommer att titta på",
    "i slutändan",
    "det råder ingen tvekan om",
    "utan tvekan",
    "faktum är att",
    "det bör noteras att",
    "det kan konstateras att",
    "i takt med att",
    "i denna text",
    "i denna artikel",
]

# Swedish / English stop words for language detection (Check 9)
SV_STOP_WORDS = {
    "och", "att", "det", "som", "är", "en", "av", "för", "på",
    "med", "till", "den", "har", "de", "inte", "om", "ett",
    "men", "var", "sig", "så", "kan", "man", "vi", "nu",
}
EN_STOP_WORDS = {
    "the", "and", "that", "this", "is", "in", "of", "to", "for",
    "with", "are", "on", "at", "be", "by", "from", "have", "it",
    "not", "or", "an", "was", "but", "they", "which", "you",
}


# ---------------------------------------------------------------------------
# Text utilities
# ---------------------------------------------------------------------------

def strip_markdown(text: str) -> str:
    """
    Strip markdown formatting for word counting.
    - Remove heading markers: #, ##, ###, etc.
    - Remove bold/italic markers: **, *, __, _
    - Keep link text, remove URL: [text](url) → text
    - Remove image syntax: ![alt](url) → ''
    - Remove inline code backticks but keep content
    - Remove blockquote markers: >
    """
    # Remove images first (before link handling)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Keep link text, remove URL
    text = re.sub(r'\[([^\]]*)\]\([^\)]*\)', r'\1', text)
    # Remove heading markers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bold/italic
    text = re.sub(r'\*{1,3}|_{1,3}', '', text)
    # Remove inline code backticks but keep content
    text = re.sub(r'`([^`]*)`', r'\1', text)
    # Remove blockquotes
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    return text


def count_words(stripped: str) -> int:
    return len(stripped.split())


def get_stripped_words(stripped: str) -> list[str]:
    return stripped.split()


def extract_links(text: str) -> list[tuple[str, str, int]]:
    """
    Return list of (link_text, url, char_position) for every markdown link.
    Includes anchor links and trustlinks.
    """
    links = []
    for m in re.finditer(r'\[([^\]]*)\]\(([^\)]*)\)', text):
        links.append((m.group(1), m.group(2), m.start()))
    return links


def domain_of(url: str) -> str:
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return url.lower()


def is_subdomain_of(domain: str, parent: str) -> bool:
    """True if domain equals parent or is a subdomain of parent."""
    domain = domain.lower().strip()
    parent = parent.lower().strip()
    return domain == parent or domain.endswith("." + parent)


# ---------------------------------------------------------------------------
# Individual checks
# ---------------------------------------------------------------------------

def check_word_count(stripped: str) -> dict:
    n = count_words(stripped)
    passed = 750 <= n <= 900
    note = ""
    if n < 750:
        note = f"add ~{750 - n} words"
    elif n > 900:
        note = f"remove ~{n - 900} words"
    return {
        "id": 1,
        "name": "Word count",
        "passed": passed,
        "value": f"{n} words",
        "expected": "750–900",
        "note": note,
    }


def check_anchor_present(text: str, anchor_text: str, target_url: str) -> dict:
    pattern = re.escape(f"[{anchor_text}]({target_url})")
    matches = re.findall(pattern, text)
    n = len(matches)
    passed = n >= 1
    return {
        "id": 2,
        "name": "Anchor present",
        "passed": passed,
        "value": f"{n} found",
        "expected": "≥ 1",
        "note": "" if passed else "exact [anchor](url) string not found",
    }


def check_anchor_count(text: str, anchor_text: str, target_url: str) -> dict:
    pattern = re.escape(f"[{anchor_text}]({target_url})")
    matches = re.findall(pattern, text)
    n = len(matches)
    passed = n == 1
    return {
        "id": 3,
        "name": "Anchor count",
        "passed": passed,
        "value": str(n),
        "expected": "exactly 1",
        "note": "" if passed else f"found {n} occurrences — must be exactly 1",
    }


def check_anchor_position(text: str, stripped: str, anchor_text: str, target_url: str) -> dict:
    """
    Find the word position (1-based) of the anchor text in stripped text.
    The anchor text in stripped form = just the link text.
    Strategy: find char position in raw text, then count words up to that point.
    """
    pattern = re.escape(f"[{anchor_text}]({target_url})")
    m = re.search(pattern, text)
    if m is None:
        return {
            "id": 4,
            "name": "Anchor position",
            "passed": False,
            "value": "N/A",
            "expected": "word 250–550",
            "note": "anchor not found",
        }

    # Count words in stripped text up to where the anchor appears.
    # Approximate: strip text before the anchor char position, count words.
    text_before_anchor = text[:m.start()]
    stripped_before = strip_markdown(text_before_anchor)
    word_pos = len(stripped_before.split()) + 1  # 1-based

    passed = 250 <= word_pos <= 550
    note = ""
    if word_pos < 250:
        note = f"too early (word {word_pos}), move anchor later"
    elif word_pos > 550:
        note = f"too late (word {word_pos}), move anchor earlier"

    return {
        "id": 4,
        "name": "Anchor position",
        "passed": passed,
        "value": f"word {word_pos}",
        "expected": "250–550",
        "note": note,
    }


def check_trust_links(
    text: str,
    anchor_text: str,
    target_url: str,
    publisher_domain: str,
) -> dict:
    target_domain = domain_of(target_url)
    all_links = extract_links(text)

    # Find anchor char position
    anchor_pattern = re.escape(f"[{anchor_text}]({target_url})")
    anchor_match = re.search(anchor_pattern, text)
    anchor_pos = anchor_match.start() if anchor_match else len(text)

    issues = []
    valid_count = 0
    checked = []

    for link_text, url, char_pos in all_links:
        full_link = f"[{link_text}]({url})"
        # Skip the anchor link itself
        if url == target_url and link_text == anchor_text:
            continue

        link_domain = domain_of(url)

        # Collect all non-anchor links for reporting
        link_issues = []
        if is_subdomain_of(link_domain, target_domain):
            link_issues.append(f"links to target domain ({link_domain})")
        if is_subdomain_of(link_domain, publisher_domain):
            link_issues.append(f"links to publisher domain ({link_domain})")
        if char_pos > anchor_pos:
            link_issues.append("appears after anchor")

        if link_issues:
            issues.append(f'"{link_text}" ({url}): {"; ".join(link_issues)}')
        else:
            valid_count += 1

    passed = 1 <= valid_count <= 2 and len(issues) == 0
    note = "; ".join(issues) if issues else ""
    if valid_count == 0 and not issues:
        note = "no valid trustlinks found"
        passed = False
    elif valid_count > 2:
        note = f"{valid_count} valid trustlinks found (max 2)"
        passed = False

    return {
        "id": 5,
        "name": "Trust links",
        "passed": passed,
        "value": f"{valid_count} valid",
        "expected": "1–2",
        "note": note,
    }


def check_no_bullets(text: str) -> dict:
    # Match list markers at line start: -, *, •, or numbered (1.)
    bullet_lines = re.findall(
        r'^\s*(?:[-*•]|\d+\.)\s+\S',
        text,
        flags=re.MULTILINE,
    )
    n = len(bullet_lines)
    passed = n == 0
    return {
        "id": 6,
        "name": "No bullets",
        "passed": passed,
        "value": f"{n} found",
        "expected": "0",
        "note": "" if passed else f"{n} list marker(s) at line start",
    }


def check_headings(text: str) -> dict:
    headings = re.findall(r'^#{1,6}\s+\S', text, flags=re.MULTILINE)
    n = len(headings)
    passed = n <= 1
    note = ""
    if n > 1:
        note = f"{n} headings found (title = 1 allowed, {n - 1} extra)"
    return {
        "id": 7,
        "name": "Headings",
        "passed": passed,
        "value": f"{n} found",
        "expected": "≤ 1",
        "note": note,
    }


def check_forbidden_phrases(text: str) -> dict:
    text_lower = text.lower()
    found = []
    for phrase in FORBIDDEN_PHRASES:
        if phrase in text_lower:
            found.append(phrase)
    n = len(found)
    passed = n == 0
    return {
        "id": 8,
        "name": "Forbidden phrases",
        "passed": passed,
        "value": f"{n} found",
        "expected": "0",
        "note": "; ".join(f'"{p}"' for p in found) if found else "",
    }


def check_language(text: str, expected: str) -> dict:
    words = set(re.findall(r'\b\w+\b', text.lower()))
    sv_hits = len(words & SV_STOP_WORDS)
    en_hits = len(words & EN_STOP_WORDS)
    detected = "sv" if sv_hits >= en_hits else "en"
    passed = detected == expected
    return {
        "id": 9,
        "name": "Language",
        "passed": passed,
        "value": detected,
        "expected": expected,
        "note": "" if passed else f"detected {detected}, expected {expected} (sv:{sv_hits} en:{en_hits})",
    }


def check_serp_entities(text: str, entities: list[str]) -> dict:
    if not entities:
        return {
            "id": 10,
            "name": "SERP entities",
            "passed": True,
            "value": "SKIP",
            "expected": "≥ 4",
            "note": "no entities provided",
        }
    text_lower = text.lower()
    found = []
    missing = []
    for entity in entities:
        if entity.lower() in text_lower:
            found.append(entity)
        else:
            missing.append(entity)
    n = len(found)
    passed = n >= 4
    note = ""
    if not passed:
        note = f"missing: {', '.join(missing)}"
    return {
        "id": 10,
        "name": "SERP entities",
        "passed": passed,
        "value": f"{n} of {len(entities)}",
        "expected": "≥ 4",
        "note": note,
    }


def check_paragraphs(text: str) -> dict:
    """
    Count non-empty paragraph blocks separated by blank lines.
    Heading-only blocks (line that starts with # and has no other content) are excluded.
    """
    blocks = re.split(r'\n\s*\n', text.strip())
    count = 0
    for block in blocks:
        stripped_block = block.strip()
        if not stripped_block:
            continue
        # Exclude heading-only blocks
        if re.match(r'^#{1,6}\s+\S.*$', stripped_block) and '\n' not in stripped_block:
            continue
        count += 1
    passed = count >= 4
    return {
        "id": 11,
        "name": "Paragraphs",
        "passed": passed,
        "value": f"{count}",
        "expected": "≥ 4",
        "note": "" if passed else f"only {count} paragraph(s) found",
    }


# ---------------------------------------------------------------------------
# Report rendering
# ---------------------------------------------------------------------------

def print_table(results: list[dict], article_path: str) -> None:
    print(f"\n{'='*70}")
    print(f"Layer 1 — Mechanical Audit: {article_path}")
    print(f"{'='*70}")

    header = f"{'#':<4} {'Check':<22} {'Status':<8} {'Value':<18} {'Expected':<12} Note"
    print(header)
    print("-" * 80)

    all_pass = True
    for r in results:
        status = "PASS" if r["passed"] else ("SKIP" if r["value"] == "SKIP" else "FAIL")
        if status == "FAIL":
            all_pass = False
        note = r["note"] or ""
        print(
            f"{r['id']:<4} {r['name']:<22} {status:<8} {r['value']:<18} {r['expected']:<12} {note}"
        )

    print("-" * 80)
    pass_count = sum(1 for r in results if r["passed"])
    skip_count = sum(1 for r in results if r["value"] == "SKIP")
    fail_count = len(results) - pass_count - skip_count

    verdict = "APPROVED" if fail_count == 0 else f"REJECTED — {fail_count} check(s) failed"
    print(f"\nLayer 1 Result: {pass_count}/11 PASS — {verdict}")
    if skip_count:
        print(f"  ({skip_count} check(s) skipped: no SERP entities provided)")
    print()


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Layer 1 mechanical audit for SEO backlink articles."
    )
    parser.add_argument("article_file", help="Path to the article markdown file")
    parser.add_argument("--anchor", required=True, help="Exact anchor text from job spec")
    parser.add_argument("--target", required=True, help="Full URL of anchor destination")
    parser.add_argument("--publisher", required=True, help="Publisher domain (no www)")
    parser.add_argument("--language", default="sv", choices=["sv", "en"], help="Expected language (default: sv)")
    parser.add_argument("--entities", default="", help="Comma-separated SERP entity list")

    args = parser.parse_args()

    try:
        with open(args.article_file, encoding="utf-8") as f:
            text = f.read()
    except FileNotFoundError:
        print(f"Error: file not found: {args.article_file}", file=sys.stderr)
        return 2
    except OSError as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        return 2

    entities = [e.strip() for e in args.entities.split(",") if e.strip()] if args.entities else []
    stripped = strip_markdown(text)

    results = [
        check_word_count(stripped),
        check_anchor_present(text, args.anchor, args.target),
        check_anchor_count(text, args.anchor, args.target),
        check_anchor_position(text, stripped, args.anchor, args.target),
        check_trust_links(text, args.anchor, args.target, args.publisher),
        check_no_bullets(text),
        check_headings(text),
        check_forbidden_phrases(text),
        check_language(text, args.language),
        check_serp_entities(text, entities),
        check_paragraphs(text),
    ]

    print_table(results, args.article_file)

    all_pass = all(r["passed"] for r in results)
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
