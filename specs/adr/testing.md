# ADR V1: Selection of JavaScript Testing Framework for Full-Stack Project

## Context
The full-stack web application under development will serve as a student–professor portal enabling users to view grades, assignments, announcements, and other course-related information. The architecture comprises a frontend implemented using **native Web Components** (with minimal framework dependencies) and a backend implemented with **Fastify**, a high-performance Node.js web framework.

Because both layers rely on JavaScript and TypeScript, selecting an appropriate testing framework is essential to maintain reliability, correctness, and developer productivity. The testing setup must support three distinct levels of assurance.

First, **unit testing** is required to validate isolated business logic in the Fastify backend and in individual Web Component classes or helper modules.

Second, **component testing** should confirm that each Web Component renders correctly, responds to events, and manipulates the DOM as expected when integrated with mocked API calls.

Finally, **integration and end-to-end (E2E) testing** must verify complete user workflows, ensuring that interactions between the browser interface, Fastify routes, and the database produce correct results.

The primary challenge is finding a toolchain that is consistent across both server- and client-side environments, easy to learn for a diverse team, compatible with CI pipelines, and able to provide fast feedback loops.

---

## Decision
The team will adopt a **hybrid testing strategy**: **Jest** will serve as the main framework for unit and integration tests across both frontend and backend, and **Cypress** will be used for full end-to-end browser testing.

Jest will handle backend route and logic tests as well as Web Component unit and DOM tests using the `@testing-library/dom` utilities. Fastify endpoints will be tested in isolation through its built-in `inject()` method combined with `supertest` for integration verification.

Cypress will execute browser-level E2E tests that simulate realistic user journeys such as signing in, viewing grades, submitting assignments, and verifying role-based access controls.

This approach ensures quick, deterministic feedback during development while still providing confidence that the system behaves correctly in a live browser environment.

---

## Rationale
**Jest** remains the de facto standard for JavaScript testing, offering strong community adoption, active maintenance by Meta, and compatibility with both Node and browser environments. Its zero-configuration setup, built-in mocking capabilities, snapshot testing, and parallel execution make it ideal for large student teams. For the backend, Jest integrates cleanly with **Fastify’s `inject()` testing API**, enabling in-memory route testing without spinning up a live server. On the frontend, Jest works seamlessly with **DOM Testing Library**, allowing fine-grained validation of Web Component behavior in a jsdom environment.

**Cypress** is chosen for E2E testing because it executes in a real browser, reproducing authentic user interactions such as navigation, input, and asynchronous rendering. It provides automatic waiting, time-travel debugging, and clear visibility into network requests—features that make it easier for new contributors to understand failures. Cypress also integrates directly into CI pipelines and supports headless runs for continuous integration.

This pairing follows modern testing best practices: a majority of fast, low-level Jest tests for correctness and stability, complemented by fewer, higher-value Cypress tests for overall workflow verification.

---

## Alternatives
A number of alternatives were considered.

**Jest-only approach:** Using Jest for all tests, including E2E simulations, would simplify tooling but would not realistically capture browser-level interactions or rendering nuances specific to Web Components.

**Cypress-only approach:** While Cypress can perform component tests, running it for every unit and integration scenario would substantially increase execution time and limit the team’s ability to practice test-driven development.

**Mocha + Chai + Supertest:** This traditional Node.js stack offers flexibility but lacks Jest’s integrated mocking, coverage, and watch mode. The added configuration burden and fragmented ecosystem made it less attractive for a large student project.

**Playwright:** Another capable E2E framework that offers broader browser automation support (including WebKit). However, Playwright’s API complexity and steeper learning curve were judged less suitable for a mixed-experience team beginning its testing journey.

After evaluation, the Jest + Cypress combination provided the best balance between simplicity, capability, and maintainability given the project’s technology choices.

---

## Implementation
Jest will be installed and configured for both the backend and frontend workspaces.

For the **Fastify backend**, tests will use Jest with TypeScript and leverage Fastify’s native `inject()` utility to send requests directly to routes without network overhead. Complex API scenarios will use `supertest` for higher-level integration validation. Coverage reports will be generated through `jest --coverage` and integrated into the CI pipeline to enforce code quality.

For the **Web Components frontend**, tests will rely on Jest together with `@testing-library/dom` and `@testing-library/user-event` to simulate DOM interactions and verify rendering behavior. jsdom will provide a virtual browser environment for these tests.

**Cypress** will be configured in a dedicated `/e2e` directory to validate entire user flows such as authentication, assignment submission, and grade viewing. The tests will run in headless mode within GitHub Actions and can also be executed interactively during local development.

Continuous Integration will be structured so that unit and integration tests run first, followed by E2E tests. The workflow commands will be standardized as:
- `npm run test` for Jest  
- `npm run test:e2e` for Cypress  

The repository will maintain a clear directory structure:
