/**
 * Screen Wake Lock API wrapper
 * Keeps screen on during merchant tracking
 */
export class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
  }

  /**
   * Request screen wake lock
   * @returns {Promise<boolean>}
   */
  async request() {
    if (!this.isSupported) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
      return true;
    } catch (err) {
      console.error('Wake Lock request failed:', err.name, err.message);
      return false;
    }
  }

  /**
   * Release screen wake lock
   */
  async release() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  /**
   * Check if currently holding lock
   */
  get isActive() {
    return this.wakeLock !== null;
  }
}
