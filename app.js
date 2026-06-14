const q = document.querySelector('#q');
const count = document.querySelector('#count');
const results = document.querySelector('#results');
const clear = document.querySelector('#clear');
const dailyWord = document.querySelector('#daily-word');
const dailyDefinition = document.querySelector('#daily-definition');
const dailyExtra = document.querySelector('#daily-extra');
const dailySearch = document.querySelector('#daily-search');
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let entries = [];

function rank(e, needle) {
  const en = norm(e.english), kr = norm(e.kriolu), sn = norm(e.sanpajudu);
  if (en === needle) return 0;
  if (en.startsWith(needle)) return 1;
  if (en.includes(needle)) return 2;
  if (kr.includes(needle)) return 3;
  if (sn.includes(needle)) return 4;
  return 99;
}

function dayIndex(size) {
  const today = new Date();
  const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor(localMidnight.getTime() / 86400000) % size;
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
  const candidates = entries.filter(isDailyCandidate);
  if (!candidates.length) {
    dailyWord.textContent = 'Unavailable';
    dailyDefinition.textContent = 'No word-of-the-day entry could be selected.';
    dailyExtra.textContent = '';
    dailySearch.disabled = true;
    return;
  }

  const entry = candidates[dayIndex(candidates.length)];
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
