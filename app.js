// Takshashila Scholar — frontend logic
// API key stored only in localStorage. Calls go directly to Anthropic.
// Research lifecycle: a router picks a path; the user moves through
// stages; output from one stage can be carried into the next.

const STORAGE_KEYS = {
  apiKey: 'takshashila_scholar_api_key',
  model:  'takshashila_scholar_model'
};
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const WRITING_WF = ['oped', 'brief', 'discussion'];
const PASSIVE = { '__draft__': DRAFT_NODE, '__sources__': SOURCES_NODE };
const isPassive = (k) => typeof k === 'string' && k.startsWith('__');

// State
let currentPath = null;       // 'A' | 'B' | 'C' | null (single-tool mode)
let currentWorkflow = null;
let conversationHistory = [];
let isStreaming = false;
let lastAssistantOutput = '';
let pendingCarry = null;      // { fromTitle, text } injected into next stage
let reviewSource = '';        // the draft under review (review → values → critique)
const REVIEW_TAIL = ['review', 'values', 'critique'];

const $ = (id) => document.getElementById(id);
const settingsPanel = $('settings-panel');
const settingsBtn   = $('settings-btn');
const apiKeyInput   = $('api-key');
const modelSelect   = $('model-select');
const router        = $('router');
const pathView      = $('path-view');
const pathTitle     = $('path-title');
const pathSub       = $('path-sub');
const pathRail      = $('path-rail');
const stageList     = $('stage-list');
const workflowSelect= $('workflow-select');
const workflowChat  = $('workflow-chat');
const chatRail      = $('chat-rail');
const workflowTitle = $('workflow-title');
const carryNote     = $('carry-note');
const messagesEl    = $('messages');
const nextStepEl    = $('next-step');
const inputForm     = $('input-form');
const inputText     = $('input-text');
const sendBtn       = $('send-btn');
const backBtn       = $('back-btn');
const resetBtn      = $('reset-btn');

const SECTIONS = [settingsPanel, router, pathView, workflowSelect, workflowChat];
function show(section) {
  SECTIONS.forEach(s => { if (s !== settingsPanel) s.classList.add('hidden'); });
  section.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function init() {
  loadSettings();
  attachListeners();
  show(router);
  if (!getApiKey()) settingsPanel.classList.remove('hidden');
}

function loadSettings() {
  const k = localStorage.getItem(STORAGE_KEYS.apiKey);
  modelSelect.value = localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL;
  if (k) apiKeyInput.value = k;
}
const getApiKey = () => localStorage.getItem(STORAGE_KEYS.apiKey);
const getModel  = () => localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL;

function attachListeners() {
  settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));

  $('save-settings').addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) localStorage.setItem(STORAGE_KEYS.apiKey, key);
    localStorage.setItem(STORAGE_KEYS.model, modelSelect.value);
    settingsPanel.classList.add('hidden');
    toast('Settings saved');
  });

  $('clear-settings').addEventListener('click', () => {
    if (confirm('Clear your API key from this browser?')) {
      localStorage.removeItem(STORAGE_KEYS.apiKey);
      apiKeyInput.value = '';
      toast('API key cleared');
    }
  });

  $('home-link').addEventListener('click', (e) => { e.preventDefault(); goRouter(); });

  document.querySelectorAll('.route-card').forEach(card =>
    card.addEventListener('click', () => openPath(card.dataset.path)));

  $('show-all-tools').addEventListener('click', () => { currentPath = null; show(workflowSelect); });

  document.querySelectorAll('[data-act="router"]').forEach(b =>
    b.addEventListener('click', goRouter));

  document.querySelectorAll('.workflow-card').forEach(card =>
    card.addEventListener('click', () => startWorkflow(card.dataset.workflow)));

  backBtn.addEventListener('click', () => {
    if (conversationHistory.length > 1 && !confirm('Leave this conversation? It will be lost.')) return;
    if (currentPath) openPath(currentPath); else show(workflowSelect);
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Reset this conversation?')) startWorkflow(currentWorkflow);
  });

  inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputText.value.trim();
    if (!text || isStreaming) return;
    await sendMessage(text);
  });

  inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inputForm.requestSubmit(); }
  });
}

