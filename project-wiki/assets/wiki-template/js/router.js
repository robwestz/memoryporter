// router.js — page renderer. Stub. Real impl in Task 17, refactored to static imports in Task 35.5.
export function renderPage(page) {
  const main = document.getElementById("main");
  main.innerHTML = `
    <div class="card" style="margin-top: 32px;">
      <h1>Page: ${page}</h1>
      <p class="muted">Router stub — real pages land in Tasks 17-31.</p>
    </div>
  `;
}
