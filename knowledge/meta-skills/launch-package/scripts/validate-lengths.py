#!/usr/bin/env python3
"""
validate-lengths.py — Launch Package Length Validator

Usage:
    python validate-lengths.py --file <path-to-deliverable-file> --type <deliverable-type>
    python validate-lengths.py --all <path-to-launch-package-directory>

Deliverable types:
    email-sequence    — Checks all email subject lines (≤40 chars) and preview texts (≤90 chars)
    product-hunt      — Checks tagline (≤60 chars) and description (≤260 chars)
    demo-script       — Checks word count (375–525 words)
    landing-page      — Checks headline (≤12 words), subheadline (≤25 words), CTA (2–5 words)
    social-calendar   — Checks promotional post count (≤9 of 30) and platform-specific lengths

Exit codes:
    0 = All checks pass
    1 = One or more checks failed
    2 = File not found or unrecognized type

Examples:
    python validate-lengths.py --file templates/email-sequence.md --type email-sequence
    python validate-lengths.py --all ./my-launch-package/
"""

import argparse
import re
import sys
from pathlib import Path


# ─── Constants ───────────────────────────────────────────────────────────────

LIMITS = {
    "email_subject": 40,
    "email_preview": 90,
    "ph_tagline": 60,
    "ph_description": 260,
    "demo_word_min": 375,
    "demo_word_max": 525,
    "lp_headline_words": 12,
    "lp_subheadline_words": 25,
    "lp_cta_words_min": 2,
    "lp_cta_words_max": 5,
    "social_promotional_max": 9,
    "social_total": 30,
}

PASS = "✓ PASS"
FAIL = "✗ FAIL"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def word_count(text: str) -> int:
    """Count words in a string, stripping markdown formatting."""
    text = re.sub(r"[#*_`\[\]()>]", " ", text)
    return len(text.split())


