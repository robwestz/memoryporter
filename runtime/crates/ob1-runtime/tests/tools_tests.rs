//! Tests for tools.rs — BasicToolExecutor with all 6 tools.

use ob1_runtime::runtime::ToolExecutor;
use ob1_runtime::tools::BasicToolExecutor;
use std::collections::BTreeSet;
use std::path::PathBuf;

fn executor_in(dir: &std::path::Path) -> BasicToolExecutor {
    BasicToolExecutor::new().with_cwd(dir.to_path_buf())
}

// ── bash ──────────────────────────────────────────────────

#[test]
fn test_bash_echo() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("bash", r#"{"command": "echo hello"}"#).unwrap();
    let v: serde_json::Value = serde_json::from_str(&result).unwrap();
    assert_eq!(v["stdout"], "hello");
    assert_eq!(v["exit_code"], 0);
}

#[test]
fn test_bash_missing_command() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("bash", r#"{}"#);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Missing"));
}

#[test]
fn test_bash_nonzero_exit() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("bash", r#"{"command": "exit 42"}"#).unwrap();
    let v: serde_json::Value = serde_json::from_str(&result).unwrap();
    assert_eq!(v["exit_code"], 42);
}

// ── read_file ─────────────────────────────────────────────

#[test]
fn test_read_file() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("test.txt");
    std::fs::write(&file, "line1\nline2\nline3\n").unwrap();

    let mut ex = executor_in(tmp.path());
    let input = format!(r#"{{"file_path": "{}"}}"#, file.display().to_string().replace('\\', "/"));
    let result = ex.execute("read_file", &input).unwrap();
    assert!(result.contains("1\tline1"));
    assert!(result.contains("2\tline2"));
    assert!(result.contains("3\tline3"));
}

#[test]
fn test_read_file_with_offset_limit() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("big.txt");
    let content: String = (1..=100).map(|i| format!("line {}\n", i)).collect();
    std::fs::write(&file, &content).unwrap();

    let mut ex = executor_in(tmp.path());
    let input = format!(r#"{{"file_path": "{}", "offset": 10, "limit": 5}}"#, file.display().to_string().replace('\\', "/"));
    let result = ex.execute("read_file", &input).unwrap();
    assert!(result.contains("11\tline 11"));
    assert!(result.contains("15\tline 15"));
    assert!(!result.contains("16\t"));
}

#[test]
fn test_read_file_relative() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(tmp.path().join("rel.txt"), "content here").unwrap();

    let mut ex = executor_in(tmp.path());
    let result = ex.execute("read_file", r#"{"file_path": "rel.txt"}"#).unwrap();
    assert!(result.contains("content here"));
}

#[test]
fn test_read_file_not_found() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("read_file", r#"{"file_path": "nope.txt"}"#);
    assert!(result.is_err());
}

// ── write_file ────────────────────────────────────────────

#[test]
fn test_write_file() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("out.txt");

    let mut ex = executor_in(tmp.path());
    let input = format!(r#"{{"file_path": "{}", "content": "hello world"}}"#, file.display().to_string().replace('\\', "/"));
    let result = ex.execute("write_file", &input).unwrap();
    assert!(result.contains("11 bytes"));
    assert_eq!(std::fs::read_to_string(&file).unwrap(), "hello world");
}

#[test]
fn test_write_file_creates_dirs() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("sub").join("deep").join("file.txt");

    let mut ex = executor_in(tmp.path());
    let input = format!(r#"{{"file_path": "{}", "content": "deep"}}"#, file.display().to_string().replace('\\', "/"));
    ex.execute("write_file", &input).unwrap();
    assert_eq!(std::fs::read_to_string(&file).unwrap(), "deep");
}

#[test]
fn test_write_file_missing_content() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("write_file", r#"{"file_path": "x.txt"}"#);
    assert!(result.is_err());
}

// ── edit_file ─────────────────────────────────────────────

