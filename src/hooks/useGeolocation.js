import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [locationName, setLocationName] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoError('GPS tidak aktif di browser!'); return; }
    setIsLocating(true); setGeoError('');
    
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const { latitude, longitude } = p.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`, { headers: { 'User-Agent': 'RadarBokekApp/1.0' } });
          const d = await res.json();
          setLocationName(d.address?.village || d.address?.suburb || d.address?.town || d.address?.city || 'Area Sekitar');
        } catch { setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`); }
        setIsLocating(false);
      },
      () => { setGeoError('Gagal melacak posisi.'); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { locationName, userCoords, isLocating, geoError, getLocation };
};

export default useGeolocation;
