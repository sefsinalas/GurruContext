export function renderGuessInput(
  container: HTMLElement,
  onSubmit: (word: string) => void,
  onHint: () => void,
  disabled: boolean = false
): { clear: () => void; focus: () => void } {
  container.innerHTML = `
    <form id="guess-form" class="guess-form" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      <div class="input-field-container">
        <input
          type="text"
          id="guess-input"
          class="guess-input"
          placeholder="Escribe una palabra en español..."
          maxlength="25"
          ${disabled ? 'disabled' : ''}
        />
        <button type="button" id="btn-clear" class="input-clear-btn hidden" aria-label="Borrar texto">✕</button>
      </div>

      <div class="input-actions-row">
        <button type="submit" id="btn-submit" class="primary-btn submit-btn" ${disabled ? 'disabled' : ''}>
          <span>Probar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        <button type="button" id="btn-hint" class="secondary-btn hint-btn" ${disabled ? 'disabled' : ''} title="Obtener una pista">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.6 2.91 1.5 3.92.76.76 1.23 1.52 1.41 2.5"></path>
          </svg>
          <span>Pista</span>
        </button>
      </div>
    </form>
  `;

  const form = container.querySelector('#guess-form') as HTMLFormElement;
  const input = container.querySelector('#guess-input') as HTMLInputElement;
  const clearBtn = container.querySelector('#btn-clear') as HTMLButtonElement;
  const hintBtn = container.querySelector('#btn-hint') as HTMLButtonElement;

  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    input.focus();
  });

  hintBtn.addEventListener('click', onHint);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) {
      onSubmit(val);
      input.value = '';
      clearBtn.classList.add('hidden');
    }
  });

  return {
    clear: () => {
      input.value = '';
      clearBtn.classList.add('hidden');
    },
    focus: () => {
      input.focus();
    }
  };
}
