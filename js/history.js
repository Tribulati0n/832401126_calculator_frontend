/**
 * Calculation-history panel.
 *
 * History always comes from the back-end database via GET /api/history;
 * the browser never stores it (no localStorage cache).  Deleting and
 * clearing also go through the API, after which the list is re-fetched
 * so the display always mirrors the database state.
 */

import { fetchHistory, deleteHistory, clearHistory } from "./api.js";

const PAGE_SIZE = 10;

export class HistoryPanel {
  constructor(elements) {
    this.elements = elements;
    this.items = [];
    this.total = 0;
    this.offset = 0;
    this.query = "";

    this._bindEvents();
    this.load({ reset: true });
  }

  /** Fetch the newest page (or a fresh page after reset). */
  async load({ reset = false } = {}) {
    if (reset) {
      this.offset = 0;
      this.items = [];
    }
    const body = await fetchHistory({
      limit: PAGE_SIZE,
      offset: this.offset,
      q: this.query,
    });
    this.total = body.total;
    if (reset) {
      this.items = body.data;
    } else {
      this.items = this.items.concat(body.data);
    }
    this.offset += body.data.length;
    this._render();
  }

  _render() {
    const list = this.elements.list;
    list.textContent = "";

    this.elements.count.textContent = String(this.total);
    this.elements.empty.classList.toggle("hidden", this.items.length > 0);
    this.elements.loadMore.classList.toggle(
      "hidden", this.offset >= this.total);

    for (const item of this.items) {
      list.appendChild(this._buildItem(item));
    }
  }

  _buildItem(item) {
    const li = document.createElement("li");
    li.className = "history-item";
    li.dataset.id = String(item.id);

    const body = document.createElement("div");
    const expr = document.createElement("div");
    expr.className = "history-expr";
    expr.textContent = `${item.expression} =`;
    const result = document.createElement("div");
    result.className = "history-result";
    result.textContent = item.result;
    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = item.created_at;
    body.append(expr, result, meta);

    const del = document.createElement("button");
    del.className = "history-del";
    del.title = "Delete this record";
    del.textContent = "✕";
    del.addEventListener("click", () => this._deleteItem(item.id));

    li.append(body, del);
    return li;
  }

  async _deleteItem(id) {
    await deleteHistory(id);
    await this.load({ reset: true });
  }

  async _clearAll() {
    if (!window.confirm("Delete all calculation history?")) return;
    await clearHistory();
    this.query = "";
    this.elements.search.value = "";
    await this.load({ reset: true });
  }

  _bindEvents() {
    this.elements.clearAll.addEventListener("click", () => this._clearAll());

    this.elements.loadMore.addEventListener("click", () => this.load());

    // Debounced search: the query runs on the back end (?q=...).
    let timer = null;
    this.elements.search.addEventListener("input", (event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.query = event.target.value.trim();
        this.load({ reset: true });
      }, 300);
    });
  }
}
