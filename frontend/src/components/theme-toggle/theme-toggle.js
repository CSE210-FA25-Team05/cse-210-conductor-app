import styles from './theme-toggle.css?inline';

class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this._boundOnToggle = this.onToggle.bind(this);
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = styles;

    this.shadowRoot.innerHTML = `
      <p class="label-theme">Dark Mode On:</p>
      <label class="theme-toggle">
        <input type="checkbox" id="toggle">
        <span class="slider"></span>
      </label>
    `;

    const toggle = this.shadowRoot.querySelector('#toggle');
    toggle.addEventListener('change', this._boundOnToggle);

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      toggle.checked = true;
    }

    this.shadowRoot.appendChild(style);
  }

  disconnectedCallback() {
    const toggle = this.shadowRoot.querySelector('#toggle');
    if (toggle) {
      toggle.removeEventListener('change', this._boundOnToggle);
    }
  }

  onToggle() {
    const checked = this.shadowRoot.querySelector('#toggle').checked;

    // Update global theme
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    this.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: { dark: checked },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('theme-toggle', ThemeToggle);
export default ThemeToggle;
