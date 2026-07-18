import { API_BASE } from '../config/constants.js';

/**
 * SSE client for receiving real-time vendor updates
 */
export class SSEClient {
  constructor() {
    this.eventSource = null;
    this.onVendorUpdate = null;
    this.onError = null;
  }

  /**
   * Connect to SSE stream
   * @param {number} lat - Buyer latitude
   * @param {number} lon - Buyer longitude
   * @param {Function} onVendorUpdate - Called with vendor data array
   * @param {Function} onError - Called on connection error
   */
  connect(lat, lon, onVendorUpdate, onError) {
    this.disconnect();
    this.onVendorUpdate = onVendorUpdate;
    this.onError = onError;

    const url = `${API_BASE}/events/radar?lat=${lat}&lon=${lon}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('vendor-update', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onVendorUpdate?.(data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    this.eventSource.addEventListener('vendor-list', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onVendorUpdate?.(data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    this.eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      this.onError?.(err);
    };
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
