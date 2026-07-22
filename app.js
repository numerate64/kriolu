const q = document.querySelector('#q');
const count = document.querySelector('#count');
const results = document.querySelector('#results');
const clear = document.querySelector('#clear');
const dailyWord = document.querySelector('#daily-word');
const dailyDate = document.querySelector('#daily-date');
const dailyDefinition = document.querySelector('#daily-definition');
const dailyExtra = document.querySelector('#daily-extra');
const dailySearch = document.querySelector('#daily-search');
const themeToggle = document.querySelector('#theme-toggle');
const themeLabel = document.querySelector('#theme-label');
const themeColor = document.querySelector('meta[name="theme-color"]');
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let entries = [];
const DAY_MS = 86400000;

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeColor.content = isDark ? '#0f172a' : '#f5f7fb';
}

function rank(e, needle) {
  const en = norm(e.english), kr = norm(e.kriolu), sn = norm(e.sanpajudu);
  if (en === needle) return 0;
  if (en.startsWith(needle)) return 1;
  if (en.includes(needle)) return 2;
  if (kr.includes(needle)) return 3;
  if (sn.includes(needle)) return 4;
  return 99;
}

function dateSerial(date = new Date()) {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight.getTime() / DAY_MS);
}

function formatDailyDate(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function stableHash(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function entryKey(e) {
  return norm(e.kriolu).replace(/\s+/g, ' ');
}

function betterDailyEntry(current, next) {
  if (!current) return next;
  const currentPrimary = /english-kriolu/i.test(current.source || '');
  const nextPrimary = /english-kriolu/i.test(next.source || '');
  if (nextPrimary && !currentPrimary) return next;
  if (currentPrimary !== nextPrimary) return current;
  return String(next.english || '').length < String(current.english || '').length ? next : current;
}

function uniqueDailyCandidates() {
  const byWord = new Map();
  entries.filter(isDailyCandidate).forEach((entry) => {
    const key = entryKey(entry);
    if (!key) return;
    byWord.set(key, betterDailyEntry(byWord.get(key), entry));
  });
  return Array.from(byWord.entries()).map(([key, entry]) => ({ key, entry }));
}

function dailyChoice(candidates, date = new Date()) {
  const size = candidates.length;
  if (!size) return null;
  const serial = dateSerial(date);
  const cycle = Math.floor(serial / size);
  const position = serial % size;
  const seed = `kriolu-word-of-day:${cycle}:${size}`;
  return candidates
    .slice()
    .sort((a, b) => stableHash(`${seed}:${a.key}`) - stableHash(`${seed}:${b.key}`) || a.key.localeCompare(b.key))[position].entry;
}

function isDailyCandidate(e) {
  const definition = norm(e.english);
  const word = norm(e.kriolu);
  if (!word || !definition || definition.length > 120) return false;
  if (definition.includes('vulg') || definition.includes('asshole') || definition.includes('fuck')) return false;
  if (definition.includes(' see ') || definition.startsWith('see ')) return false;
  return true;
}

function renderDailyWord() {
  const candidates = uniqueDailyCandidates();
  if (!candidates.length) {
    dailyDate.textContent = formatDailyDate();
    dailyWord.textContent = 'Unavailable';
    dailyDefinition.textContent = 'No word-of-the-day entry could be selected.';
    dailyExtra.textContent = '';
    dailySearch.disabled = true;
    return;
  }

  const entry = dailyChoice(candidates);
  dailyDate.textContent = formatDailyDate();
  dailyWord.textContent = entry.kriolu;
  dailyDefinition.textContent = entry.english;
  dailyExtra.innerHTML = [
    entry.partOfSpeech ? `<span class="pill">${esc(entry.partOfSpeech)}</span>` : '',
    entry.sanpajudu ? `<span class="pill">Sanpajudu: ${esc(entry.sanpajudu)}</span>` : '',
    entry.source ? `<span class="pill">${esc(entry.source)}</span>` : ''
  ].filter(Boolean).join('');
  dailySearch.disabled = false;
  dailySearch.dataset.word = entry.kriolu;
}

function render() {
  const needle = norm(q.value);
  if (!needle) {
    count.textContent = `${entries.length.toLocaleString()} entries loaded`;
    results.innerHTML = '<div class="empty">Type an English or Kriolu word to search the dictionary.</div>';
    return;
  }
  const matches = entries
    .map(e => [rank(e, needle), e])
    .filter(([r]) => r < 99)
    .sort((a,b) => a[0] - b[0] || a[1].english.localeCompare(b[1].english))
    .slice(0, 60)
    .map(([,e]) => e);
  count.textContent = `${matches.length.toLocaleString()} match${matches.length === 1 ? '' : 'es'}`;
  results.innerHTML = matches.length
    ? matches.map(e => `<article class="card"><div class="word"><span class="english">${esc(e.english)}</span><span class="pos">${esc(e.partOfSpeech || '')}</span></div><div class="kriolu">${esc(e.kriolu)}</div>${e.sanpajudu ? `<div class="sanpajudu">Sanpajudu: ${esc(e.sanpajudu)}</div>` : ''}${e.source ? `<div class="source">${esc(e.source)}</div>` : ''}</article>`).join('')
    : '<div class="empty">No matches found.</div>';
}

clear.addEventListener('click', () => { q.value = ''; q.focus(); render(); });
q.addEventListener('input', render);
setTheme(document.documentElement.dataset.theme || 'light');
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('kriolu-theme', theme);
  setTheme(theme);
});
dailySearch.addEventListener('click', () => {
  q.value = dailySearch.dataset.word || dailyWord.textContent;
  q.focus();
  render();
});
fetch('/kriolu/dictionary.json')
  .then(r => r.json())
  .then(data => { entries = Array.isArray(data) ? data : []; renderDailyWord(); render(); })
  .catch(err => {
    count.textContent = 'Dictionary failed to load';
    dailyWord.textContent = 'Unavailable';
    dailyDefinition.textContent = 'Dictionary failed to load.';
    dailySearch.disabled = true;
    results.innerHTML = `<div class="empty">${esc(err.message || err)}</div>`;
  });
