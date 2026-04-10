// markdown.js — tiny markdown→HTML
// Supports: headings, paragraphs, fenced code blocks, inline code,
// links, bold, italic, lists (ul/ol), blockquotes, horizontal rules.
// ~120 LOC, sufficient for README rendering. Not a CommonMark conformant.

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function escape(s) {
  return String(s).replace(/[&<>]/g, c => ESC[c]);
}

export function md(src) {
  if (!src) return "";

  // 1. Pull out fenced code blocks first so their internals aren't processed
  const codeBlocks = [];
  src = src.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || "", code });
    return `\u0000CODE${idx}\u0000`;
  });

  // 2. Pull out inline code
  const inlineCodes = [];
  src = src.replace(/`([^`]+)`/g, (_m, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `\u0001IC${idx}\u0001`;
  });

  // 3. Escape HTML
  src = escape(src);

  // 4. Headings (ATX style)
  src = src.replace(/^(#{1,6})\s+(.+)$/gm, (_m, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text}</h${level}>`;
  });

  // 5. Bold + italic (bold first to avoid * conflict)
  src = src.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  src = src.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  // 6. Links
  src = src.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 7. Blockquotes
  src = src.replace(/^>\s?(.+)$/gm, "<blockquote>$1</blockquote>");

  // 8. Horizontal rules
  src = src.replace(/^---+$/gm, "<hr />");

  // 9. Unordered lists (consecutive lines starting with - * +)
  src = src.replace(/(?:^[-*+]\s+.+(?:\n|$))+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^[-*+]\s+/, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });

  // 10. Ordered lists
  src = src.replace(/(?:^\d+\.\s+.+(?:\n|$))+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });

  // 11. Paragraphs (any non-empty block not already wrapped)
  src = src.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h\d|ul|ol|blockquote|pre|hr)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  }).join("\n");

  // 12. Restore inline code
  src = src.replace(/\u0001IC(\d+)\u0001/g, (_m, i) => `<code>${escape(inlineCodes[+i])}</code>`);

  // 13. Restore fenced code blocks
  src = src.replace(/\u0000CODE(\d+)\u0000/g, (_m, i) => {
    const { lang, code } = codeBlocks[+i];
    return `<pre><code class="language-${lang}">${escape(code)}</code></pre>`;
  });

  return src;
}