function goRouter() {
  currentPath = null; currentWorkflow = null; conversationHistory = [];
  show(router);
}

// ---- Path view ----
function openPath(pathKey) {
  const path = PATHS[pathKey];
  if (!path) return;
  currentPath = pathKey;
  pathTitle.textContent = path.label;
  pathSub.textContent = path.blurb;
  pathRail.innerHTML = renderRail(pathKey, null);
  stageList.innerHTML = path.sequence.map((key, i) => {
    if (key === '__sources__') {
      return `<li class="stage-row is-draft">
        <span class="stage-num">${i + 1}</span>
        <div class="stage-body">
          <h4>${SOURCES_NODE.title}</h4>
          <p>${SOURCES_NODE.note}</p>
          <p><a href="${SOURCES_NODE.url}" target="_blank" rel="noopener">${SOURCES_NODE.urlLabel}</a></p>
        </div>
        <span class="stage-cta muted">Reminder</span>
      </li>`;
    }
    if (key === '__draft__') {
      return `<li class="stage-row is-draft">
        <span class="stage-num">${i + 1}</span>
        <div class="stage-body">
          <h4>${DRAFT_NODE.title}</h4>
          <p>${DRAFT_NODE.note} You can draft it here when you reach this step (op-ed, policy brief, or discussion document).</p>
        </div>
        <span class="stage-cta muted">At this step</span>
      </li>`;
    }
    const wf = PROMPTS[key];
    return `<li class="stage-row" data-workflow="${key}">
      <span class="stage-num">${i + 1}</span>
      <div class="stage-body">
        <h4>${wf.title}</h4>
        <p>${wf.intro.split('. ')[0]}. Produces ${wf.produces}.</p>
      </div>
      <span class="stage-cta">Open →</span>
    </li>`;
  }).join('');
  stageList.querySelectorAll('.stage-row[data-workflow]').forEach(row =>
    row.addEventListener('click', () => startWorkflow(row.dataset.workflow)));
  show(pathView);
}

// ---- Rail ----
function renderRail(pathKey, activeKey) {
  if (!pathKey) return '';
  const seq = PATHS[pathKey].sequence;
  let activeIdx = seq.indexOf(activeKey);
  if (activeIdx === -1 && WRITING_WF.includes(activeKey)) activeIdx = seq.indexOf('__draft__');
  const nodes = seq.map((key, i) => {
    const passive = isPassive(key);
    const label = passive ? PASSIVE[key].stage : PROMPTS[key].stage;
    let cls = 'rail-node';
    if (passive) cls += ' is-draft';
    if (activeIdx !== -1) {
      if (i < activeIdx) cls += ' is-done';
      else if (i === activeIdx) cls += ' is-current';
    }
    return `<span class="${cls}">${label}</span>`;
  });
  return nodes.join('<span class="rail-sep" aria-hidden="true">→</span>');
}

