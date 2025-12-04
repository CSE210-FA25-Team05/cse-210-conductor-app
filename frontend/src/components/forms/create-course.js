class CreateCourseForm extends HTMLElement {
  constructor() {
    super();
    this.boundedHandleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    const form = document.createElement('form');
    form.innerHTML = `
            <form id="createCourseForm">
                <label for="course-code">Course Code
                    <input type="text" id="course-code" name="course_code" required />
                </label>
                <br />

                <label for="course-name">Course Name
                    <input type="text" id="course-name" name="course_name" required />
                </label>
                <br />

                <label for="term">Term
                    <input type="text" id="term" name="term" required />
                </label>
                <br />

                <label for="section">Section
                    <input type="text" id="section" name="section" value="1" required />
                </label>
                <br />

                <label for="create-join-code">Join Code
                    <input type="text" id="create-join-code" name="join_code" required />
                </label>
                <br />

                <label for="start-date">Start Date
                    <input type="date" id="start-date" name="start_date" required />
                </label>
                <br />

                <label for="end-date">End Date
                    <input type="date" id="end-date" name="end_date" required />
                </label>
                <br />

                <button type="submit">Create Course</button>
            </form>
    `;

    this.appendChild(form);
  }

  handleSubmit() {
    console.log('HERE: ');
  }

  disconnectedCallback() {
    this.submit.removeEventListener('cancel', this.boundedHandleSubmit);
  }
}

customElements.define('create-course-form', CreateCourseForm);
