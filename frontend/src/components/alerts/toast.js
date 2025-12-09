class ToastAlerts extends HTMLElement {
  constructor() {
    super();
    console.log('HERE');
  }

  connectedCallback() {
    this.classList.add('toast-alerts'); // for CSS
  }

  add({ type = 'success', message = '', duration = 3000 } = {}) {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    this.appendChild(toast);

    // auto-dismiss
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

customElements.define('toast-alerts', ToastAlerts);
