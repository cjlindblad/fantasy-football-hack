const fixturesTbody = document.querySelector('#fixtures-table tbody');
const historyTbody = document.querySelector('#history-table tbody');
const playerIdInput = document.querySelector('#player-id');
const loadPlayerBtn = document.querySelector('#load-player');
const playerMeta = document.querySelector('#player-meta');

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isJsonResponse(res) {
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json');
}

async function loadPlayer(id) {
  if (!id) return;
  const [resSimple, resFull] = await Promise.all([
    fetch(`/api/player-simple/${id}`),
    fetch(`/api/player/${id}`),
    fetch(`/api/player-meta/${id}`)
  ]);
  const resMeta = arguments[0];
  if ((!resSimple.ok || !isJsonResponse(resSimple)) && (!resFull.ok || !isJsonResponse(resFull))) {
    fixturesTbody.innerHTML = `<tr><td colspan="7">Hittade inte spelare ${escapeHtml(id)}</td></tr>`;
    historyTbody.innerHTML = `<tr><td colspan="11">Hittade inte spelare ${escapeHtml(id)}</td></tr>`;
    return;
  }
  let simple = (resSimple.ok && isJsonResponse(resSimple)) ? await resSimple.json() : { history: [] };
  const full = (resFull.ok && isJsonResponse(resFull)) ? await resFull.json() : { fixtures: [], history: [] };
  // Meta
  try {
    const metaRes = await fetch(`/api/player-meta/${id}`);
    if (metaRes.ok && isJsonResponse(metaRes)) {
      const meta = await metaRes.json();
      const fullName = `${escapeHtml(meta.first_name || '')} ${escapeHtml(meta.second_name || '')}`.trim();
      const teamName = escapeHtml(meta.team_name || '');
      playerMeta.textContent = fullName && teamName ? `${fullName} – ${teamName}` : '';
    } else {
      playerMeta.textContent = '';
    }
  } catch (_) {
    playerMeta.textContent = '';
  }
  // If simple file missing, derive simplified history client-side from full history
  if ((!simple.history || !simple.history.length) && full.history && full.history.length) {
    simple = {
      history: full.history.map(h => ({
        fixture: h.fixture,
        minutes: h.minutes,
        total_points: h.total_points,
        goals_scored: h.goals_scored,
        assists: h.assists,
        clean_sheets: h.clean_sheets,
        key_passes: h.key_passes,
        clearances_blocks_interceptions: h.clearances_blocks_interceptions,
        winning_goals: h.winning_goals,
      }))
    };
  }
  renderFixtures(full.fixtures || []);
  renderHistory(simple.history || []);
}

function renderFixtures(items) {
  fixturesTbody.innerHTML = '';
  for (const f of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(f.id)}</td>
      <td>${escapeHtml(f.code)}</td>
      <td>${escapeHtml(f.event_name)}</td>
      <td>${escapeHtml(f.event)}</td>
      <td>${f.kickoff_time ? new Date(f.kickoff_time).toLocaleString('sv-SE') : ''}</td>
      <td>${escapeHtml(f.team_h)}</td>
      <td>${f.team_h_score ?? ''}</td>
      <td>${escapeHtml(f.team_a)}</td>
      <td>${f.team_a_score ?? ''}</td>
      <td>${f.is_home ? 'Ja' : 'Nej'}</td>
      <td>${escapeHtml(f.minutes)}</td>
      <td>${f.finished ? 'Ja' : 'Nej'}</td>
      <td>${f.provisional_start_time ? 'Ja' : 'Nej'}</td>
    `;
    fixturesTbody.appendChild(tr);
  }
  if (!items.length) {
    fixturesTbody.innerHTML = '<tr><td colspan="13">Inga kommande matcher</td></tr>';
  }
}


function guessPointsForNextFixture(items) {
  
}

function renderHistory(items) {
  historyTbody.innerHTML = '';
  let idx = 1;
  for (const h of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx}</td>
      <td>${escapeHtml(h.minutes)}</td>
      <td>${escapeHtml(h.total_points)}</td>
      <td>${escapeHtml(h.goals_scored)}</td>
      <td>${escapeHtml(h.assists)}</td>
      <td>${escapeHtml(h.clean_sheets)}</td>
      <td>${escapeHtml(h.key_passes)}</td>
      <td>${escapeHtml(h.clearances_blocks_interceptions)}</td>
      <td>${escapeHtml(h.winning_goals)}</td>
    `;
    historyTbody.appendChild(tr);
    idx += 1;
  }
  if (!items.length) {
    historyTbody.innerHTML = '<tr><td colspan="8">Inga tidigare matcher</td></tr>';
  }
}

loadPlayerBtn.addEventListener('click', () => {
  const id = Number(playerIdInput.value);
  if (!Number.isFinite(id) || id <= 0) return;
  loadPlayer(id);
});

playerIdInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const id = Number(playerIdInput.value);
    if (!Number.isFinite(id) || id <= 0) return;
    loadPlayer(id);
  }
});
