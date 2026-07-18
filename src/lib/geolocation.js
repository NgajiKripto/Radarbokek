import {
  LOCATION_DELTA_M, LOCATION_THROTTLE_MS,
  BATTERY_SAVER_DELTA_M, BATTERY_SAVER_THROTTLE_MS, BATTERY_SAVER_MAX_AGE_MS,
} from '../config/constants.js';
import { haversineDistance } from './haversine.js';
import { enqueueLocation, drainQueue, isOnline } from './offline-queue.js';

/**
 * Geolocation wrapper with delta detection, throttling, and battery saver mode
 */
export class GeolocationTracker {
  constructor() {
    this.watchId = null;
    this.lastPosition = null;
    this.lastPingTime = 0;
    this.onUpdate = null;
    this.onError = null;
    this._batterySaver = false;
    this._options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    };
  }

  /**
   * Enable/disable battery saver mode
   * @param {boolean} enabled
   */
  setBatterySaver(enabled) {
    this._batterySaver = enabled;
    if (this.watchId !== null) {
      // Restart watcher with new options
      const onUpdate = this.onUpdate;
      const onError = this.onError;
      this.stop();
      this.start(onUpdate, onError);
    }
  }

  get batterySaver() {
    return this._batterySaver;
  }

  get deltaThreshold() {
    return this._batterySaver ? BATTERY_SAVER_DELTA_M : LOCATION_DELTA_M;
  }

  get throttleMs() {
    return this._batterySaver ? BATTERY_SAVER_THROTTLE_MS : LOCATION_THROTTLE_MS;
  }

  /**
   * Start watching position
   * @param {Function} onUpdate - Called with { lat, lon, speed } when delta > threshold
   * @param {Function} onError - Called on geolocation errors
   */
  start(onUpdate, onError) {
    this.onUpdate = onUpdate;
    this.onError = onError;

    if (!navigator.geolocation) {
      onError?.(new Error('Geolocation not supported'));
      return;
    }

    // Bug #9: drain offline queue when coming back online
    this._onlineHandler = async () => {
      try {
        const queued = await drainQueue();
        for (const item of queued) {
          onUpdate?.({ lat: item.lat, lon: item.lon, speed: item.speed || 0, fromQueue: true });
        }
      } catch (err) {
        console.error('Failed to drain offline queue:', err);
      }
    };
    window.addEventListener('online', this._onlineHandler);

    const options = this._batterySaver
      ? {
          enableHighAccuracy: false,
          maximumAge: BATTERY_SAVER_MAX_AGE_MS,
          timeout: 30000,
        }
      : {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => onError?.(error),
      options
    );
  }

  /**
   * Stop watching position
   */
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this._onlineHandler) {
      window.removeEventListener('online', this._onlineHandler);
      this._onlineHandler = null;
    }
    this.lastPosition = null;
  }

  /**
   * Get current position once
   * @returns {Promise<{lat: number, lon: number}>}
   */
  getCurrent() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  /**
   * Handle position update — filter by delta and throttle
   */
  handlePosition(position) {
    const { latitude, longitude, speed } = position.coords;
    const now = Date.now();

    // First position — always emit
    if (!this.lastPosition) {
      this.lastPosition = { lat: latitude, lon: longitude };
      this.lastPingTime = now;
      this.onUpdate?.({ lat: latitude, lon: longitude, speed: speed || 0 });
      return;
    }

    // Check distance delta
    const distance = haversineDistance(
      this.lastPosition.lat, this.lastPosition.lon,
      latitude, longitude
    );

    // Check throttle
    const elapsed = now - this.lastPingTime;

    if (distance >= this.deltaThreshold && elapsed >= this.throttleMs) {
      this.lastPosition = { lat: latitude, lon: longitude };
      this.lastPingTime = now;

      // Bug #9: queue location when offline, emit directly when online
      if (!isOnline()) {
        enqueueLocation({ lat: latitude, lon: longitude, speed: speed || 0 }).catch((err) => {
          console.error('Failed to enqueue location:', err);
        });
      } else {
        this.onUpdate?.({ lat: latitude, lon: longitude, speed: speed || 0 });
      }
    }
  }
}
