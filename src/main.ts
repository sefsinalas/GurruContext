import './style.css';
import type { GameData, GameState, Guess, SortMode } from './types/game';
import { normalizeWord, sha256 } from './utils/crypto';
import { getSecretWordForDate, precomputeGame, getRankForGuess } from './utils/precomputation';
import { loadGameState, saveGameState, recordGameWin } from './utils/storage';
import { renderHeader } from './components/Header';
import { renderGuessInput } from './components/GuessInput';
import { renderGuessList, getRankCategory } from './components/GuessList';
import { renderWinModal, generateShareText } from './components/WinModal';
import { renderStatsModal } from './components/StatsModal';
import { renderHelpModal } from './components/HelpModal';
import { renderAdminModal } from './components/AdminModal';

// Current active date
const TODAY_DATE = new Date().toISOString().split('T')[0];

class GurruContextoApp {
  private gameData: GameData | null = null;
  private gameState: GameState | null = null;
  private sortMode: SortMode = 'rank';
  private activeToastTimer: number | null = null;

  private headerContainer!: HTMLElement;
  private inputContainer!: HTMLElement;
  private toastContainer!: HTMLElement;
  private listContainer!: HTMLElement;
  private modalContainer!: HTMLElement;

  public async init(): Promise<void> {
    this.createAppLayout();
    await this.loadOrCreateGame(TODAY_DATE);
    this.render();
  }

  private createAppLayout(): void {
    const app = document.querySelector('#app') as HTMLElement;
    app.innerHTML = `
      <div id="header-container"></div>
      <div id="input-container"></div>
      <div id="toast-container"></div>
      <main id="list-container" class="guess-list-section"></main>
      <div id="modal-container"></div>
    `;

    this.headerContainer = app.querySelector('#header-container')!;
    this.inputContainer = app.querySelector('#input-container')!;
    this.toastContainer = app.querySelector('#toast-container')!;
    this.listContainer = app.querySelector('#list-container')!;
    this.modalContainer = app.querySelector('#modal-container')!;
  }

  private async loadOrCreateGame(dateStr: string, customSecretWord?: string): Promise<void> {
    try {
      let secretWord = customSecretWord;
      let gameId = 101;

      if (!secretWord) {
        const secretInfo = getSecretWordForDate(dateStr);
        secretWord = secretInfo.word;
        gameId = secretInfo.gameId;
      }

      // Precompute game dataset for fast client performance
      this.gameData = await precomputeGame(secretWord, dateStr, gameId);

      // Load saved state or initialize new
      const saved = loadGameState(dateStr);
      if (saved && saved.gameId === this.gameData.gameId) {
        this.gameState = saved;
      } else {
        this.gameState = {
          gameId: this.gameData.gameId,
          date: dateStr,
          guesses: [],
          isSolved: false,
          bestRank: null,
          startTime: Date.now(),
          hintsUsed: 0
        };
        saveGameState(this.gameState);
      }
    } catch (e) {
      console.error('Error initializing game:', e);
      this.showToast('Error al cargar el juego del día.');
    }
  }

  private render(): void {
    if (!this.gameData || !this.gameState) return;

    // Render Header
    renderHeader(
      this.headerContainer,
      this.gameData.gameId,
      () => this.openStatsModal(),
      () => this.openHelpModal(),
      () => this.openAdminModal(),
      () => this.handleHeaderShare()
    );

    // Render Input Form
    renderGuessInput(
      this.inputContainer,
      (word) => this.handleGuessSubmit(word),
      () => this.handleHint(),
      this.gameState.isSolved
    );

    // Render Guesses List
    renderGuessList(
      this.listContainer,
      this.gameState.guesses,
      this.sortMode,
      (newMode) => {
        this.sortMode = newMode;
        this.renderList();
      }
    );
  }

  private renderList(): void {
    if (!this.gameState) return;
    renderGuessList(
      this.listContainer,
      this.gameState.guesses,
      this.sortMode,
      (newMode) => {
        this.sortMode = newMode;
        this.renderList();
      }
    );
  }

