// app.js — Phase A stub. Real bootstrap lands in Task 15.
console.log("project-wiki: app.js stub loaded — full bootstrap arrives in Task 15");
const tag = document.getElementById("wiki-data");
if (tag) {
  try {
    const data = JSON.parse(tag.textContent || "{}");
    document.getElementById("main").innerHTML = `
      <div style="padding: 32px; max-width: 720px; margin: 64px auto; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px;">
        <h1 style="margin-bottom: 16px;">${data.meta?.repo_name || "?"}</h1>
        <p style="color: var(--text-muted); margin-bottom: 24px;">
          Phase A stub — render pipeline alive. ${data.meta?.file_count_walked || 0} files walked.
          Real UI lands in Task 11+.
        </p>
        <pre style="background: var(--bg); padding: 16px; border-radius: 10px; overflow: auto; max-height: 300px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${JSON.stringify(Object.keys(data), null, 2)}</pre>
      </div>
    `;
  } catch (err) {
    document.getElementById("main").textContent = "Failed to parse wiki data: " + err;
  }
}
