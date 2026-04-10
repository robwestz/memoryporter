// prism.js — minimal multi-language syntax highlighter
// Supports: python, javascript/typescript, rust, go, markdown, json, css, html
// Token classes: tk-comment, tk-string, tk-keyword, tk-number, tk-function

const PATTERNS = {
  python: [
    [/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, "string"],
    [/(#[^\n]*)/g, "comment"],
    [/\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|finally|raise|yield|lambda|async|await|pass|break|continue|in|not|and|or|is|None|True|False|self|cls)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([A-Za-z_]\w*)(?=\()/g, "function"],
  ],
  javascript: [
    [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, "comment"],
    [/(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, "string"],
    [/\b(const|let|var|function|class|extends|return|if|else|for|while|do|switch|case|break|continue|new|this|import|export|from|as|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|interface|type|implements|public|private|protected|readonly|enum)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([A-Za-z_$][\w$]*)(?=\()/g, "function"],
  ],
  rust: [
    [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, "comment"],
    [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)')/g, "string"],
    [/\b(fn|let|mut|const|static|pub|use|mod|struct|enum|impl|trait|for|while|loop|if|else|match|return|self|Self|where|as|crate|super|true|false|move|async|await|ref|in|dyn|box|unsafe|extern|type)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([a-z_][a-z0-9_]*)(?=\()/g, "function"],
  ],
  go: [
    [/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, "comment"],
    [/(`[^`]*`|"(?:[^"\\]|\\.)*")/g, "string"],
    [/\b(func|var|const|type|struct|interface|package|import|return|if|else|for|range|switch|case|break|continue|defer|go|chan|select|map|nil|true|false|make|new)\b/g, "keyword"],
    [/\b\d+(\.\d+)?\b/g, "number"],
    [/\b([A-Za-z_]\w*)(?=\()/g, "function"],
  ],
  markdown: [
    [/(```[\s\S]*?```|`[^`]+`)/g, "string"],
    [/(^#{1,6}\s+.+$)/gm, "keyword"],
    [/(\[[^\]]+\]\([^)]+\))/g, "function"],
    [/(\*\*[^*]+\*\*|__[^_]+__)/g, "keyword"],
  ],
  json: [
    [/("(?:[^"\\]|\\.)*")\s*:/g, "function"],
    [/("(?:[^"\\]|\\.)*")/g, "string"],
    [/\b(true|false|null)\b/g, "keyword"],
    [/-?\d+(\.\d+)?([eE][+-]?\d+)?/g, "number"],
  ],
  css: [
    [/(\/\*[\s\S]*?\*\/)/g, "comment"],
    [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, "string"],
    [/(@[\w-]+|--[\w-]+)/g, "keyword"],
    [/(#[a-fA-F0-9]{3,8}|\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg)?)/g, "number"],
    [/([a-z-]+)\s*:/g, "function"],
  ],
  html: [
    [/(<!--[\s\S]*?-->)/g, "comment"],
    [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, "string"],
    [/(<\/?[\w-]+)/g, "keyword"],
    [/([\w-]+)=/g, "function"],
  ],
};

const ALIASES = {
  python: "python",
  py: "python",
  javascript: "javascript",
  js: "javascript",
  jsx: "javascript",
  typescript: "javascript",
  ts: "javascript",
  tsx: "javascript",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  markdown: "markdown",
  md: "markdown",
  mdx: "markdown",
  json: "json",
  css: "css",
  scss: "css",
  less: "css",
  html: "html",
  htm: "html",
  vue: "html",
  svelte: "html",
};

const PRISM_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function prismEscapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => PRISM_ESC[c]);
}

export function prismHighlight(code, language) {
  if (!code) return "";
  const langKey = ALIASES[(language || "").toLowerCase()];
  const pats = PATTERNS[langKey];
  if (!pats) return prismEscapeHtml(code);

  // Tokenize using placeholder substitution to avoid double-processing
  const tokens = [];
  let working = code;
  pats.forEach(([re, cls]) => {
    working = working.replace(re, m => {
      const idx = tokens.push({ cls, text: m }) - 1;
      return `\u0000T${idx}\u0000`;
    });
  });
  let escaped = prismEscapeHtml(working);
  escaped = escaped.replace(/\u0000T(\d+)\u0000/g, (_m, i) => {
    const t = tokens[+i];
    return `<span class="tk-${t.cls}">${prismEscapeHtml(t.text)}</span>`;
  });
  return escaped;
}
