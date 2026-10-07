# 832401126_calculator_frontend

Front end of the **Front-End / Back-End Separation Calculator System** assignment.

A single-page calculator web client (plain HTML/CSS/ES Modules — no build
step) that talks to the Flask back end (`832401126_calculator_backend`)
exclusively over HTTP. The front end is responsible for the user interface:
expression input, button/keyboard interaction, result display, history
display and history deletion. **It never computes a result itself** — every
calculation is performed by the back end API.

---

## Features

- Basic operations: addition, subtraction, multiplication, division
- Compound expressions: operator precedence, parentheses, unary `+`/`-`,
  decimals, exponent `^`, modulo `%`, postfix factorial `!`
- Back-end error display (invalid expression, division by zero, ...)
- Calculation history: loaded from the back-end database, searchable,
  paginated, individually deletable, clearable
- Back-end connectivity indicator (green/red)
- Scientific panel: `sin cos tan ln log √ π e x² xʸ ! abs floor ceil round`
- Keyboard shortcuts: `0-9 . + - * / ( ) % ^ ! e p` , `Enter`/`=` evaluate,
  `Backspace` delete, `Esc`/`C` clear, `s` = `sin(`, `q` = `sqrt(`
- Light / dark theme (persisted in localStorage)
- Responsive layout (stacks on narrow screens)

## Technology stack

| Layer      | Choice                                            |
|------------|---------------------------------------------------|
| Language   | HTML5 + CSS3 + Vanilla JavaScript (ES Modules)    |
| Styling    | CSS custom properties (theme switching)           |
| HTTP client| Native `fetch` with timeout + typed errors        |
| Build tool | None — runs in any modern browser                 |

## Project structure

```
832401126_calculator_frontend/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js      # API base URL configuration
│   ├── api.js         # fetch wrapper + API client
│   ├── calculator.js  # input logic, keypad & keyboard handling
│   ├── history.js     # history rendering, delete, clear, search
│   └── app.js         # bootstrap, theme, connectivity indicator
├── README.md
└── codestyle.md
```

## Runtime environment

- Any modern browser (Chrome, Edge, Firefox, Safari)
- No Node.js required to run; a simple static file server is enough

## Installation & startup

Because the front end and back end are **separated**, you must run the back
end first. Then serve this folder statically:

```bash
# 1. Start the back end (see its README):
cd ../832401126_calculator_backend && python app.py

# 2. Serve the front end:
cd ../832401126_calculator_frontend
python -m http.server 5500
```

Open <http://localhost:5500> in a browser.

## Configuration — connecting to the back end

Edit `js/config.js`:

```js
export const CONFIG = {
  apiBaseUrl: "http://localhost:5000",   // back-end API origin
};
```

For deployed static hosting you can also inject the address without editing
the file:

```html
<script>
  window.CALCULATOR_CONFIG = { apiBaseUrl: "https://your-backend.onrender.com" };
</script>
```

The back end must allow your front end origin via its `CORS_ORIGINS`
setting (default `*`).

## API used by this front end

| Call (in `js/api.js`)   | HTTP request                  | Used for                          |
|-------------------------|-------------------------------|-----------------------------------|
| `calculate(expr)`       | `POST /api/calculate`         | evaluate expression               |
| `fetchHistory({...})`   | `GET /api/history?q=&limit=&offset=` | history list/search/pagination |
| `deleteHistory(id)`     | `DELETE /api/history/{id}`    | delete one record                 |
| `clearHistory()`        | `DELETE /api/history`         | clear all history                 |
| `health()`              | `GET /api/health`             | connectivity indicator            |

## Keyboard shortcuts

| Keys                              | Action                        |
|-----------------------------------|-------------------------------|
| `0-9 . ( ) + - * / % ^ !`         | insert symbol                 |
| `e` / `p`                         | constants `e` / `pi`          |
| `s` / `q`                         | `sin(` / `sqrt(`              |
| `Enter` or `=`                    | calculate                     |
| `Backspace`                       | delete last character         |
| `Esc` or `C`                      | clear all                     |

## Deployment (static hosting, e.g. Vercel / Netlify)

- Push this repository to GitHub.
- **Vercel**: *New Project* → import the repo → Framework Preset: *Other* →
  Deploy. No build command needed.
- **Netlify**: *Add new site → Import an existing project* → build command
  empty, publish directory empty (or `/`) → Deploy.
- Then set `js/config.js` `apiBaseUrl` to your deployed back-end URL and
  redeploy (or use the `window.CALCULATOR_CONFIG` injection).

## Course info

Course assignment project by student **832401126**. See
[codestyle.md](codestyle.md) for the code standard this repository follows.
