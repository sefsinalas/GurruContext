export function renderHelpModal(container: HTMLElement, onClose: () => void): void {
  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-card animate-pop">
        <button class="modal-close-btn" id="help-close">✕</button>

        <h2 class="modal-title">¿Cómo jugar?</h2>

        <div class="help-content">
          <p class="help-intro">
            GurruContexto es un juego de <strong>cercanía semántica</strong>. Tu objetivo es encontrar la <strong>palabra secreta del día</strong>.
          </p>

          <ul class="help-steps">
            <li>
              <div class="help-step-icon">1</div>
              <div>Escribe cualquier palabra en español para probar su posición.</div>
            </li>
            <li>
              <div class="help-step-icon">2</div>
              <div>
                Cada palabra que pruebes recibirá una <strong>posición o ranking</strong>. 
                La palabra secreta es la <strong>#1</strong>. La palabra más parecida en significado es la <strong>#2</strong>.
              </div>
            </li>
            <li>
              <div class="help-step-icon">3</div>
              <div>
                El algoritmo analiza el contexto y significado. Por ejemplo, si la palabra secreta es <i>CASA</i>, palabras como <i>HOGAR</i> o <i>EDIFICIO</i> estarán muy cerca.
              </div>
            </li>
          </ul>

          <h3 class="modal-sub-title">Código de Colores</h3>
          <div class="color-guide">
            <div class="color-item">
              <span class="color-badge green-badge">#1 - #300</span>
              <span class="color-desc"><strong>Verde:</strong> ¡Muy cerca del objetivo!</span>
            </div>
            <div class="color-item">
              <span class="color-badge yellow-badge">#301 - #1500</span>
              <span class="color-desc"><strong>Amarillo:</strong> Tibio. Te estás acercando.</span>
            </div>
            <div class="color-item">
              <span class="color-badge red-badge">#1501+</span>
              <span class="color-desc"><strong>Rojo:</strong> Frío. Lejano del significado.</span>
            </div>
          </div>
        </div>

        <button id="help-close-btn" class="primary-btn modal-action-btn">¡Entendido!</button>
      </div>
    </div>
  `;

  container.querySelector('#help-close')?.addEventListener('click', onClose);
  container.querySelector('#help-close-btn')?.addEventListener('click', onClose);
}
