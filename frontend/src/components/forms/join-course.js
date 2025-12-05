class JoinCourseForm extends HTMLElement {
  constructor() {
    super();
    this.boundedHandleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    const form = document.createElement('form');
    form.innerHTML = `
        <label for="course-id" slot="content">Course ID
             <input 
                type="text" 
                id="course-id" 
                name="course-id" 
                required 
            />
        </label>
        <label for="join-code">Join Code
            <input
                type="text" 
                id="join-code" 
                name="join-code" 
                required 
            />
        </label>
        <button type="submit" slot="buttons">Join Course</button>
    `;
    this.appendChild(form);

    this.form = form;
    this.form.addEventListener('submit', this.boundedHandleSubmit);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this.boundedHandleSubmit);
  }
}

customElements.define('join-course-form', JoinCourseForm);
