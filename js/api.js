/**
 * API client for the calculator back end.
 *
 * All network communication goes through the HTTP API described in the
 * README.  The front end never computes a result itself — it sends the
 * raw expression and displays whatever the back end returns.
 */

import { CONFIG } from "./config.js";

const REQUEST_TIMEOUT_MS = 8000;

/** Error raised for any non-2xx API response or network failure. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${CONFIG.apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(
      "Cannot reach the back end. Please check that the server is running.",
      null
    );
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null; // non-JSON response
  }

  if (!response.ok || (body && body.success === false)) {
    const message = (body && body.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return body;
}

/** Evaluate an expression on the back end. */
export async function calculate(expression) {
  return request("/api/calculate", {
    method: "POST",
    body: JSON.stringify({ expression }),
  });
}

/** Fetch history with optional search (q) and pagination (limit/offset). */
export async function fetchHistory({ limit = 10, offset = 0, q = "" } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (q) params.set("q", q);
  return request(`/api/history?${params.toString()}`);
}

/** Delete one history record by id. */
export async function deleteHistory(id) {
  return request(`/api/history/${id}`, { method: "DELETE" });
}

/** Delete every history record. */
export async function clearHistory() {
  return request("/api/history", { method: "DELETE" });
}

/** Liveness check used for the connectivity indicator. */
export async function health() {
  return request("/api/health");
}
