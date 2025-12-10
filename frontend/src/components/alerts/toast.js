/**
 * Web Component for displaying temporary toast notifications.
 *
 * Use `<toast-alerts>` in your HTML to create a toast container, then call
 * `.add({ type, message, duration })` to show notifications.
 *
 * Example:
 * ```html
 * <toast-alerts id="alerts"></toast-alerts>
 * ```
 *
 * ```js
 * const alerts = document.getElementById('alerts');
 * customElements.whenDefined('toast-alerts').then(() => {
 *     alerts.add({
 *       type: 'success',
 *       message: 'Data saved successfully!',
 *       duration: 4000
 *     });
 * );
 * ```
 */
class ToastAlerts extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.classList.add('toast-alerts');
  }

  /**
   * Adds a new toast notification to the element.
   *
   * @param {Object} [options={}] - Toast configuration options.
   * @param {'success' | 'error'} [options.type='success']
   *   The type of toast, which can be used to style it differently.
   * @param {string} [options.message='']
   *   The text message to display inside the toast.
   * @param {number} [options.duration=3000]
   *   How long to display the toast (in milliseconds) before it fades out.
   *
   * @example
   * alerts.add({
   *   type: 'error',
   *   message: 'Something went wrong!',
   *   duration: 5000
   * });
   *
   * @returns {void}
   */
  add({ type = 'success', message = '', duration = 3000 } = {}) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    this.appendChild(toast);

    // auto-dismiss after duration
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

customElements.define('toast-alerts', ToastAlerts);
