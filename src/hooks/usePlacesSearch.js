import { useState, useCallback } from 'react';
import { calculateDistance } from '../utils/distance';

const usePlacesSearch = () => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (userCoords, budget) => {
    setSearchError('');
    if (!userCoords) return;
    setIsSearching(true); setIsLoadingData(true);

    const query = `[out:json][timeout:25];(node["amenity"~"restaurant|fast_food|cafe|food_court"](around:5000,${userCoords.lat},${userCoords.lng});way["amenity"~"restaurant|fast_food|cafe|food_court"](around:5000,${userCoords.lat},${userCoords.lng}););out center;`;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      const data = await res.json();

      const processed = data.elements.map((el) => {
        const name = el.tags?.name || 'Warung Rakyat';
        const lowerName = name.toLowerCase();
        
        let estPrice = 18000; 
        let isWarung = false;

        const warungKeywords = ['warung', 'nasi', 'soto', 'bakso', 'mie', 'pecel', 'penyetan', 'ayam', 'tegal', 'bahari', 'kantin', 'bebek', 'warkop', 'kopi'];
        const cafeKeywords = ['cafe', 'coffee', 'bistro', 'lounge', 'resto', 'restaurant'];

        if (warungKeywords.some(key => lowerName.includes(key))) {
          estPrice = 12000;
          isWarung = true;
        } else if (cafeKeywords.some(key => lowerName.includes(key))) {
          estPrice = 28000; 
        }

        const distance = calculateDistance(userCoords.lat, userCoords.lng, el.lat || el.center?.lat, el.lon || el.center?.lon);

        return {
          id: el.id, name,
          lat: el.lat || el.center?.lat, lng: el.lon || el.center?.lon,
          distanceNum: parseFloat(distance), distance: `${distance} km`,
          priceNum: estPrice, isWarung,
          priceRange: `Rp ${(estPrice/1000).toFixed(0)}k-an`,
          category: isWarung ? 'Makanan Berat' : 'Tempat Nongkrong',
          views: Math.floor(Math.random() * 500) + 12
        };
      });

      const final = processed
        .filter(w => w.priceNum <= parseInt(budget))
        .sort((a, b) => {
          if (a.isWarung && !b.isWarung) return -1;
          if (!a.isWarung && b.isWarung) return 1;
          return a.distanceNum - b.distanceNum;
        })
        .slice(0, 20);

      setFilteredResults(final);
    } catch { setSearchError('Satelit OSM sibuk, coba klik lagi!'); }
    finally { setIsLoadingData(false); }
  }, []);

  return { filteredResults, isSearching, isLoadingData, searchError, search };
};

export default usePlacesSearch;
