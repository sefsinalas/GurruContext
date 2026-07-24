export function renderHeader(
  container: HTMLElement,
  gameId: number,
  onOpenStats: () => void,
  onOpenHelp: () => void,
  onOpenAdmin: () => void,
  onShare: () => void
): void {
  container.innerHTML = `
    <header class="app-header">
      <div class="header-left">
        <div class="logo-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m12 8-4 4 4 4"></path>
            <path d="M16 12H8"></path>
          </svg>
        </div>
        <div class="header-title-wrap">
          <h1 class="header-title">GurruContexto</h1>
          <span class="header-subtitle">Juego #${gameId}</span>
        </div>
      </div>

      <div class="header-actions">
        <button id="btn-share-header" class="icon-btn highlight-btn" title="Compartir resultado" aria-label="Compartir">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        <button id="btn-stats" class="icon-btn" title="Estadísticas" aria-label="Estadísticas">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </button>

        <button id="btn-help" class="icon-btn" title="Cómo jugar" aria-label="Cómo jugar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>

        <button id="btn-admin" class="icon-btn" title="Generador / Pre-cálculo" aria-label="Generador">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    </header>
  `;

  container.querySelector('#btn-stats')?.addEventListener('click', onOpenStats);
  container.querySelector('#btn-help')?.addEventListener('click', onOpenHelp);
  container.querySelector('#btn-admin')?.addEventListener('click', onOpenAdmin);
  container.querySelector('#btn-share-header')?.addEventListener('click', onShare);
}
