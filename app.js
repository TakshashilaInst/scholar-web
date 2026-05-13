// Takshashila Scholar — Frontend logic
// API key is stored only in localStorage. Calls go directly to Anthropic API.

const STORAGE_KEYS = {
  apiKey: 'takshashila_scholar_api_key',
  model: 'takshashila_scholar_model'
};

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// State
let currentWorkflow = null;
let conversationHistory = [];
let isStreaming = false;

// DOM elements
const settingsPanel = document.getElementById('settings-panel');
const settingsBtn = document.getElementById('settings-btn');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');
const saveSettingsBtn = document.getElementById('save-settings');
const clearSettingsBtn = document.getElementById('clear-settings');
const workflowSelect = document.getElementById('workflow-select');
const workflowChat = document.getElementById('workflow-chat');
const workflowTitle = document.getElementById('workflow-title');
const messagesEl = document.getElementById('messages');
const inputForm = document.getElementById('input-form');
const inputText = document.getElementById('input-text');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-btn');
const resetBtn = document.getElementById('reset-btn');

// Init
function init() {
  loadSettings();
  attachEventListeners();
  // Show settings if no API key yet
  if (!getApiKey()) {
    settingsPanel.classList.remove('hidden');
  }
}

function loadSettings() {
  const storedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
  const storedModel = localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL;
  if (storedKey) apiKeyInput.value = storedKey;
  modelSelect.value = storedModel;
}

function getApiKey() {
  return localStorage.getItem(STORAGE_KEYS.apiKey);
}

function getModel() {
  return localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL;
}

function attachEventListeners() {
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  saveSettingsBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem(STORAGE_KEYS.apiKey, key);
    }
    localStorage.setItem(STORAGE_KEYS.model, modelSelect.value);
    settingsPanel.classList.add('hidden');
    showToast('Settings saved');
  });

  clearSettingsBtn.addEventListener('click', () => {
    if (confirm('Clear your API key from this browser?')) {
      localStorage.removeItem(STORAGE_KEYS.apiKey);
      apiKeyInput.value = '';
      showToast('API key cleared');
    }
  });

  // Workflow cards
  document.querySelectorAll('.workflow-card').forEach(card => {
    card.addEventListener('click', () => {
      const workflow = card.dataset.workflow;
      startWorkflow(workflow);
    });
  });

  backBtn.addEventListener('click', () => {
    if (conversationHistory.length > 1 && !confirm('Leave this conversation? It will be lost.')) {
      return;
    }
    showWorkflowSelect();
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Reset this conversation?')) {
      startWorkflow(currentWorkflow);
    }
  });

  inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputText.value.trim();
    if (!text || isStreaming) return;
    await sendMessage(text);
  });

  inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputForm.dispatchEvent(new Event('submit'));
    }
  });
}

function startWorkflow(workflowKey) {
  if (!getApiKey()) {
    settingsPanel.classList.remove('hidden');
    showToast('Please add your Anthropic API key first');
    return;
  }

  const prompt = PROMPTS[workflowKey];
  if (!prompt) return;

  currentWorkflow = workflowKey;
  conversationHistory = [];
  workflowTitle.textContent = prompt.title;
  messagesEl.innerHTML = '';

  // Add the intro as an assistant message
  addMessage('assistant', prompt.intro);

  workflowSelect.classList.add('hidden');
  workflowChat.classList.remove('hidden');
  inputText.focus();
}

function showWorkflowSelect() {
  currentWorkflow = null;
  conversationHistory = [];
  workflowChat.classList.add('hidden');
  workflowSelect.classList.remove('hidden');
}

function addMessage(role, content) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;

  const roleEl = document.createElement('div');
  roleEl.className = 'message-role';
  roleEl.textContent = role === 'user' ? 'You' : 'Scholar';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.innerHTML = renderMarkdown(content);

  messageEl.appendChild(roleEl);
  messageEl.appendChild(contentEl);
  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return contentEl;
}

async function sendMessage(text) {
  addMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });
  inputText.value = '';
  isStreaming = true;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';

  // Add placeholder for assistant response
  const assistantContentEl = addMessage('assistant', '');
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'thinking';
  thinkingEl.textContent = 'Thinking...';
  assistantContentEl.appendChild(thinkingEl);

  try {
    const response = await callAnthropic(conversationHistory, PROMPTS[currentWorkflow].system);
    assistantContentEl.innerHTML = renderMarkdown(response);
    conversationHistory.push({ role: 'assistant', content: response });
  } catch (err) {
    assistantContentEl.innerHTML = `<p style="color: #c0392b;"><strong>Error:</strong> ${escapeHtml(err.message)}</p>`;
    // Remove the failed user message from history so they can retry
    conversationHistory.pop();
  } finally {
    isStreaming = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    messagesEl.scrollTop = messagesEl.scrollHeight;
    inputText.focus();
  }
}

async function callAnthropic(messages, systemPrompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set. Add one in Settings.');

  const response = await fetch(ANTHROPIC_API_URL, {
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
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error?.message) errorMsg = errorData.error.message;
    } catch (e) { /* ignore */ }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text;
  }
  throw new Error('Unexpected response format from Anthropic API');
}

// Minimal markdown rendering — covers headings, bold/italic, lists, code, tables, links
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(/```([^`]*?)```/gs, (m, code) => `<pre><code>${code.trim()}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Tables (basic)
  html = html.replace(/((?:^\|.*\|\s*\n)+)/gm, (tableBlock) => {
    const rows = tableBlock.trim().split('\n');
    if (rows.length < 2) return tableBlock;
    const headerCells = rows[0].split('|').slice(1, -1).map(c => c.trim());
    const isSeparator = (r) => /^\|[\s\-:|]+\|$/.test(r);
    const dataStart = isSeparator(rows[1]) ? 2 : 1;
    let table = '<table><thead><tr>' + headerCells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    for (let i = dataStart; i < rows.length; i++) {
      const cells = rows[i].split('|').slice(1, -1).map(c => c.trim());
      table += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    table += '</tbody></table>';
    return table;
  });

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Lists
  html = html.replace(/^(\s*)[-*] (.+)$/gm, '$1<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^(\s*)(\d+)\. (.+)$/gm, '$1<oli>$3</oli>');
  html = html.replace(/(<oli>.*<\/oli>\n?)+/gs, (m) => `<ol>${m.replace(/oli/g, 'li')}</ol>`);

  // Line breaks (preserve paragraphs)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';
  // Clean up empty paragraphs around block elements
  html = html.replace(/<p>(\s*<(?:h\d|ul|ol|table|pre)[^>]*>)/g, '$1');
  html = html.replace(/(<\/(?:h\d|ul|ol|table|pre)>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#5C0B22;color:white;padding:0.75rem 1.5rem;border-radius:6px;z-index:1000;font-size:0.9rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Start
init();
