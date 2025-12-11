/**
 * ConductorFooter Web Component
 * ------------------------------
 * A reusable footer component for all pages.
 */
class ConductorFooter extends HTMLElement {
  connectedCallback() {
    // Only create footer if it doesn't already exist
    if (this.querySelector('footer')) {
      return;
    }

    const footer = document.createElement('footer');
    footer.style.cssText = `
      margin-top: auto;
      padding: var(--spacing-medium, 1rem);
      text-align: center;
      color: var(--color-text-secondary, #666);
      border-top: 1px solid var(--color-border, #ddd);
      font-size: 0.9em;
      width: 100%;
      box-sizing: border-box;
    `;

    footer.innerHTML = `
      <p style="margin: 0; padding: 0;">&copy; 2025 Conductor by Team Py5ch. All rights reserved.</p>
    `;

    this.appendChild(footer);
  }
}

customElements.define('conductor-footer', ConductorFooter);
