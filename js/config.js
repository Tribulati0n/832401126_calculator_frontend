/**
 * Front-end configuration.
 *
 * The front end and the back end are deployed separately, so the API base
 * URL must point at the running back end.  Change API_BASE_URL for your
 * environment (local, Render, Railway, ...).
 *
 * A global override is also supported for deployments that want to inject
 * the address without editing this file:
 *
 *   <script>window.CALCULATOR_CONFIG = { apiBaseUrl: "https://..." };</script>
 */

const DEFAULT_API_BASE_URL = "http://localhost:5000";

export const CONFIG = {
  apiBaseUrl: (window.CALCULATOR_CONFIG && window.CALCULATOR_CONFIG.apiBaseUrl) ||
    DEFAULT_API_BASE_URL,
};
