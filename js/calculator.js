/**
 * Calculator input logic and keypad/keyboard interaction.
 *
 * The UI stores the expression with display symbols (× ÷ −) and converts
 * them to the ASCII form (* / -) only when the request is sent to the
 * back end.  All validation and computation happen on the back end; the
 * front end only performs lightweight input convenience (e.g. avoiding
 * two operators in a row) so users get fast feedback.
 */

import { calculate as apiCalculate, ApiError } from "./api.js";

// Display symbol -> API symbol, applied when building the request body.
const TO_API = { "×": "*", "÷": "/", "−": "-" };
// API/keyboard symbol -> display symbol, applied when inserting text.
const TO_DISPLAY = { "*": "×", "/": "÷", "-": "−" };

const OPERATORS = new Set(["+", "−", "×", "÷", "^", "%"]);

export class Calculator {
  constructor(elements, { onCalculated, onError }) {
    this.elements = elements;
    this.onCalculated = onCalculated;
    this.onError = onError;

    this.input = "";
    this.justEvaluated = false;
    this.busy = false;

    this._bindKeypad();
    this._bindKeyboard();
    this._render();
  }

  // ------------------------------------------------------------------
  // public API used by the rest of the app
  // ------------------------------------------------------------------

  clear() {
    this.input = "";
    this.justEvaluated = false;
    this.hideError();
    this._render();
  }

  /** Run the expression currently in the display through the back end. */
  async evaluate() {
    if (this.busy) return;
    const expression = this._toApi(this.input).trim();
    if (!expression) return;

    this.busy = true;
    this.hideError();
    this.elements.resultLine.textContent = "…";
    try {
      const body = await apiCalculate(expression);
      this.input = String(body.result);
      this.justEvaluated = true;
      this.elements.expressionLine.textContent =
        `${body.expression} =`;
      this.elements.resultLine.textContent = body.result;
      this.onCalculated(body);
    } catch (err) {
      this._showError(err);
      this.elements.resultLine.textContent =
        this.input ? "" : "0";
    } finally {
      this.busy = false;
    }
  }

  hideError() {
    this.elements.errorBanner.classList.add("hidden");
    this.elements.errorBanner.textContent = "";
  }

  // ------------------------------------------------------------------
  // input helpers
  // ------------------------------------------------------------------

  _insert(text) {
    if (this.justEvaluated && !OPERATORS.has(text) && text !== ")" && text !== "!") {
      this.input = ""; // start a fresh expression after a result
    }
    this.justEvaluated = false;
    this.hideError();

    const last = this.input.slice(-1);

    if (OPERATORS.has(text)) {
      // Replace a trailing operator instead of stacking two in a row.
      if (OPERATORS.has(last)) {
        this.input = this.input.slice(0, -1) + text;
        this._render();
        return;
      }
      // A leading minus (or plus) is a unary sign, not a dangling operator.
      if (!this.input && text !== "−" && text !== "+") return;
    }

    if (text === ".") {
      const segment = this.input.split(/[+\-×÷^%()]/).pop() || "";
      if (segment.includes(".")) return; // one dot per number
      if (!segment) text = "0.";
    }

    if (text === ")") {
      const open = (this.input.match(/\(/g) || []).length;
      const close = (this.input.match(/\)/g) || []).length;
      if (close >= open) return; // no matching parenthesis
    }

    this.input += text;
    this._render();
  }

  _backspace() {
    if (this.justEvaluated) return;
    this.input = this.input.slice(0, -1);
    this.hideError();
    this._render();
  }

  _negate() {
    if (this.justEvaluated) {
      this.input = this.input.startsWith("-") ? this.input.slice(1) : "-" + this.input;
      this.justEvaluated = false;
      this._render();
      return;
    }
    // Insert a unary minus at the current number boundary is complex;
    // instead wrap the whole current expression: -(expr)
    this.input = `-(${this.input || "0"})`;
    this._render();
  }

  // ------------------------------------------------------------------
  // rendering
  // ------------------------------------------------------------------

  _toApi(text) {
    return text.replace(/[×÷−]/g, (ch) => TO_API[ch]);
  }

  _toDisplay(text) {
    return text.replace(/[*\/-]/g, (ch) => TO_DISPLAY[ch]);
  }

  _render() {
    this.elements.expressionLine.textContent = this.input || "\u00a0";
    if (!this.justEvaluated) {
      this.elements.resultLine.textContent = this.input ? "" : "0";
    }
  }

  _showError(err) {
    const message = err instanceof ApiError ? err.message : "Unknown error";
    this.elements.errorBanner.textContent = message;
    this.elements.errorBanner.classList.remove("hidden");
    if (this.onError) this.onError(err);
  }

  // ------------------------------------------------------------------
  // event wiring
  // ------------------------------------------------------------------

  _bindKeypad() {
    const keypad = this.elements.keypad;
    keypad.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      if (button.dataset.insert !== undefined) {
        this._insert(this._toDisplay(button.dataset.insert));
      } else if (button.dataset.action) {
        this[`_action_${button.dataset.action}`]();
      }
    });

    // Scientific panel shares the same data-insert mechanism.
    const sciPanel = this.elements.sciPanel;
    sciPanel.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.dataset.insert === undefined) return;
      this._insert(button.dataset.insert);
    });
  }

  _bindKeyboard() {
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Ignore keystrokes aimed at form fields (e.g. the history search).
      if (event.target instanceof Element &&
          event.target.matches("input, textarea, select")) return;

      const key = event.key;
      if (/^[0-9]$/.test(key) || key === ".") {
        event.preventDefault();
        this._insert(key);
      } else if (key === "+" || key === "*" || key === "/" || key === "-") {
        event.preventDefault();
        this._insert(this._toDisplay(key));
      } else if (key === "(" || key === ")" || key === "%" || key === "^" || key === "!") {
        event.preventDefault();
        this._insert(key);
      } else if (key === "e" || key === "E") {
        event.preventDefault();
        this._insert("e");
      } else if (key === "p" || key === "P") {
        event.preventDefault();
        this._insert("pi");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        this.evaluate();
      } else if (key === "Backspace") {
        event.preventDefault();
        this._backspace();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        event.preventDefault();
        this.clear();
      } else if (key.toLowerCase() === "s") {
        event.preventDefault();
        this._insert("sin(");
      } else if (key.toLowerCase() === "q") {
        event.preventDefault();
        this._insert("sqrt(");
      }
    });
  }

  // ------------------------------------------------------------------
  // button actions (data-action)
  // ------------------------------------------------------------------

  _action_clear() {
    this.clear();
  }

  _action_backspace() {
    this._backspace();
  }

  _action_evaluate() {
    this.evaluate();
  }

  _action_negate() {
    this._negate();
  }

  _action_toggle_sci() {
    this.elements.sciPanel.classList.toggle("hidden");
  }
}
