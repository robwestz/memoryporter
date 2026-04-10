# data.json Schema

> **When to read this:** when you're writing a page or chart and need to know the shape of the data.

The full payload is one big object with these top-level keys. Every key is always present, even when empty.

## meta

```typescript
{
  repo_name: string;          // basename of --repo
  repo_path: string;          // absolute path
  generated_at: string;       // ISO 8601 UTC
  generator_version: string;
  file_count_walked: number;
}
```

## stats

```typescript
{
  file_count: number;
  total_bytes: number;
  total_loc: number;
  top_files_by_loc: Array<{ path: string; loc: number; }>;  // top 25
}
```

## languages

```typescript
{
  breakdown: Array<{
    name: string;     // e.g. "Python", "Rust"
    files: number;
    loc: number;
    bytes: number;
    color: string;    // brand hex
  }>;
}
```

Sorted by LOC descending.

## structure

```typescript
type Node = {
  name: string;
  type: "dir" | "file";
  size: number;          // bytes (for dirs: sum of children)
  file_count: number;
  language?: string;     // files only
  children?: Node[];     // dirs only
};
```

Capped at 8 levels deep.

## dependencies

```typescript
{
  manifests: Array<{
    manifest_path: string;
    ecosystem: "npm" | "cargo" | "python" | "go" | "php" | "unknown";
    project_name?: string;
    packages: Array<{
      name: string;
      version: string;
      kind: "dependencies" | "devDependencies" | "build-dependencies" | ...;
    }>;
  }>;
}
```

## git

```typescript
{
  available: boolean;
  commits: Array<{
    hash: string;       // full sha
    short: string;      // abbreviated
    author: string;
    email: string;
    ts: number;         // unix epoch seconds
    subject: string;
  }>;
  summary: {
    total: number;
    authors: Array<{ name: string; commits: number; }>;
    first_ts: number | null;
    last_ts: number | null;
  };
}
```

`available: false` when no `.git/` exists. Both `commits` and `summary` will be empty in that case.

## readme

```typescript
{
  found: boolean;
  path: string | null;
  raw: string;          // full markdown
  title: string;
  headings: Array<{ level: number; text: string; }>;
  char_count: number;
}
```

## changelog

```typescript
{
  found: boolean;
  path: string | null;
  raw: string;
  entries: Array<{
    version: string;
    date: string | null;
    body: string;
  }>;
  char_count: number;
}
```

## symbols

```typescript
{
  by_file: { [path: string]: Array<{
    name: string;
    kind: "function" | "class" | "struct" | "enum" | "trait" | "impl" | "method" | "interface" | "const";
    line: number;
  }> };
  total: number;
}
```

## file_index

```typescript
{
  count: number;
  files: Array<{
    path: string;
    size: number;
    language: string | null;
    loc: number;
    preview: string | null;   // null for binary, full text otherwise
    truncated: boolean;       // true if preview was capped at 600 lines
  }>;
}
```

## sidecar (Phase D — optional)

```typescript
{
  present: boolean;
  path?: string;
  config?: { [section: string]: { [key: string]: any; }; };  // parsed wiki.toml
  annotations?: {
    overview?: string;
    modules: { [name: string]: string; };
    files: { [path: string]: string; };
  };
  ai_explanations?: { [key: string]: string; };
  theme_css?: string;
}
```

`present: false` when no `<repo>.wiki/` sidecar exists.