  private async handleGuessSubmit(wordRaw: string): Promise<void> {
    if (!this.gameData || !this.gameState || this.gameState.isSolved) return;

    const word = normalizeWord(wordRaw);

    if (word.length < 2) {
      this.showToast('⚠️ La palabra debe tener al menos 2 letras.');
      return;
    }

    // Check if word was already guessed
    const existing = this.gameState.guesses.find((g) => normalizeWord(g.word) === word);
    if (existing) {
      this.showToast(`ℹ️ Ya probaste "${word}". Posición: #${existing.rank}`);
      return;
    }

    // Check if input matches secret hash
    const inputHash = await sha256(word);
    let rank = 1;
    let sim = 1.0;

    if (inputHash === this.gameData.secretHash) {
      rank = 1;
      sim = 1.0;
    } else {
      const result = getRankForGuess(word, this.gameData);
      rank = result.rank;
      sim = result.similarity;
    }

    const newGuess: Guess = {
      word,
      rank,
      similarity: sim,
      timestamp: Date.now()
    };

    this.gameState.guesses.push(newGuess);

    // Update best rank
    if (this.gameState.bestRank === null || rank < this.gameState.bestRank) {
      this.gameState.bestRank = rank;
    }

    // Check if win!
    if (rank === 1) {
      this.gameState.isSolved = true;
      this.gameState.endTime = Date.now();

      // Record win stats
      let green = 0, yellow = 0, red = 0;
      this.gameState.guesses.forEach((g) => {
        const cat = getRankCategory(g.rank);
        if (cat === 'green') green++;
        else if (cat === 'yellow') yellow++;
        else red++;
      });

      recordGameWin(this.gameState.date, this.gameState.guesses.length, { green, yellow, red });
      saveGameState(this.gameState);

      this.render();
      this.openWinModal();
      return;
    }

    saveGameState(this.gameState);
    this.renderList();

    // Feedback Toast for great guesses
    if (rank <= 50) {
      this.showToast(`🔥 ¡CALIENTÍSIMO! #${rank} "${word}"`);
    } else if (rank <= 300) {
      this.showToast(`🟩 ¡Muy cerca! #${rank} "${word}"`);
    } else if (rank <= 1500) {
      this.showToast(`🟨 Tibio. #${rank} "${word}"`);
    }
  }

  private handleHint(): void {
    if (!this.gameData || !this.gameState) return;

    this.gameState.hintsUsed += 1;
    const hints = [
      `💡 Categoría: ${this.gameData.category}`,
      `💡 La palabra secreta tiene ${this.gameData.secretLength} letras.`,
      `💡 Tip: Intenta con sinónimos o conceptos relacionados de la categoría ${this.gameData.category}.`
    ];

    const hintIndex = (this.gameState.hintsUsed - 1) % hints.length;
    this.showToast(hints[hintIndex]);
  }

  private handleHeaderShare(): void {
    if (!this.gameData || !this.gameState) return;

    if (this.gameState.guesses.length === 0) {
      this.showToast('🎯 Haz algunos intentos antes de compartir tu resultado.');
      return;
    }

    if (this.gameState.isSolved) {
      this.openWinModal();
    } else {
      const shareText = generateShareText(this.gameData.gameId, this.gameState.guesses);
      navigator.clipboard.writeText(shareText);
      this.showToast('📋 ¡Estadísticas actuales copiadas al portapapeles!');
    }
  }

  private showToast(msg: string): void {
    if (this.activeToastTimer) {
      clearTimeout(this.activeToastTimer);
    }

    this.toastContainer.innerHTML = `
      <div class="toast-notification">
        <span>${msg}</span>
      </div>
    `;

    this.activeToastTimer = window.setTimeout(() => {
      this.toastContainer.innerHTML = '';
      this.activeToastTimer = null;
    }, 3200);
  }

  private openWinModal(): void {
    if (!this.gameData || !this.gameState) return;
    renderWinModal(
      this.modalContainer,
      this.gameData.gameId,
      this.gameState.guesses,
      () => { this.modalContainer.innerHTML = ''; }
    );
  }

  private openStatsModal(): void {
    renderStatsModal(this.modalContainer, () => { this.modalContainer.innerHTML = ''; });
  }

  private openHelpModal(): void {
    renderHelpModal(this.modalContainer, () => { this.modalContainer.innerHTML = ''; });
  }

  private openAdminModal(): void {
    renderAdminModal(
      this.modalContainer,
      TODAY_DATE,
      (newGameData) => {
        this.gameData = newGameData;
        this.gameState = {
          gameId: newGameData.gameId,
          date: newGameData.date,
          guesses: [],
          isSolved: false,
          bestRank: null,
          startTime: Date.now(),
          hintsUsed: 0
        };
        saveGameState(this.gameState);
        this.render();
        this.showToast(`⚡ ¡Cargado juego pre-calculado #${newGameData.gameId}!`);
      },
      () => { this.modalContainer.innerHTML = ''; }
    );
  }
}

// Launch App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new GurruContextoApp();
  app.init();
});
