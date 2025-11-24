import styles from './theme-toggle.css?inline';

class ThemeToggle extends HTMLElement {
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

    // Restore saved theme state
    if (localStorage.getItem('theme') === 'dark') {
      toggle.checked = true;
    }

    toggle.addEventListener('change', () => {
      const checked = toggle.checked;

      if (checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });

    this.shadowRoot.appendChild(style);
  }
}

customElements.define('theme-toggle', ThemeToggle);
export default ThemeToggle;
