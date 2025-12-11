/**
 * Custom element for a theme toggle switch.
 * Allows users to switch between light and dark themes. The selected theme
 * preference is persisted in localStorage and applied to the document root.
 * @extends HTMLElement
 *
 * @example
 * <theme-toggle></theme-toggle>
 */
class ThemeToggle extends HTMLElement {
  /**
   * Creates an instance of ThemeToggle.
   */
  constructor() {
    super();
  }

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Creates a checkbox toggle, restores the saved theme preference from localStorage,
   * and sets up an event listener to handle theme changes.
   * @returns {void}
   */
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