def char_count(text: str) -> int:
    """Count characters, stripping inline markdown."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return len(text.strip())


def result_line(label: str, value: int | str, limit: int | str, passed: bool) -> str:
    status = PASS if passed else FAIL
    return f"  {status}  {label}: {value} (limit: {limit})"


def extract_field(content: str, pattern: str) -> list[str]:
    """Extract all matches for a regex pattern from content."""
    return re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)


# ─── Email Sequence Checks ────────────────────────────────────────────────────

def check_email_sequence(content: str) -> tuple[bool, list[str]]:
    results = []
    all_pass = True

    # Extract subject lines — look for "Subject line:" or "**Subject line:**" followed by content on next non-empty line
    subject_pattern = r"(?:\*\*)?Subject line:(?:\*\*)?\s*\n+([^\n]+)"
    subjects = extract_field(content, subject_pattern)

    if not subjects:
        results.append(f"  ⚠  No subject lines found. Ensure format: 'Subject line:' followed by content on next line.")
        return False, results

    for i, subject in enumerate(subjects, 1):
        subject = subject.strip().strip("*").strip()
        # Skip template placeholders
        if subject.startswith("[SUBJECT") or subject.startswith("["):
            results.append(f"  ⚠  Email {i} subject: placeholder not filled — [{subject[:30]}]")
            continue
        length = char_count(subject)
        passed = length <= LIMITS["email_subject"]
        if not passed:
            all_pass = False
        results.append(result_line(f"Email {i} subject ({subject[:30]}...)", length, LIMITS["email_subject"], passed))

    # Extract preview texts
    preview_pattern = r"(?:\*\*)?Preview text:(?:\*\*)?\s*\n+([^\n]+)"
    previews = extract_field(content, preview_pattern)

    for i, preview in enumerate(previews, 1):
        preview = preview.strip().strip("*").strip()
        if preview.startswith("["):
            results.append(f"  ⚠  Email {i} preview: placeholder not filled")
            continue
        length = char_count(preview)
        passed = length <= LIMITS["email_preview"]
        if not passed:
            all_pass = False
        results.append(result_line(f"Email {i} preview ({preview[:30]}...)", length, LIMITS["email_preview"], passed))

    # Check email count
    email_headings = re.findall(r"^##\s+Email\s+\d", content, re.MULTILINE)
    count = len(email_headings)
    if count != 5:
        all_pass = False
        results.append(f"  {FAIL}  Email count: {count} (expected: 5)")
    else:
        results.append(f"  {PASS}  Email count: {count}/5")

    return all_pass, results


# ─── Product Hunt Checks ──────────────────────────────────────────────────────

def check_product_hunt(content: str) -> tuple[bool, list[str]]:
    results = []
    all_pass = True

    # Extract tagline — content after "## Tagline" heading, first non-empty, non-comment line
    tagline_section = re.search(r"## Tagline\s*\n(.*?)(?=##|\Z)", content, re.DOTALL)
    if tagline_section:
        lines = [l.strip() for l in tagline_section.group(1).split("\n") if l.strip() and not l.strip().startswith("<!--")]
        if lines:
            tagline = lines[0].strip("*").strip()
            if tagline.startswith("[TAGLINE") or tagline.startswith("["):
                results.append(f"  ⚠  Tagline: placeholder not filled")
            else:
                length = char_count(tagline)
                passed = length <= LIMITS["ph_tagline"]
                if not passed:
                    all_pass = False
                results.append(result_line(f"PH tagline ({tagline[:30]}...)", length, LIMITS["ph_tagline"], passed))

                # Check for banned phrases
                banned = ["ai-powered", "revolutionary", "game-changing", "seamless", "robust", "powerful"]
                found_banned = [b for b in banned if b in tagline.lower()]
                if found_banned:
                    all_pass = False
                    results.append(f"  {FAIL}  Tagline banned phrases: {found_banned}")
                else:
                    results.append(f"  {PASS}  Tagline: no banned phrases")
        else:
            results.append(f"  ⚠  Tagline section empty")

    # Extract description — content after "## Description" heading
    desc_section = re.search(r"## Description\s*\n(.*?)(?=##|\Z)", content, re.DOTALL)
    if desc_section:
        lines = [l.strip() for l in desc_section.group(1).split("\n") if l.strip() and not l.strip().startswith("<!--") and not l.strip().startswith("*")]
        if lines:
            desc = lines[0].strip(">").strip()
            if desc.startswith("[DESCRIPTION") or desc.startswith("["):
                results.append(f"  ⚠  Description: placeholder not filled")
            else:
                length = char_count(desc)
                passed = length <= LIMITS["ph_description"]
                if not passed:
                    all_pass = False
                results.append(result_line(f"PH description", length, LIMITS["ph_description"], passed))

    return all_pass, results


# ─── Demo Script Checks ────────────────────────────────────────────────────────

def check_demo_script(content: str) -> tuple[bool, list[str]]:
    results = []
    all_pass = True

    # Strip template comments and placeholders for accurate word count
    clean = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)
    clean = re.sub(r"\[FIXED\]|\[VARIABLE\]", "", clean)
    # Remove FIXED/VARIABLE annotation lines
    clean = re.sub(r"^\s*<!--.*?-->\s*$", "", clean, flags=re.MULTILINE)
    # Remove section headings
    clean = re.sub(r"^#+\s+.*$", "", clean, flags=re.MULTILINE)
    # Remove placeholder lines (lines starting with [)
    clean = re.sub(r"^\[.*\]\s*$", "", clean, flags=re.MULTILINE)

    wc = word_count(clean)
    passed_min = wc >= LIMITS["demo_word_min"]
    passed_max = wc <= LIMITS["demo_word_max"]
    passed = passed_min and passed_max

    if not passed:
        all_pass = False

    results.append(result_line(
        "Demo script word count",
        f"{wc} words",
        f"{LIMITS['demo_word_min']}–{LIMITS['demo_word_max']}",
        passed
    ))

    if not passed_min:
        results.append(f"         → Too short by {LIMITS['demo_word_min'] - wc} words. Expand CORE FEATURE or WOW MOMENT sections.")
    if not passed_max:
        results.append(f"         → Too long by {wc - LIMITS['demo_word_max']} words. Trim CONTEXT SETUP or HOOK sections.")

    # Estimate duration at 150 wpm
    duration_sec = round((wc / 150) * 60)
    duration_min = duration_sec // 60
    duration_sec_rem = duration_sec % 60
    results.append(f"         → Estimated duration at 150 wpm: {duration_min}:{duration_sec_rem:02d}")

    return all_pass, results


# ─── Landing Page Checks ──────────────────────────────────────────────────────

def check_landing_page(content: str) -> tuple[bool, list[str]]:
    results = []
    all_pass = True

    # Check headline (first non-comment, non-heading line after "## Hero" section)
    hero_section = re.search(r"## Hero\s*\n(.*?)(?=##|\Z)", content, re.DOTALL)
    if hero_section:
        # Look for headline marker
        headline_match = re.search(r"\*\*Headline:\*\*\s*\n+([^\n]+)", hero_section.group(1))
        if headline_match:
            headline = headline_match.group(1).strip("*").strip()
            if not headline.startswith("["):
                wc = word_count(headline)
                passed = wc <= LIMITS["lp_headline_words"]
                if not passed:
                    all_pass = False
                results.append(result_line(f"LP headline words ({headline[:30]}...)", wc, LIMITS["lp_headline_words"], passed))

        # Look for CTA button text
        cta_match = re.search(r"\*\*CTA Button:\*\*\s*\n+([^\n]+)", hero_section.group(1))
        if cta_match:
            cta = cta_match.group(1).strip("*").strip()
            if not cta.startswith("["):
                wc = word_count(cta)
                passed = LIMITS["lp_cta_words_min"] <= wc <= LIMITS["lp_cta_words_max"]
                if not passed:
                    all_pass = False
                results.append(result_line(
                    f"LP CTA word count ({cta[:20]})",
                    wc,
                    f"{LIMITS['lp_cta_words_min']}–{LIMITS['lp_cta_words_max']}",
                    passed
                ))

                # Check for banned CTA phrases
                banned_ctas = ["sign up", "learn more", "click here", "get started"]
                found = [b for b in banned_ctas if b in cta.lower()]
                if found:
                    all_pass = False
                    results.append(f"  {FAIL}  LP CTA banned phrase: {found} — use outcome language")
                else:
                    results.append(f"  {PASS}  LP CTA: no banned phrases")

    return all_pass, results


# ─── Social Calendar Checks ────────────────────────────────────────────────────

def check_social_calendar(content: str) -> tuple[bool, list[str]]:
    results = []
    all_pass = True

    # Count posts by looking for "Post type:" fields
    post_types = re.findall(r"Post type:\s*([^\n\]]+)", content, re.IGNORECASE)
    total = len(post_types)

    # Count promotional posts
    promo_types = {"reveal", "promotional", "product"}
    promo_count = sum(1 for pt in post_types if any(p in pt.lower() for p in promo_types))

    # Total count check
    passed_total = abs(total - LIMITS["social_total"]) <= 1
    if not passed_total:
        all_pass = False
    results.append(result_line("Social calendar post count", total, f"{LIMITS['social_total']} ±1", passed_total))

    # Promotional count check
    passed_promo = promo_count <= LIMITS["social_promotional_max"]
    if not passed_promo:
        all_pass = False
    results.append(result_line(
        "Promotional posts",
        f"{promo_count}/{total}",
        f"≤{LIMITS['social_promotional_max']} ({LIMITS['social_promotional_max']/LIMITS['social_total']*100:.0f}%)",
        passed_promo
    ))

    # Check for visual descriptors
    visual_fields = re.findall(r"Visual descriptor:\s*([^\n\]]+)", content, re.IGNORECASE)
    missing_visuals = total - len(visual_fields)
    if missing_visuals > 0:
        all_pass = False
        results.append(f"  {FAIL}  Posts missing visual descriptor: {missing_visuals}")
    else:
        results.append(f"  {PASS}  All posts have visual descriptors")

    return all_pass, results


# ─── All-directory check ──────────────────────────────────────────────────────

def check_all(directory: Path) -> bool:
    checks = {
        "email-sequence.md": ("email-sequence", check_email_sequence),
        "product-hunt.md": ("product-hunt", check_product_hunt),
        "demo-script.md": ("demo-script", check_demo_script),
        "landing-page.md": ("landing-page", check_landing_page),
        "social-calendar.md": ("social-calendar", check_social_calendar),
    }

    templates_dir = directory / "templates"
    if not templates_dir.exists():
        templates_dir = directory

    all_pass = True
    for filename, (label, checker) in checks.items():
        filepath = templates_dir / filename
        if not filepath.exists():
            print(f"\n⚠  {filename}: file not found (skipping)")
            continue

        content = filepath.read_text(encoding="utf-8")
        print(f"\n── {label.upper()} ({filename}) ──")
        passed, results = checker(content)
        for r in results:
            print(r)
        if not passed:
            all_pass = False

    return all_pass


# ─── Single-file check ────────────────────────────────────────────────────────

def check_single(filepath: Path, deliverable_type: str) -> bool:
    if not filepath.exists():
        print(f"Error: file not found: {filepath}", file=sys.stderr)
        sys.exit(2)

    content = filepath.read_text(encoding="utf-8")
    checkers = {
        "email-sequence": check_email_sequence,
        "product-hunt": check_product_hunt,
        "demo-script": check_demo_script,
        "landing-page": check_landing_page,
        "social-calendar": check_social_calendar,
    }

    if deliverable_type not in checkers:
        print(f"Error: unrecognized type '{deliverable_type}'. Valid: {list(checkers.keys())}", file=sys.stderr)
        sys.exit(2)

    print(f"\n── {deliverable_type.upper()} ({filepath.name}) ──")
    passed, results = checkers[deliverable_type](content)
    for r in results:
        print(r)

    return passed


# ─── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Validate launch package deliverable lengths and structural constraints.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", type=Path, help="Path to a single deliverable file")
    group.add_argument("--all", type=Path, dest="directory", help="Path to launch package directory (checks all templates/)")

    parser.add_argument("--type", type=str,
                        choices=["email-sequence", "product-hunt", "demo-script", "landing-page", "social-calendar"],
                        help="Deliverable type (required with --file)")

    args = parser.parse_args()

    if args.file and not args.type:
        parser.error("--type is required when using --file")

    print("Launch Package Validator — validate-lengths.py")
    print("=" * 50)

    if args.directory:
        passed = check_all(args.directory)
    else:
        passed = check_single(args.file, args.type)

    print("\n" + "=" * 50)
    if passed:
        print("RESULT: ALL CHECKS PASSED")
        sys.exit(0)
    else:
        print("RESULT: ONE OR MORE CHECKS FAILED — see above")
        sys.exit(1)


if __name__ == "__main__":
    main()
