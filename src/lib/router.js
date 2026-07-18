/**
 * Simple hash-based SPA router
 */
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentCleanup = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  /**
   * Register a route handler
   * @param {string} path - Route path (e.g. '/map')
   * @param {Function} handler - Async function returning { render, cleanup }
   */
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Navigate to a route
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Resolve current hash to a route
   */
  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];

    // Cleanup previous page
    if (this.currentCleanup) {
      this.currentCleanup();
      this.currentCleanup = null;
    }

    // Find matching route
    const handler = this.routes.get(path);
    if (handler) {
      this.currentRoute = path;
      const result = handler();
      if (result && typeof result.cleanup === 'function') {
        this.currentCleanup = result.cleanup;
      }
    } else {
      // Fallback to landing
      const fallback = this.routes.get('/');
      if (fallback) {
        this.currentRoute = '/';
        fallback();
      }
    }

    this.updateNavActive(path);
  }

  /**
   * Update bottom nav active state
   */
  updateNavActive(path) {
    document.querySelectorAll('.bottom-nav__item').forEach((item) => {
      const route = item.dataset.route;
      if (route === path) {
        item.classList.add('bottom-nav__item--active');
      } else {
        item.classList.remove('bottom-nav__item--active');
      }
    });
  }

  /**
   * Start the router
   */
  start() {
    this.resolve();
  }
}
