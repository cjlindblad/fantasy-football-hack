const fixturesTbody = document.querySelector('#fixtures-table tbody');
const historyTbody = document.querySelector('#history-table tbody');
const playerIdInput = document.querySelector('#player-id');
const loadPlayerBtn = document.querySelector('#load-player');

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadPlayer(id) {
  if (!id) return;
  const res = await fetch(`/api/player/${id}`);
  if (!res.ok) {
    fixturesTbody.innerHTML = `<tr><td colspan="7">Hittade inte spelare ${escapeHtml(id)}</td></tr>`;
    historyTbody.innerHTML = `<tr><td colspan="11">Hittade inte spelare ${escapeHtml(id)}</td></tr>`;
    return;
  }
  const data = await res.json();
  renderFixtures(data.fixtures || []);
  renderHistory(data.history || []);
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

function renderHistory(items) {
  historyTbody.innerHTML = '';
  for (const h of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(h.fixture)}</td>
      <td>${escapeHtml(h.round)}</td>
      <td>${h.kickoff_time ? new Date(h.kickoff_time).toLocaleString('sv-SE') : ''}</td>
      <td>${h.was_home ? 'Ja' : 'Nej'}</td>
      <td>${escapeHtml(h.opponent_team)}</td>
      <td>${escapeHtml(h.team_h_score)}</td>
      <td>${escapeHtml(h.team_a_score)}</td>
      <td>${escapeHtml(h.minutes)}</td>
      <td>${escapeHtml(h.total_points)}</td>
      <td>${escapeHtml(h.goals_scored)}</td>
      <td>${escapeHtml(h.assists)}</td>
      <td>${escapeHtml(h.clean_sheets)}</td>
      <td>${escapeHtml(h.goals_conceded)}</td>
      <td>${escapeHtml(h.penalties_saved)}</td>
      <td>${escapeHtml(h.penalties_missed)}</td>
      <td>${escapeHtml(h.yellow_cards)}</td>
      <td>${escapeHtml(h.red_cards)}</td>
      <td>${escapeHtml(h.saves)}</td>
      <td>${escapeHtml(h.own_goals)}</td>
      <td>${escapeHtml(h.attacking_bonus)}</td>
      <td>${escapeHtml(h.defending_bonus)}</td>
      <td>${escapeHtml(h.winning_goals)}</td>
      <td>${escapeHtml(h.key_passes)}</td>
      <td>${escapeHtml(h.clearances_blocks_interceptions)}</td>
      <td>${escapeHtml(h.value)}</td>
      <td>${escapeHtml(h.selected)}</td>
      <td>${escapeHtml(h.transfers_in)}</td>
      <td>${escapeHtml(h.transfers_out)}</td>
      <td>${escapeHtml(h.transfers_balance)}</td>
      <td>${h.modified ? 'Ja' : 'Nej'}</td>
      <td>${escapeHtml(h.element)}</td>
    `;
    historyTbody.appendChild(tr);
  }
  if (!items.length) {
    historyTbody.innerHTML = '<tr><td colspan="31">Inga tidigare matcher</td></tr>';
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