#[test]
fn test_edit_file() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("edit.txt");
    std::fs::write(&file, "foo bar baz").unwrap();

    let mut ex = executor_in(tmp.path());
    let input = format!(
        r#"{{"file_path": "{}", "old_string": "bar", "new_string": "qux"}}"#,
        file.display().to_string().replace('\\', "/")
    );
    ex.execute("edit_file", &input).unwrap();
    assert_eq!(std::fs::read_to_string(&file).unwrap(), "foo qux baz");
}

#[test]
fn test_edit_file_not_found_string() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("edit2.txt");
    std::fs::write(&file, "hello").unwrap();

    let mut ex = executor_in(tmp.path());
    let input = format!(
        r#"{{"file_path": "{}", "old_string": "nope", "new_string": "x"}}"#,
        file.display().to_string().replace('\\', "/")
    );
    let result = ex.execute("edit_file", &input);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not found"));
}

#[test]
fn test_edit_file_ambiguous() {
    let tmp = tempfile::tempdir().unwrap();
    let file = tmp.path().join("dup.txt");
    std::fs::write(&file, "aaa aaa aaa").unwrap();

    let mut ex = executor_in(tmp.path());
    let input = format!(
        r#"{{"file_path": "{}", "old_string": "aaa", "new_string": "bbb"}}"#,
        file.display().to_string().replace('\\', "/")
    );
    let result = ex.execute("edit_file", &input);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("3 times"));
}

// ── glob_search ───────────────────────────────────────────

#[test]
fn test_glob_search() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(tmp.path().join("a.rs"), "").unwrap();
    std::fs::write(tmp.path().join("b.rs"), "").unwrap();
    std::fs::write(tmp.path().join("c.txt"), "").unwrap();

    let mut ex = executor_in(tmp.path());
    let result = ex.execute("glob_search", r#"{"pattern": "*.rs"}"#).unwrap();
    assert!(result.contains("a.rs"));
    assert!(result.contains("b.rs"));
    assert!(!result.contains("c.txt"));
}

// ── grep_search ───────────────────────────────────────────

#[test]
fn test_grep_search() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(tmp.path().join("code.rs"), "fn main() {\n    println!(\"hello\");\n}\n").unwrap();
    std::fs::write(tmp.path().join("other.rs"), "fn other() {}\n").unwrap();

    let mut ex = executor_in(tmp.path());
    let result = ex.execute("grep_search", r#"{"pattern": "println"}"#).unwrap();
    assert!(result.contains("code.rs"));
    assert!(result.contains("println"));
    assert!(!result.contains("other.rs"));
}

#[test]
fn test_grep_search_no_match() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(tmp.path().join("file.txt"), "nothing here").unwrap();

    let mut ex = executor_in(tmp.path());
    let result = ex.execute("grep_search", r#"{"pattern": "zzzzz"}"#).unwrap();
    assert!(result.contains("No matches"));
}

// ── allowed list ──────────────────────────────────────────

#[test]
fn test_allowed_list_blocks() {
    let tmp = tempfile::tempdir().unwrap();
    let allowed: BTreeSet<String> = ["read_file"].iter().map(|s| s.to_string()).collect();
    let mut ex = executor_in(tmp.path()).with_allowed(allowed);

    let result = ex.execute("bash", r#"{"command": "echo blocked"}"#);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not allowed"));
}

#[test]
fn test_allowed_list_permits() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(tmp.path().join("ok.txt"), "allowed").unwrap();
    let allowed: BTreeSet<String> = ["read_file"].iter().map(|s| s.to_string()).collect();
    let mut ex = executor_in(tmp.path()).with_allowed(allowed);

    let result = ex.execute("read_file", r#"{"file_path": "ok.txt"}"#);
    assert!(result.is_ok());
}

// ── unknown tool ──────────────────────────────────────────

#[test]
fn test_unknown_tool() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    let result = ex.execute("teleport", r#"{}"#);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unknown tool"));
}

// ── invalid json input ────────────────────────────────────

#[test]
fn test_invalid_json_input_graceful() {
    let tmp = tempfile::tempdir().unwrap();
    let mut ex = executor_in(tmp.path());
    // Invalid JSON should still be handled (falls back to empty object)
    let result = ex.execute("bash", "not json at all");
    assert!(result.is_err()); // Missing 'command' key
}
