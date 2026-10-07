/**
 * Application bootstrap: wires the calculator, the history panel, the
 * theme switcher and the back-end connectivity indicator.
 */

import { health } from "./api.js";
import { Calculator } from "./calculator.js";
import { HistoryPanel } from "./history.js";

const THEME_KEY = "calculator-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.dataset.theme = saved;
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
}

function initStatusIndicator() {
  const status = document.getElementById("backend-status");
  const setStatus = (state, text) => {
    status.className = `status status--${state}`;
    status.querySelector(".status-text").textContent = text;
  };

  const check = () => {
    health()
      .then(() => setStatus("online", "back end online"))
      .catch(() => setStatus("offline", "back end offline"));
  };
  check();
  window.setInterval(check, 15000);
}

function init() {
  initTheme();
  initStatusIndicator();

  const calculator = new Calculator(
    {
      keypad: document.getElementById("keypad"),
      sciPanel: document.getElementById("sci-panel"),
      expressionLine: document.getElementById("expression-line"),
      resultLine: document.getElementById("result-line"),
      errorBanner: document.getElementById("error-banner"),
    },
    {
      onCalculated: () => history.load({ reset: true }),
      onError: () => {}, // errors are already shown in the banner
    }
  );

  const history = new HistoryPanel({
    list: document.getElementById("history-list"),
    count: document.getElementById("history-count"),
    empty: document.getElementById("history-empty"),
    loadMore: document.getElementById("load-more"),
    search: document.getElementById("history-search"),
    clearAll: document.getElementById("clear-history"),
  });

  // Expose for easy debugging in the browser console.
  window.calculator = calculator;
  window.historyPanel = history;
}

init();
