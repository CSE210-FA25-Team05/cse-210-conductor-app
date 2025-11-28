class ThemeToggle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const label = document.createElement('label');
    const toggle = document.createElement('input');
    toggle.setAttribute('type', 'checkbox');
    label.appendChild(toggle);
    this.appendChild(label);

    // Restore saved theme state
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.checked = true;
    }

    toggle.addEventListener('change', () => {
      const checked = toggle.checked;

      if (checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

customElements.define('theme-toggle', ThemeToggle);
export default ThemeToggle;