// ---- Workflow / chat ----
function startWorkflow(key) {
  if (key === '__draft__') return;
  if (!getApiKey()) {
    settingsPanel.classList.remove('hidden');
    toast('Add your Anthropic API key first');
    return;
  }
  const wf = PROMPTS[key];
  if (!wf) return;

  currentWorkflow = key;
  conversationHistory = [];
  lastAssistantOutput = '';
  // The review chain (review → values → critique) all operate on the same
  // draft, not on each other's memos. Reset the remembered draft when the
  // chain starts fresh or when leaving it.
  if (key === 'review' || !REVIEW_TAIL.includes(key)) reviewSource = '';
  workflowTitle.textContent = wf.title;
  messagesEl.innerHTML = '';
  nextStepEl.classList.add('hidden');
  nextStepEl.innerHTML = '';

  chatRail.innerHTML = renderRail(currentPath, key);
  backBtn.textContent = currentPath ? '← Path' : '← All tools';

  if (pendingCarry) {
    carryNote.classList.remove('hidden');
    carryNote.innerHTML =
      `<strong>Carried from ${escapeHtml(pendingCarry.fromTitle)}:</strong> the output below is in your message box as starting context. Trim it if you like, then send.`;
    inputText.value =
      `Context from my previous step (${pendingCarry.fromTitle}):\n\n---\n${pendingCarry.text}\n---\n\nUse this as the starting point for the ${wf.title.toLowerCase()}.`;
    pendingCarry = null;
  } else {
    carryNote.classList.add('hidden');
    inputText.value = '';
  }

  addMessage('assistant', wf.intro, { tools: false });
  show(workflowChat);
  inputText.focus();
}

function nextInPath(key) {
  if (!currentPath) return null;
  const seq = PATHS[currentPath].sequence;
  let i = seq.indexOf(key);
  if (i === -1 && WRITING_WF.includes(key)) i = seq.indexOf('__draft__');
  for (let j = i + 1; j < seq.length; j++) {
    if (seq[j] === '__draft__') return '__draft__';
    if (PROMPTS[seq[j]]) return seq[j];
  }
  return null;
}

function rawNextToken(key) {
  if (!currentPath) return null;
  const seq = PATHS[currentPath].sequence;
  let i = seq.indexOf(key);
  if (i === -1 && WRITING_WF.includes(key)) i = seq.indexOf('__draft__');
  return (i >= 0 && i + 1 < seq.length) ? seq[i + 1] : null;
}

function buildSystemPrompt(key) {
  let sys = PROMPTS[key].system;
  if (!currentPath) return sys;
  const nextKey = nextInPath(key);
  if (nextKey === '__draft__') {
    sys += `\n\nLIFECYCLE NOTE: This is part of the Takshashila research path. After this stage the researcher drafts their piece (op-ed, brief, or discussion document), then runs Draft Review. End your final output with one line: "Next: draft your piece, then run Draft Review."`;
  } else if (nextKey) {
    sys += `\n\nLIFECYCLE NOTE: This is part of the Takshashila research path. The next stage is ${PROMPTS[nextKey].title}. End your final output with one line beginning "Next step:" telling the researcher how this output feeds into ${PROMPTS[nextKey].title}.`;
  }
  return sys;
}

function addMessage(role, content, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = `message ${role}`;
  const r = document.createElement('div');
  r.className = 'message-role';
  r.textContent = role === 'user' ? 'You' : 'Scholar';
  const c = document.createElement('div');
  c.className = 'message-content';
  c.innerHTML = renderMarkdown(content);
  wrap.appendChild(r);
  wrap.appendChild(c);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return { wrap, content: c };
}

