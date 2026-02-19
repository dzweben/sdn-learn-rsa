#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path
from datetime import datetime

try:
    import markdown
except Exception as e:  # pragma: no cover
    raise SystemExit(
        "Missing python package 'markdown'. Install with: python3 -m pip install markdown"
    )


DOC_TITLE = "LEARN RSA PI Walkthrough"
SRC_MD = Path(__file__).resolve().parents[1] / "LEARN_RSA_PI_WALKTHROUGH.md"


def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "section"


def split_sections(text: str):
    lines = text.splitlines()
    sections = []
    current_title = "Overview"
    current_lines = []
    in_code = False

    def push():
        nonlocal current_title, current_lines
        if current_lines:
            sections.append((current_title, "\n".join(current_lines).rstrip() + "\n"))

    for line in lines:
        if line.strip().startswith("```"):
            in_code = not in_code
        is_section = (not in_code) and re.match(r"^\*\*(Step|Setback)\b.+\*\*$", line.strip())
        if is_section:
            push()
            title = line.strip().strip("*")
            current_title = title
            current_lines = [f"## {title}"]
        else:
            current_lines.append(line)

    push()
    return sections


def md_to_html(md_text: str) -> str:
    return markdown.markdown(
        md_text,
        extensions=[
            "fenced_code",
            "tables",
            "sane_lists",
            "toc",
        ],
    )


def normalize_markdown(md_text: str) -> str:
    lines = md_text.splitlines()
    out = []
    prev = ""
    for line in lines:
        is_list = re.match(r"^\s*([-*+]|\d+\.)\s+", line) is not None
        if is_list and prev.strip() != "":
            out.append("")
        out.append(line)
        prev = line
    return "\n".join(out)


def render_page(nav_html: str, content_html: str, css_text: str, rel_root: str = "") -> str:
    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{DOC_TITLE}</title>
  <style>
{css_text}
  </style>
</head>
<body>
  <div class=\"layout\">
    <nav class=\"sidebar\">
      <div class=\"site-title\">{DOC_TITLE}</div>
      {nav_html}
    </nav>
    <main class=\"content\">
      <article>
        {content_html}
      </article>
      <div class=\"footer\">Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}
      </div>
    </main>
  </div>
</body>
</html>
"""


def build(out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "assets").mkdir(parents=True, exist_ok=True)
    for f in out_dir.glob("*.html"):
        f.unlink()

    text = SRC_MD.read_text()
    sections = split_sections(text)

    nav_items = []
    content_parts = []
    for title, content in sections:
        slug = slugify(title)
        nav_items.append((title, slug))
        content_md = content
        if not content_md.lstrip().startswith("## "):
            content_md = f"## {title}\n\n" + content_md
        content_html = md_to_html(normalize_markdown(content_md))
        content_parts.append(f"<section id=\"{slug}\" class=\"section\">{content_html}</section>")

    def nav_html() -> str:
        items = ["<ul class=\"nav\">"]
        for title, slug in nav_items:
            items.append(f"  <li><a href=\"#{slug}\">{title}</a></li>")
        items.append("</ul>")
        return "\n".join(items)

    full_html = "\n".join(content_parts)
    css_text = (out_dir / "assets" / "style.css").read_text()
    html = render_page(nav_html(), full_html, css_text)
    html = embed_images(html, out_dir / "assets" / "brain_snapshots")
    (out_dir / "index.html").write_text(html)


def embed_images(html: str, img_dir: Path) -> str:
    import base64

    def repl(match):
        fname = match.group(1)
        path = img_dir / fname
        if not path.exists():
            return match.group(0)
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        return f'src="data:image/png;base64,{data}"'

    # NOTE: Python 3.13 treats backslashes before quotes as literal characters in regex.
    # Use unescaped quotes here so the pattern matches src="...".
    return re.sub(r'src="assets/brain_snapshots/([^"]+\.png)"', repl, html)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build PI walkthrough HTML site")
    parser.add_argument("--out", default="pi_walkthrough_site", help="Output directory")
    args = parser.parse_args()
    build(Path(args.out))
