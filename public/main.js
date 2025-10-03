const table = document.querySelector('#data-table tbody');
const searchInput = document.querySelector('#search');
const refreshBtn = document.querySelector('#refresh');
const headers = Array.from(document.querySelectorAll('#data-table thead th'));

let currentSort = { key: 'createdAt', dir: 'desc' };
let lastQuery = '';

async function fetchData() {
  const params = new URLSearchParams();
  if (lastQuery) params.set('q', lastQuery);
  if (currentSort.key) params.set('sort', currentSort.key);
  if (currentSort.dir) params.set('dir', currentSort.dir);
  const res = await fetch(`/api/data?${params.toString()}`);
  const data = await res.json();
  renderRows(data.items || []);
}

function renderRows(items) {
  table.innerHTML = '';
  for (const r of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.category)}</td>
      <td>${Number(r.value).toLocaleString('sv-SE')}</td>
      <td>${new Date(r.createdAt).toLocaleString('sv-SE')}</td>
    `;
    table.appendChild(tr);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

headers.forEach(h => {
  h.addEventListener('click', () => {
    const key = h.dataset.key;
    if (!key) return;
    if (currentSort.key === key) {
      currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.key = key;
      currentSort.dir = 'asc';
    }
    fetchData();
  });
});

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    lastQuery = searchInput.value.trim();
    fetchData();
  }, 250);
});

refreshBtn.addEventListener('click', () => fetchData());

const addForm = document.querySelector('#add-form');
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(addForm);
  const payload = { name: form.get('name'), category: form.get('category'), value: Number(form.get('value')) };
  const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { alert('Misslyckades att lägga till rad'); return; }
  addForm.reset();
  fetchData();
});

fetchData();
