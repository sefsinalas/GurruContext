import { loadUserStats } from '../utils/storage';

export function renderStatsModal(container: HTMLElement, onClose: () => void): void {
  const stats = loadUserStats();
  const winPct = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgGuesses = stats.gamesWon > 0 ? (stats.totalGuesses / stats.gamesWon).toFixed(1) : '0';

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card animate-pop">
        <button class="modal-close-btn" id="stats-close">✕</button>
        
        <h2 class="modal-title">Estadísticas</h2>

        <div class="stats-overview-grid">
          <div class="stat-card">
            <span class="stat-num">${stats.gamesPlayed}</span>
            <span class="stat-label">Jugados</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${winPct}%</span>
            <span class="stat-label">Victorias</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${stats.currentStreak}</span>
            <span class="stat-label">Racha actual</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">${stats.maxStreak}</span>
            <span class="stat-label">Mejor racha</span>
          </div>
        </div>

        <div class="stat-detail-row">
          <span>Promedio de intentos por victoria:</span>
          <strong>${avgGuesses}</strong>
        </div>

        <h3 class="modal-sub-title">Distribución de Cercanía</h3>
        <div class="distribution-bars">
          <div class="dist-row">
            <span class="dist-lbl green-lbl">Verde (#1-300)</span>
            <div class="dist-bar-bg">
              <div class="dist-bar-fill green-fill" style="width: ${getBarPct(stats.guessDistribution.green, stats.totalGuesses)}%"></div>
            </div>
            <span class="dist-val">${stats.guessDistribution.green}</span>
          </div>

          <div class="dist-row">
            <span class="dist-lbl yellow-lbl">Amarillo (#301-1500)</span>
            <div class="dist-bar-bg">
              <div class="dist-bar-fill yellow-fill" style="width: ${getBarPct(stats.guessDistribution.yellow, stats.totalGuesses)}%"></div>
            </div>
            <span class="dist-val">${stats.guessDistribution.yellow}</span>
          </div>

          <div class="dist-row">
            <span class="dist-lbl red-lbl">Rojo (#1501+)</span>
            <div class="dist-bar-bg">
              <div class="dist-bar-fill red-fill" style="width: ${getBarPct(stats.guessDistribution.red, stats.totalGuesses)}%"></div>
            </div>
            <span class="dist-val">${stats.guessDistribution.red}</span>
          </div>
        </div>

        <button id="stats-close-btn" class="primary-btn modal-action-btn">Cerrar</button>
      </div>
    </div>
  `;

  container.querySelector('#stats-close')?.addEventListener('click', onClose);
  container.querySelector('#stats-close-btn')?.addEventListener('click', onClose);
}

function getBarPct(val: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(8, Math.round((val / total) * 100)));
}
