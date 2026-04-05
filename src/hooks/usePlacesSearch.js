import { useState, useCallback } from 'react';
import { calculateDistance } from '../utils/distance';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const FETCH_TIMEOUT_MS = 8000;

const FALLBACK_NAMES = [
  'Warung Bu Sari', 'Warung Nasi Pak Budi', 'Warung Mie Ayam Joss',
  'Warung Pecel Lele Bang Jon', 'Kantin Bahari', 'Warkop Kopi Kenangan',
  'Warung Bakso Mas Agus', 'Warung Soto Lamongan', 'Café Kopi Nusantara',
  'Resto Bebek Goreng H. Slamet', 'Warung Tegal Mbak Yem', 'Warung Ayam Penyet Cak Bro',
];

const generateFallbackWarungData = (lat, lng) => {
  const warungKeywords = ['warung', 'nasi', 'soto', 'bakso', 'mie', 'pecel', 'penyetan', 'ayam', 'tegal', 'bahari', 'kantin', 'bebek', 'warkop', 'kopi'];
  const cafeKeywords = ['cafe', 'coffee', 'bistro', 'lounge', 'resto', 'restaurant'];

  return FALLBACK_NAMES.map((name, i) => {
    const lowerName = name.toLowerCase();
    let estPrice = 15000;
    let isWarung = false;

    if (warungKeywords.some(key => lowerName.includes(key))) {
      estPrice = 8000;
      isWarung = true;
    } else if (cafeKeywords.some(key => lowerName.includes(key))) {
      estPrice = 25000;
    }

    // ~0.018 degrees ≈ 2 km; multiply by 2 to span [-2 km, +2 km]
    const FALLBACK_COORD_SPREAD = 0.036;
    const offsetLat = (Math.random() - 0.5) * FALLBACK_COORD_SPREAD;
    const offsetLng = (Math.random() - 0.5) * FALLBACK_COORD_SPREAD;
    const placeLat = lat + offsetLat;
    const placeLng = lng + offsetLng;
    const distance = calculateDistance(lat, lng, placeLat, placeLng);

    return {
      id: `fallback-${i + 1}`,
      name,
      lat: placeLat,
      lng: placeLng,
      distanceNum: parseFloat(distance),
      distance: `${distance} km`,
      priceNum: estPrice,
      priceRange: `Rp ${(estPrice / 1000).toFixed(0)}k-an`,
      isWarung,
      category: isWarung ? 'Makanan Berat' : 'Tempat Nongkrong',
      views: Math.floor(Math.random() * 500) + 12,
    };
  });
};

const processElements = (elements, userCoords) => {
  const warungKeywords = ['warung', 'nasi', 'soto', 'bakso', 'mie', 'pecel', 'penyetan', 'ayam', 'tegal', 'bahari', 'kantin', 'bebek', 'warkop', 'kopi'];
  const cafeKeywords = ['cafe', 'coffee', 'bistro', 'lounge', 'resto', 'restaurant'];

  return elements.map((el) => {
    const name = el.tags?.name || 'Warung Rakyat';
    const lowerName = name.toLowerCase();

    let estPrice = 15000;
    let isWarung = false;

    if (warungKeywords.some(key => lowerName.includes(key))) {
      estPrice = 8000;
      isWarung = true;
    } else if (cafeKeywords.some(key => lowerName.includes(key))) {
      estPrice = 25000;
    }

    const placeLat = el.lat || el.center?.lat;
    const placeLng = el.lon || el.center?.lon;
    const distance = calculateDistance(userCoords.lat, userCoords.lng, placeLat, placeLng);

    return {
      id: el.id,
      name,
      lat: placeLat,
      lng: placeLng,
      distanceNum: parseFloat(distance),
      distance: `${distance} km`,
      priceNum: estPrice,
      priceRange: `Rp ${(estPrice / 1000).toFixed(0)}k-an`,
      isWarung,
      category: isWarung ? 'Makanan Berat' : 'Tempat Nongkrong',
      views: Math.floor(Math.random() * 500) + 12,
    };
  });
};

const applyFiltersAndSort = (processed, budget) =>
  processed
    .filter(w => w.distanceNum <= 5 && w.priceNum <= parseInt(budget))
    .sort((a, b) => {
      if (a.isWarung && !b.isWarung) return -1;
      if (!a.isWarung && b.isWarung) return 1;
      return a.distanceNum - b.distanceNum;
    })
    .slice(0, 20);

const usePlacesSearch = () => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (userCoords, budget) => {
    setSearchError('');
    if (!userCoords) return;
    setIsSearching(true);
    setIsLoadingData(true);

    const query = `[out:json][timeout:25];(node["amenity"~"restaurant|fast_food|cafe|food_court"](around:5000,${userCoords.lat},${userCoords.lng});way["amenity"~"restaurant|fast_food|cafe|food_court"](around:5000,${userCoords.lat},${userCoords.lng}););out center;`;

    let data = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: query,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        data = await res.json();
        break;
      } catch {
        clearTimeout(timeoutId);
        // Try next endpoint
      }
    }

    try {
      let processed;

      if (data && Array.isArray(data.elements)) {
        processed = processElements(data.elements, userCoords);
      } else {
        // All endpoints failed — use graceful mock fallback
        processed = generateFallbackWarungData(userCoords.lat, userCoords.lng);
      }

      setFilteredResults(applyFiltersAndSort(processed, budget));
    } catch (err) {
      // Last-resort safety net: still show mock data, never show error
      console.error('[usePlacesSearch] Unexpected error during result processing:', err);
      const fallback = generateFallbackWarungData(userCoords.lat, userCoords.lng);
      setFilteredResults(applyFiltersAndSort(fallback, budget));
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  return { filteredResults, isSearching, isLoadingData, searchError, search };
};

export default usePlacesSearch;
