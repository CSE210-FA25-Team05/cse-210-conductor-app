class ConductorFooter extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('footer')) return;

    // Ensure the custom element itself is block-level and full width
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.boxSizing = 'border-box';
    this.style.margin = '0';

    // Add bottom padding so fixed footer doesn't overlap content
    const footerHeight = 72; // approx height incl. padding/border
    const currentPadding = parseInt(
      window.getComputedStyle(document.body).paddingBottom || '0',
      10
    );
    if (currentPadding < footerHeight) {
      document.body.style.paddingBottom = `${footerHeight}px`;
    }

    const footer = document.createElement('footer');
    footer.style.cssText = `
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      margin: 0;
      padding: var(--spacing-medium, 1rem);
      text-align: center;
      color: var(--color-text-secondary, #666);
      border-top: 1px solid var(--color-border, #ddd);
      background: var(--color-surface, #fff);
      font-size: 0.9em;
      box-sizing: border-box;
      z-index: 1000;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    `;
    footer.innerHTML =
      '<p style="margin:0;padding:0;">&copy; 2025 Conductor by Team Py5sch. All rights reserved.</p>';

    this.appendChild(footer);
  }
}

customElements.define('conductor-footer', ConductorFooter);

