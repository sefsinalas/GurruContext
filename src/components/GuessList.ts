import type { Guess, SortMode } from '../types/game';

export function getRankCategory(rank: number): 'green' | 'yellow' | 'red' {
  if (rank <= 300) return 'green';
  if (rank <= 1500) return 'yellow';
  return 'red';
}

export function renderGuessList(
  container: HTMLElement,
  guesses: Guess[],
  sortMode: SortMode,
  onSortChange: (mode: SortMode) => void
): void {
  if (guesses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <p class="empty-title">¡Que comience el juego!</p>
        <p class="empty-desc">Ingresa cualquier palabra en español para ver qué tan cerca estás del objetivo del día.</p>
      </div>
    `;
    return;
  }

  // Calculate best rank
  const bestRank = Math.min(...guesses.map(g => g.rank));
  const bestCategory = getRankCategory(bestRank);

  // Sort guesses
  const sortedGuesses = [...guesses];
  if (sortMode === 'rank') {
    sortedGuesses.sort((a, b) => a.rank - b.rank);
  } else {
    sortedGuesses.sort((a, b) => b.timestamp - a.timestamp);
  }

  const itemsHtml = sortedGuesses
    .map((g) => {
      const cat = getRankCategory(g.rank);
      // Calculate progress percentage (Rank 1 = 100%, Rank 1500 = 25%, Rank 5000 = 5%)
      let pct = 100;
      if (g.rank > 1) {
        pct = Math.max(4, Math.round(100 - (Math.log10(g.rank) / Math.log10(4000)) * 95));
      }

      return `
        <div class="guess-item ${cat}-item ${g.rank === 1 ? 'win-item' : ''}">
          <div class="guess-rank-badge ${cat}-badge">
            ${g.rank === 1 ? '👑 #1' : `#${g.rank.toLocaleString()}`}
          </div>
          
          <div class="guess-word-wrap">
            <span class="guess-word">${escapeHtml(g.word)}</span>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${cat}-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="guess-list-header">
      <div class="guess-stats-summary">
        <span class="stat-pill">
          <strong>${guesses.length}</strong> ${guesses.length === 1 ? 'intento' : 'intentos'}
        </span>
        <span class="stat-pill best-pill ${bestCategory}-pill">
          Mejor: <strong>#${bestRank.toLocaleString()}</strong>
        </span>
      </div>

      <div class="sort-tabs">
        <button id="tab-sort-rank" class="sort-tab ${sortMode === 'rank' ? 'active' : ''}">
          Cercanía
        </button>
        <button id="tab-sort-order" class="sort-tab ${sortMode === 'order' ? 'active' : ''}">
          Orden
        </button>
      </div>
    </div>

    <div class="guess-items-container">
      ${itemsHtml}
    </div>
  `;

  container.querySelector('#tab-sort-rank')?.addEventListener('click', () => onSortChange('rank'));
  container.querySelector('#tab-sort-order')?.addEventListener('click', () => onSortChange('order'));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