function attachTools(wrap, rawText) {
  const bar = document.createElement('div');
  bar.className = 'msg-tools';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'msg-tool';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(rawText); copyBtn.textContent = 'Copied'; }
    catch (e) { copyBtn.textContent = 'Copy failed'; }
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
  });
  const dlBtn = document.createElement('button');
  dlBtn.className = 'msg-tool';
  dlBtn.textContent = 'Download .md';
  dlBtn.addEventListener('click', () => {
    const blob = new Blob([rawText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (currentWorkflow || 'scholar');
    a.href = url;
    a.download = `takshashila-${slug}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });
  bar.appendChild(copyBtn);
  bar.appendChild(dlBtn);
  wrap.appendChild(bar);
}

async function sendMessage(text) {
  addMessage('user', text, { tools: false });
  conversationHistory.push({ role: 'user', content: text });
  // First message into a review-chain stage is the draft itself; remember it
  // so later chain stages review the draft, not the prior stage's memo.
  if (REVIEW_TAIL.includes(currentWorkflow) && !reviewSource) reviewSource = text;
  inputText.value = '';
  carryNote.classList.add('hidden');
  nextStepEl.classList.add('hidden');
  isStreaming = true;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Streaming…';

  const { wrap, content } = addMessage('assistant', '', { tools: false });
  const thinking = document.createElement('div');
  thinking.className = 'thinking';
  thinking.textContent = 'Thinking';
  content.appendChild(thinking);

  let raw = '';
  let firstToken = true;

  try {
    await streamAnthropic(
      conversationHistory,
      buildSystemPrompt(currentWorkflow),
      (delta) => {
        if (firstToken) { content.innerHTML = ''; firstToken = false; }
        raw += delta;
        content.textContent = raw;          // fast path while streaming
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    );
    content.innerHTML = renderMarkdown(raw);  // final pretty render
    conversationHistory.push({ role: 'assistant', content: raw });
    lastAssistantOutput = raw;
    attachTools(wrap, raw);
    renderNextStep();
  } catch (err) {
    content.innerHTML = `<p style="color:#8a1020"><strong>Error:</strong> ${escapeHtml(err.message)}</p>`;
    conversationHistory.pop();
  } finally {
    isStreaming = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    messagesEl.scrollTop = messagesEl.scrollHeight;
    inputText.focus();
  }
}

function renderNextStep() {
  if (!currentPath || !lastAssistantOutput) return;

  // A Sources reminder sits between this stage and the next actionable one
  if (rawNextToken(currentWorkflow) === '__sources__') {
    const after = nextInPath(currentWorkflow);
    nextStepEl.className = 'next-step';
    nextStepEl.innerHTML =
      `<p class="next-label">Before the next stage — primary evidence</p>
       <h4>${SOURCES_NODE.title}</h4>
       <p class="muted">${SOURCES_NODE.note}</p>
       <p><a href="${SOURCES_NODE.url}" target="_blank" rel="noopener">${SOURCES_NODE.urlLabel}</a></p>
       <div class="next-actions">
         <button class="solid-btn" id="continue-after-sources">Continue to ${PROMPTS[after].title} with this output →</button>
         <button class="line-btn small" id="open-after-fresh">Open ${PROMPTS[after].stage} without carrying over</button>
       </div>`;
    $('continue-after-sources').addEventListener('click', () => {
      pendingCarry = { fromTitle: PROMPTS[currentWorkflow].title, text: lastAssistantOutput };
      startWorkflow(after);
    });
    $('open-after-fresh').addEventListener('click', () => startWorkflow(after));
    nextStepEl.classList.remove('hidden');
    return;
  }

  const nextKey = nextInPath(currentWorkflow);

  if (!nextKey) {
    nextStepEl.className = 'next-step';
    nextStepEl.innerHTML = `<p>That completes this path. <button class="text-link" data-act="router">Start a new piece of work →</button></p>`;
    nextStepEl.querySelector('[data-act="router"]').addEventListener('click', goRouter);
    nextStepEl.classList.remove('hidden');
    return;
  }

  if (nextKey === '__draft__') {
    nextStepEl.className = 'next-step';
    nextStepEl.innerHTML =
      `<p class="next-label">Next in this path — draft your piece</p>
       <p class="muted">${DRAFT_NODE.note} Or draft it here, carrying this analysis forward:</p>
       <div class="next-actions">
         <button class="solid-btn" data-draft="oped">Draft an op-ed →</button>
         <button class="solid-btn" data-draft="brief">Draft a policy brief →</button>
         <button class="solid-btn" data-draft="discussion">Draft a discussion document →</button>
       </div>
       <p style="margin-top:1rem"><button class="text-link" id="skip-to-review">I've already written it — go straight to Draft Review →</button></p>`;
    nextStepEl.querySelectorAll('[data-draft]').forEach(b =>
      b.addEventListener('click', () => {
        pendingCarry = { fromTitle: PROMPTS[currentWorkflow].title, text: lastAssistantOutput };
        startWorkflow(b.dataset.draft);
      }));
    $('skip-to-review').addEventListener('click', () => {
      pendingCarry = { fromTitle: PROMPTS[currentWorkflow].title, text: lastAssistantOutput };
      startWorkflow('review');
    });
    nextStepEl.classList.remove('hidden');
    return;
  }

  const next = PROMPTS[nextKey];
  // Within the review chain, each stage reviews the same draft, so carry the
  // draft forward, not this stage's memo.
  const chainOnDraft = REVIEW_TAIL.includes(currentWorkflow) && REVIEW_TAIL.includes(nextKey) && reviewSource;
  const continueLabel = chainOnDraft ? 'Continue — review the same draft →' : 'Continue with this output →';
  nextStepEl.className = 'next-step';
  nextStepEl.innerHTML =
    `<p class="next-label">Next in this path</p>
     <h4>${next.title}</h4>
     <p class="muted">${next.intro.split('. ')[0]}.</p>
     <div class="next-actions">
       <button class="solid-btn" id="continue-next">${continueLabel}</button>
       <button class="line-btn small" id="open-next-fresh">Open ${next.stage} without carrying over</button>
     </div>`;
  $('continue-next').addEventListener('click', () => {
    pendingCarry = chainOnDraft
      ? { fromTitle: 'your draft', text: reviewSource }
      : { fromTitle: PROMPTS[currentWorkflow].title, text: lastAssistantOutput };
    startWorkflow(nextKey);
  });
  $('open-next-fresh').addEventListener('click', () => startWorkflow(nextKey));
  nextStepEl.classList.remove('hidden');
}

// ---- Streaming Anthropic call (SSE) ----
async function streamAnthropic(messages, systemPrompt, onDelta) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set. Add one in Settings.');

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages
    })
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); if (d.error?.message) msg = d.error.message; } catch (e) {}
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();  // keep last partial line
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      let evt;
      try { evt = JSON.parse(payload); } catch (e) { continue; }
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        onDelta(evt.delta.text);
      } else if (evt.type === 'error') {
        throw new Error(evt.error?.message || 'Streaming error from Anthropic API');
      }
    }
  }
}

