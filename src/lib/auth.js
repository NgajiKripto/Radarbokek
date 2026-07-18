import { API_BASE } from '../config/constants.js';

const TOKEN_KEY = 'rb_token';
const ROLE_KEY = 'rb_role';

/**
 * Get stored JWT token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user role
 */
export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

/**
 * Store auth data
 */
export function setAuth(token, role) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  // Emit custom event for same-tab listeners (storage event only fires cross-tab)
  window.dispatchEvent(new CustomEvent('authchange', { detail: { token, role } }));
}

/**
 * Clear auth data
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new CustomEvent('authchange', { detail: { token: null, role: null } }));
}

/**
 * Check if user is authenticated (token exists and not expired)
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  // Check expiry (panduan §17: validasi exp claim)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      clearAuth();
      return false;
    }
  } catch {
    // Token malformed — clear it
    clearAuth();
    return false;
  }
  return true;
}

/**
 * Make authenticated API request
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData (browser auto-sets with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${API_BASE}${url}`, { ...options, headers });
}

/**
 * Register new user
 */
export async function register(email, password, role) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  return res.json();
}

/**
 * Login
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    setAuth(data.token, data.role);
  }
  return data;
}

/**
 * Logout — bersihkan auth + semua state lokal + navigasi ke landing
 */
export function logout() {
  clearAuth();
  // Hapus state dashboard biar login berikutnya dapat kuota utuh
  try {
    localStorage.removeItem('rb_quota');
    localStorage.removeItem('rb_battery_saver');
  } catch {}
  window.location.hash = '/';
}
