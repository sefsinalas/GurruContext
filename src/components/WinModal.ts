import confetti from 'canvas-confetti';
import type { Guess } from '../types/game';
import { getRankCategory } from './GuessList';

export function fireVictoryConfetti(): void {
  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

export function generateShareText(gameId: number, guesses: Guess[]): string {
  const total = guesses.length;
  const bestRank = Math.min(...guesses.map(g => g.rank));
  
  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;

  guesses.forEach((g) => {
    const cat = getRankCategory(g.rank);
    if (cat === 'green') greenCount++;
    else if (cat === 'yellow') yellowCount++;
    else redCount++;
  });

  const url = window.location.origin;

  return `GurruContexto #${gameId} 🎯
Intentos: ${total}
Mejor posición: #${bestRank}
🟩 ${greenCount}  🟨 ${yellowCount}  🟥 ${redCount}

¡Juega tú también en: ${url}`;
}

export function renderWinModal(
  container: HTMLElement,
  gameId: number,
  guesses: Guess[],
  onClose: () => void
): void {
  const total = guesses.length;
  const shareText = generateShareText(gameId, guesses);

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card win-modal-card animate-pop">
        <button class="modal-close-btn" id="modal-close">✕</button>

        <div class="win-header">
          <div class="win-trophy">🏆</div>
          <h2 class="win-title">¡VICTORIA!</h2>
          <p class="win-subtitle">¡Encontraste la palabra secreta del día!</p>
        </div>

        <div class="win-stats-grid">
          <div class="win-stat-box">
            <span class="win-stat-val">${total}</span>
            <span class="win-stat-lbl">Intentos</span>
          </div>
          <div class="win-stat-box">
            <span class="win-stat-val">#1</span>
            <span class="win-stat-lbl">Posición</span>
          </div>
        </div>

        <div class="share-box">
          <p class="share-title">Comparte tu logro con tus amigos:</p>
          <pre class="share-preview">${shareText}</pre>
          <button id="btn-copy-share" class="primary-btn share-btn-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span id="share-btn-text">Copiar al portapapeles</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#modal-close')?.addEventListener('click', onClose);
  const copyBtn = container.querySelector('#btn-copy-share') as HTMLButtonElement;
  const btnText = container.querySelector('#share-btn-text') as HTMLSpanElement;

  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `GurruContexto #${gameId}`,
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        btnText.innerText = '¡Copiado con éxito! ✅';
        copyBtn.classList.add('success-btn');
        setTimeout(() => {
          btnText.innerText = 'Copiar al portapapeles';
          copyBtn.classList.remove('success-btn');
        }, 2500);
      }
    } catch (err) {
      // Fallback
      await navigator.clipboard.writeText(shareText);
      btnText.innerText = '¡Copiado con éxito! ✅';
    }
  });

  fireVictoryConfetti();
}
