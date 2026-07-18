/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md
 * theme: custom (warm-terakota) · map page · designed-as-app
 */
import { GeolocationTracker } from '../lib/geolocation.js';
import { haversineDistance, formatDistance } from '../lib/haversine.js';
import { SSEClient } from '../lib/sse-client.js';
import { API_BASE } from '../config/constants.js';
import { createVendorMarkerIcon, getMarkerType } from '../components/vendor-marker.js';
import { renderVendorCard, hideVendorCard } from '../components/vendor-card.js';
import { initSearchBar } from '../components/search-bar.js';
import { initFilterCapsules } from '../components/filter-capsules.js';

let userLat = null;
let userLon = null;
let activeSearch = '';
let activeFilter = 'all';
let _fetchVendors = null;

export function renderMap() {
  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = 'none';

  app.innerHTML = `
    <div class="relative w-full h-full overflow-hidden" style="height:calc(100dvh - 144px)">
      <!-- Search + Filter Bar -->
      <div class="fixed top-0 w-full max-w-[480px] left-1/2 -translate-x-1/2 z-[1000] px-margin-mobile pt-sm space-y-2">
        <div class="relative">
          <input type="text" id="search-input"
            class="w-full h-11 pl-11 pr-4 bg-paper border border-rule rounded-pill font-mono text-label text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-ink-2 transition-colors"
            placeholder="Cari makanan keliling..." />
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2">
            <span class="material-symbols-outlined text-ink-2 text-xl">search</span>
          </div>
        </div>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1" id="filter-bar"></div>
      </div>

      <!-- Map container -->
      <div id="map" class="w-full h-full"></div>

      <!-- Locate me FAB -->
      <div class="fixed bottom-28 right-4 z-[900]">
        <button id="btn-locate" class="w-12 h-12 rounded-full bg-paper text-ink border border-rule shadow-md flex items-center justify-center hover:bg-paper-2 transition-colors">
          <span class="material-symbols-outlined text-[22px] text-accent" style="font-variation-settings: 'FILL' 1;">my_location</span>
        </button>
      </div>

      <!-- Bottom Sheet -->
      <div id="bottom-sheet" class="hidden fixed bottom-20 w-full max-w-[480px] left-1/2 -translate-x-1/2 px-margin-mobile z-[1000]">
        <div class="vendor-card" id="vendor-card"></div>
      </div>
    </div>
  `;

  const filterCapsules = initFilterCapsules('filter-bar', (filter) => {
    activeFilter = filter;
    if (userLat != null && userLon != null && _fetchVendors) {
      _fetchVendors(userLat, userLon);
    }
  });

  const searchBar = initSearchBar('search-input', (query) => {
    activeSearch = query;
    if (userLat != null && userLon != null && _fetchVendors) {
      _fetchVendors(userLat, userLon);
    }
  });

  loadLeaflet().then((L) => initMap(L));

  return {
    cleanup: () => {
      if (window._radarMap) {
        window._radarMap.remove();
        window._radarMap = null;
      }
      if (window._sseClient) {
        window._sseClient.disconnect();
      }
    },
  };
}

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

function initMap(L) {
  userLat = null;
  userLon = null;

  const map = L.map('map', { zoomControl: false, attributionControl: false });
  window._radarMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const markerGroup = L.layerGroup().addTo(map);
  let userMarker = null;
  let vendors = [];

  function renderVendors(vendorList) {
    markerGroup.clearLayers();
    vendors = vendorList;

    vendorList.forEach((v) => {
      const tierType = getMarkerType(v);
      const icon = createVendorMarkerIcon(tierType);
      if (!icon) return;
      const marker = L.marker([v.lat, v.lon], { icon });
      marker.on('click', () => {
        renderVendorCard(v, userLat, userLon);
      });
      marker.addTo(markerGroup);
    });
  }

  map.on('click', () => {
    hideVendorCard();
  });

  _fetchVendors = async function (lat, lon) {
    try {
      const params = new URLSearchParams({ lat, lon });
      if (activeSearch) params.set('search', activeSearch);
      if (activeFilter && activeFilter !== 'all' && activeFilter !== 'nearest') {
        params.set('filter', activeFilter);
      }

      const res = await fetch(`${API_BASE}/buyer/radar?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        let result = data.data;
        if (activeFilter === 'nearest') {
          result = [...result].sort((a, b) => {
            const da = haversineDistance(lat, lon, a.lat, a.lon);
            const db = haversineDistance(lat, lon, b.lat, b.lon);
            return da - db;
          });
        }
        renderVendors(result);
      }
    } catch (err) {
      console.error('Fetch vendors failed:', err);
    }
  };

  const sse = new SSEClient();
  window._sseClient = sse;

  const tracker = new GeolocationTracker();

  tracker.getCurrent().then(({ lat, lon }) => {
    userLat = lat;
    userLon = lon;
    map.setView([lat, lon], 15);

    userMarker = L.circleMarker([lat, lon], {
      radius: 7,
      fillColor: '#7aab9a',
      fillOpacity: 1,
      color: '#1c1917',
      weight: 2,
    }).addTo(map);

    _fetchVendors(lat, lon);

    fetch(`${API_BASE}/buyer/search-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon }),
    }).catch(() => {});

    sse.connect(lat, lon,
      (vendorData) => {
        if (Array.isArray(vendorData)) {
          renderVendors(vendorData);
        } else if (vendorData.merchant_id) {
          const idx = vendors.findIndex((v) => v.merchant_id === vendorData.merchant_id);
          if (idx >= 0) {
            vendors[idx] = { ...vendors[idx], ...vendorData };
          } else {
            vendors.push(vendorData);
          }
          renderVendors([...vendors]);
        }
      },
      (err) => {
        console.error('SSE error:', err);
      }
    );
  }).catch((err) => {
    console.error('Geolocation error:', err);
    map.setView([-6.2, 106.816], 14);
  });

  document.getElementById('btn-locate')?.addEventListener('click', () => {
    if (userLat && userLon) {
      map.setView([userLat, userLon], 16);
    }
  });
}