// ---- Minimal markdown ----
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/```([^`]*?)```/gs, (m, c) => `<pre><code>${c.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/((?:^\|.*\|\s*\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n');
    if (rows.length < 2) return block;
    const head = rows[0].split('|').slice(1, -1).map(c => c.trim());
    const sep = (r) => /^\|[\s\-:|]+\|$/.test(r);
    const start = sep(rows[1]) ? 2 : 1;
    let t = '<table><thead><tr>' + head.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    for (let i = start; i < rows.length; i++) {
      const cells = rows[i].split('|').slice(1, -1).map(c => c.trim());
      t += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    return t + '</tbody></table>';
  });
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
             .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
             .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
             .replace(/^### (.+)$/gm, '<h3>$1</h3>')
             .replace(/^## (.+)$/gm, '<h2>$1</h2>')
             .replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^(\s*)[-*] (.+)$/gm, '$1<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^(\s*)(\d+)\. (.+)$/gm, '$1<oli>$3</oli>');
  html = html.replace(/(<oli>.*<\/oli>\n?)+/gs, (m) => `<ol>${m.replace(/oli/g, 'li')}</ol>`);
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>(\s*<(?:h\d|ul|ol|table|pre)[^>]*>)/g, '$1');
  html = html.replace(/(<\/(?:h\d|ul|ol|table|pre)>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*<\/p>/g, '');
  return html;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function toast(msg) {
  const t = document.createElement('div');
  t.style.cssText = "position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#420a18;color:#fbf7ee;padding:0.7rem 1.6rem;border-radius:2px;z-index:1000;font-size:0.92rem;font-family:'Newsreader',Georgia,serif;letter-spacing:0.02em;box-shadow:0 18px 40px -22px rgba(66,10,24,0.6);";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

init();
