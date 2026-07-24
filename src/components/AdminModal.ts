import type { GameData } from '../types/game';
import { precomputeGame, getSecretWordForDate, CANDIDATE_SECRET_WORDS } from '../utils/precomputation';

export function renderAdminModal(
  container: HTMLElement,
  currentDate: string,
  onGameDataGenerated: (data: GameData) => void,
  onClose: () => void
): void {
  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card animate-pop">
        <button class="modal-close-btn" id="admin-close">✕</button>

        <h2 class="modal-title">⚡ Generador y Pre-cálculo</h2>
        
        <p class="admin-desc">
          Esta herramienta pre-calcula las distancias semánticas y encripta la palabra secreta con <strong>SHA-256</strong> 
          para que puedas jugar sin saber la respuesta.
        </p>

        <div class="admin-form-group">
          <label for="admin-date-input">Fecha o Código del Juego:</label>
          <input type="text" id="admin-date-input" value="${currentDate}" class="admin-input" placeholder="YYYY-MM-DD o nombre de sala" />
        </div>

        <div class="admin-actions">
          <button id="btn-calc-auto" class="primary-btn admin-btn">
            <span>🎲 Pre-calcular Juego del Día</span>
          </button>
          
          <button id="btn-calc-random" class="secondary-btn admin-btn">
            <span>🔀 Palabra Aleatoria Secreta</span>
          </button>
        </div>

        <div id="admin-status" class="admin-status-box hidden">
          <!-- Status output -->
        </div>

        <div id="admin-export-wrap" class="admin-export-box hidden">
          <p class="admin-export-title">JSON Pre-calculado (para copiar o exportar):</p>
          <textarea id="admin-json-output" class="admin-textarea" readonly></textarea>
          <div class="admin-json-actions">
            <button id="btn-copy-json" class="secondary-btn small-btn">Copiar JSON</button>
            <button id="btn-apply-now" class="primary-btn small-btn">Jugar Este Juego Ahora</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeBtn = container.querySelector('#admin-close');
  const dateInput = container.querySelector('#admin-date-input') as HTMLInputElement;
  const calcAutoBtn = container.querySelector('#btn-calc-auto') as HTMLButtonElement;
  const calcRandBtn = container.querySelector('#btn-calc-random') as HTMLButtonElement;
  const statusBox = container.querySelector('#admin-status') as HTMLDivElement;
  const exportWrap = container.querySelector('#admin-export-wrap') as HTMLDivElement;
  const jsonOutput = container.querySelector('#admin-json-output') as HTMLTextAreaElement;
  const copyJsonBtn = container.querySelector('#btn-copy-json') as HTMLButtonElement;
  const applyNowBtn = container.querySelector('#btn-apply-now') as HTMLButtonElement;

  closeBtn?.addEventListener('click', onClose);

  let lastGenerated: GameData | null = null;

  const runCalculation = async (wordOverride?: string) => {
    const inputVal = dateInput.value.trim() || currentDate;
    statusBox.classList.remove('hidden');
    statusBox.innerHTML = `
      <div class="spinner-inline"></div>
      <span>Calculando vectores de 6,000 palabras en español...</span>
    `;

    try {
      let secretWord = wordOverride;
      let gameId = Math.floor(Math.random() * 900) + 100;

      if (!secretWord) {
        const info = getSecretWordForDate(inputVal);
        secretWord = info.word;
        gameId = info.gameId;
      }

      // Precompute game in background thread
      const gameData = await precomputeGame(secretWord, inputVal, gameId);
      lastGenerated = gameData;

      statusBox.innerHTML = `
        <div class="status-success">
          ✅ <strong>Cálculo finalizado con éxito!</strong><br />
          Juego #${gameData.gameId} (${gameData.date})<br />
          Hash SHA-256: <code>${gameData.secretHash.substring(0, 16)}...</code><br />
          Longitud de palabra: ${gameData.secretLength} letras | Ránkings: ${Object.keys(gameData.ranks).length} palabras.
        </div>
      `;

      jsonOutput.value = JSON.stringify(gameData, null, 2);
      exportWrap.classList.remove('hidden');
    } catch (err) {
      statusBox.innerHTML = `<div class="status-error">Error al calcular: ${String(err)}</div>`;
    }
  };

  calcAutoBtn.addEventListener('click', () => runCalculation());
  
  calcRandBtn.addEventListener('click', () => {
    const randWord = CANDIDATE_SECRET_WORDS[Math.floor(Math.random() * CANDIDATE_SECRET_WORDS.length)];
    runCalculation(randWord);
  });

  copyJsonBtn.addEventListener('click', () => {
    if (jsonOutput.value) {
      navigator.clipboard.writeText(jsonOutput.value);
      copyJsonBtn.innerText = '¡Copiado! ✅';
      setTimeout(() => { copyJsonBtn.innerText = 'Copiar JSON'; }, 2000);
    }
  });

  applyNowBtn.addEventListener('click', () => {
    if (lastGenerated) {
      onGameDataGenerated(lastGenerated);
      onClose();
    }
  });
}
