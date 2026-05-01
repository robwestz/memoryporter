// KB-Forge UI JavaScript

const API_BASE = window.location.origin;

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    loadKBList();
    
    // Tab click handlers
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Form handlers
    document.getElementById('scrape-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        startScrape();
    });
    
    document.getElementById('query-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        searchKB();
    });
    
    document.getElementById('build-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        startBuild();
    });
    
    // Auto-generate KB name from URL
    document.getElementById('scrape-url')?.addEventListener('blur', (e) => {
        const url = e.target.value;
        const nameInput = document.getElementById('scrape-name');
        if (url && !nameInput.value) {
            nameInput.value = generateKBName(url);
        }
    });
    
    // New KB button
    document.getElementById('btn-new-kb')?.addEventListener('click', () => {
        switchTab('scrape');
    });
});

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === `view-${tabName}`);
    });
    
    // Update URL hash
    window.location.hash = tabName;
}

function generateKBName(url) {
    return url.replace(/^https?:\/\//, '').replace(/\//g, '_').slice(0, 50);
}

// Load KB List for sidebar
async function loadKBList() {
    try {
        const response = await fetch(`${API_BASE}/api/list`);
        const data = await response.json();
        
        const container = document.getElementById('kb-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        const kbs = data.knowledge_bases || {};
        
        if (Object.keys(kbs).length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: var(--space-md);">No knowledge bases yet</p>';
            return;
        }
        
        Object.entries(kbs).forEach(([name, path]) => {
            // Detect type from path
            let type = 'markdown';
            let icon = '📝';
            if (path.includes('obsidian')) { type = 'obsidian'; icon = '🏛️'; }
            else if (path.includes('chroma')) { type = 'chroma'; icon = '🔍'; }
            else if (path.includes('kb/')) { type = 'hybrid'; icon = '⚡'; }
            
            const card = document.createElement('div');
            card.className = 'kb-card';
            card.innerHTML = `
                <div class="kb-header">
                    <span class="kb-icon">${icon}</span>
                    <span class="kb-name">${name}</span>
                </div>
                <div class="kb-type">${type}</div>
                <div class="kb-meta">
                    <span>KB</span>
                    <div class="kb-actions">
                        <button class="kb-btn" onclick="selectKBForQuery('${name}')" title="Query">🔍</button>
                        <button class="kb-btn delete" onclick="deleteKB('${name}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
            
            // Add to query dropdown
            const select = document.getElementById('query-kb');
            if (select && !select.querySelector(`option[value="${name}"]`)) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = `${icon} ${name}`;
                select.appendChild(option);
            }
        });
    } catch (err) {
        console.error('Failed to load KB list:', err);
    }
}

// Scrape functionality
async function startScrape() {
    const url = document.getElementById('scrape-url').value;
    const storage = document.getElementById('scrape-storage').value;
    const depth = document.querySelector('input[name="scrape-depth"]:checked')?.value || 'single';
    const name = document.getElementById('scrape-name').value;
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    const btn = document.getElementById('btn-scrape');
    const status = document.getElementById('scrape-status');
    
    btn.disabled = true;
    btn.textContent = 'Scraping...';
    status.style.display = 'block';
    status.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: 30%"></div>
        </div>
        <div class="status-text">Starting scrape...</div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, mode: 'temp', storage, depth, name })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            status.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="status-text">
                    ✓ Created <strong>${data.kb_name}</strong> with ${data.chunks_indexed} chunks
                </div>
            `;
            loadKBList();
            document.getElementById('scrape-form').reset();
        } else {
            throw new Error(data.error || 'Scrape failed');
        }
    } catch (err) {
        status.innerHTML = `<div class="status-text" style="color: var(--color-error)">✗ Error: ${err.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Start Scraping';
    }
}

// Query functionality
async function searchKB() {
    const kbName = document.getElementById('query-kb').value;
    const question = document.getElementById('query-question').value;
    
    if (!kbName) {
        alert('Please select a knowledge base');
        return;
    }
    if (!question) {
        alert('Please enter a question');
        return;
    }
    
    const btn = document.getElementById('btn-query');
    const resultsDiv = document.getElementById('query-results');
    
    btn.disabled = true;
    btn.textContent = 'Searching...';
    resultsDiv.innerHTML = '<p style="color: var(--color-text-muted)">Searching...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kb_name: kbName, question, top_k: 5 })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderResults(data.results || []);
        } else {
            throw new Error(data.error || 'Query failed');
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p style="color: var(--color-error)">Error: ${err.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Search Knowledge Base';
    }
}

function renderResults(results) {
    const container = document.getElementById('query-results');
    
    if (results.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted)">No results found</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="results-header">Results (${results.length})</div>
        ${results.map((r, i) => `
            <div class="result-card">
                <span class="score-badge">${(r.score || 0).toFixed(2)}</span>
                <div class="result-snippet">${escapeHtml(r.text || '').substring(0, 300)}...</div>
                <div class="result-source">
                    <span>${r.source || 'Unknown'}</span>
                </div>
            </div>
        `).join('')}
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function selectKBForQuery(name) {
    switchTab('query');
    document.getElementById('query-kb').value = name;
}

// Build functionality
async function startBuild() {
    const spec = document.getElementById('build-spec').value;
    
    if (!spec) {
        alert('Please enter a build specification');
        return;
    }
    
    const btn = document.getElementById('btn-build');
    const jobsDiv = document.getElementById('active-jobs');
    
    btn.disabled = true;
    btn.textContent = 'Building...';
    
    try {
        const response = await fetch(`${API_BASE}/api/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spec, autonomous: false })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            jobsDiv.innerHTML = `
                <div class="job-card">
                    <div class="job-header">
                        <span class="job-icon">✓</span>
                        <span class="job-name">${data.kb_name}</span>
                    </div>
                    <div class="job-meta">Build completed</div>
                </div>
            `;
            loadKBList();
            document.getElementById('build-form').reset();
        } else {
            throw new Error(data.message || 'Build failed');
        }
    } catch (err) {
        jobsDiv.innerHTML = `<p style="color: var(--color-error)">Error: ${err.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Start Autonomous Build';
    }
}

// Delete KB
async function deleteKB(name) {
    if (!confirm(`Delete knowledge base "${name}"?`)) {
        return;
    }
    // TODO: Implement delete endpoint
    alert('Delete not yet implemented. Remove manually from ~/.kb-forge/');
}

// Handle URL hash on load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && ['scrape', 'query', 'build', 'settings'].includes(hash)) {
        switchTab(hash);
    } else {
        switchTab('scrape');
    }
});
