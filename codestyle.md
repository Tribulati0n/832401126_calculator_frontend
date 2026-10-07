# Code Standard — 832401126_calculator_frontend

## Standard source

This project follows the **Google JavaScript Style Guide**
(https://google.github.io/styleguide/jsguide.html) as the primary standard,
with elements of the **Airbnb JavaScript Style Guide**
(https://github.com/airbnb/javascript) where they improve readability for a
vanilla-JS codebase.

Key references:

- Google JavaScript Style Guide: https://google.github.io/styleguide/jsguide.html
- Airbnb JavaScript Style Guide: https://github.com/airbnb/javascript
- MDN Web Docs (Web APIs): https://developer.mozilla.org/

## Conventions applied in this repository

### 1. Formatting

- 2-space indentation, no tabs.
- Max line length **80 characters**; template literals are used to keep
  generated DOM/HTML strings readable.
- Semicolons are **always** used (Google style, avoids ASI pitfalls).
- Single quotes for strings, double quotes only for HTML attributes inside
  template literals.

### 2. Naming

- `camelCase` for variables, functions and methods (`apiBaseUrl`,
  `fetchHistory`).
- `PascalCase` for classes (`Calculator`, `HistoryPanel`, `ApiError`).
- `UPPER_SNAKE_CASE` for module-level constants
  (`DEFAULT_API_BASE_URL`, `REQUEST_TIMEOUT_MS`, `PAGE_SIZE`).
- Private members begin with an underscore (`_insert`, `_render`).
- DOM identifiers use `kebab-case` (`#history-search`), CSS classes use
  semantic names (`.history-item`, `.key.op`).

### 3. Structure and modules

- ES Modules (`import`/`export`) with one responsibility per file:
  `config` (settings), `api` (network), `calculator` (input logic),
  `history` (list UI), `app` (composition root).
- Modules expose only what is consumed by others; implementation details
  stay inside the class.
- The DOM is touched only inside render functions; state lives in class
  fields (`this.input`, `this.items`).

### 4. Comments and documentation

- JSDoc-style block comments on every public function and class describe
  the *purpose*, not the implementation.
- Inline comments explain non-obvious rules (e.g. why a trailing operator
  is replaced, or why the front end never computes results).
- Comments never restate the code.

### 5. Error handling and robustness

- All network failures are normalized into `ApiError` with the back end's
  `message`, so the UI shows one consistent error path.
- Timeouts (`AbortController`) prevent requests from hanging forever.
- Event delegation is used for keypad and history lists, so re-rendering
  never leaks listeners.
- Optional chaining and `instanceof Element` guards make the keyboard
  handler robust against unusual event targets.

### 6. Security

- The front end never executes user input (no `eval`/`Function`) — input is
  always sent to the back end for parsing and calculation (assignment rule).
- All dynamic content is inserted with `textContent` (never `innerHTML`
  with user data), preventing XSS.
- API base URL is configurable per deployment; no credentials are stored
  in the client.

### 7. Accessibility and UX

- Interactive elements are real `<button>`/`<input>` elements with
  `aria-label`/`title` where the label is symbolic.
- Keyboard input is supported natively (see README), the theme toggle
  persists, and error banners use `role="alert"`.

## Verification

- Open `index.html` (served on port 5500) and run the checklist in the
  assignment blog: all operations, error cases, history persistence,
  deletion, search, theme, keyboard, back-end offline behavior.
- `js/` modules load without build tooling — browser console should show no
  errors (favicon 404 excluded).
