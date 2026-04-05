import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { MapPin, Search, Loader2, Star, AlertTriangle, Zap, HelpCircle, Megaphone, CheckSquare, Eye, Menu, X, ArrowUp } from 'lucide-react';

// ========================================================
// 🧮 RUMUS HAVERSINE (Jarak tanpa Google Maps API)
// ========================================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

// ========================================================
// 🛠️ HOOKS: LOKASI & PENCARIAN (OSM GRATIS + SMART FILTER)
// ========================================================
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

const useScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return { scrollY, scrollProgress };
};

const initialFormState = { namaTempat: '', menuTermurah: '', hargaTermurah: '', jamBuka: '', linkMaps: '', isSubmitting: false, success: false };
const formReducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_FIELD': return { ...state, [action.field]: action.value };
    case 'SUBMIT_START': return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS': return { ...initialFormState, success: true };
    case 'RESET_SUCCESS': return { ...state, success: false };
    default: return state;
  }
};

const RadarBokekLogo = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="48" strokeDasharray="10 10" className="opacity-20" /><circle cx="50" cy="50" r="32" strokeDasharray="8 8" className="opacity-50" /><circle cx="50" cy="50" r="18" />
    <g transform="translate(32 39) rotate(-6 18 11)"><rect x="0" y="0" width="36" height="22" rx="1" fill="currentColor" stroke="none"/><rect x="0" y="0" width="36" height="22" rx="1" stroke="currentColor" fill="none" strokeWidth="4"/></g>
  </svg>
);

// ========================================================
// KOMPONEN UTAMA (FULL CONTENT RESTORED)
// ========================================================
export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [budget, setBudget] = useState('');
  
  const { locationName, userCoords, isLocating, geoError, getLocation } = useGeolocation();
  const { filteredResults, isSearching, isLoadingData, searchError, search } = usePlacesSearch();
  const { scrollY, scrollProgress } = useScroll(); 
  
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [selectedResto, setSelectedResto] = useState(null);

  const [undangForm, setUndangForm] = useState({ nama: '', menu: '', harga: '', link: '' });
  const [isUndangSubmitting, setIsUndangSubmitting] = useState(false);
  const [undangSuccess, setUndangSuccess] = useState(false);
  const totalBiayaUndang = parseInt(undangForm.harga) ? parseInt(undangForm.harga) + 7500 : 0;

  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [showStickyAd, setShowStickyAd] = useState(true);

  useEffect(() => {
    let t; if (showAdModal && adCountdown > 0) t = setTimeout(() => setAdCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showAdModal, adCountdown]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!userCoords) { alert("Pencet tombol GPS dulu bos!"); return; }
    if (parseInt(budget) < 5000) { alert("Minimal Rp 5.000 bos!"); return; }
    setShowAdModal(true); setAdCountdown(5);
    search(userCoords, budget);
  };

  const handleUndangSubmit = (e) => {
    e.preventDefault();
    setIsUndangSubmitting(true);
    setTimeout(() => { setIsUndangSubmitting(false); setUndangSuccess(true); setUndangForm({ nama: '', menu: '', harga: '', link: '' }); setTimeout(() => setUndangSuccess(false), 5000); }, 1500);
  };

  const handleNav = (id) => {
    setIsMobileMenuOpen(false);
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-mono text-black selection:bg-red-400 flex flex-col relative overflow-x-hidden text-sm pb-20">
      
      {/* SCROLL DOTS (KANAN) */}
      <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`rounded-full border-2 border-black transition-all duration-300 ${i === Math.min(4, Math.floor(scrollProgress / 20)) ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 scale-125 shadow-[2px_2px_0px_#000]' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white opacity-50'}`} />
        ))}
      </div>

      {/* ADSTERRA POP-UP 5 DETIK */}
      {showAdModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-black p-3 w-full max-w-[300px] text-center shadow-[4px_4px_0px_#4DEEEA] rounded-xl animate-in zoom-in-95">
            <p className="text-[9px] font-black text-gray-500 mb-2 uppercase tracking-widest border-b border-dashed border-gray-300 pb-1">Scanning satelit OSM... cek iklan 👇</p>
            <div className="w-full h-[250px] bg-gray-100 border-2 border-black flex items-center justify-center mb-3 rounded-lg"><span className="text-gray-400 font-black text-[9px] uppercase opacity-50 px-2">[ IKLAN ADSTERRA 300x250 ]</span></div>
            <button onClick={() => setShowAdModal(false)} disabled={adCountdown > 0} className={`w-full font-black py-2 text-xs border-2 border-black rounded-lg uppercase transition-all tracking-tight ${adCountdown > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'}`}>
              {adCountdown > 0 ? `LEWATI DALAM ${adCountdown} DETIK...` : 'LIHAT HASIL SCAN'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL WARUNG */}
      {selectedResto && !showAdModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-3 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFDF5] border-2 border-black p-4 shadow-[4px_4px_0px_#4DEEEA] w-full max-w-[280px] rounded-xl relative animate-in zoom-in-95">
            <button onClick={() => setSelectedResto(null)} className="absolute -top-3 -right-3 bg-red-500 text-white border-2 border-black w-6 h-6 flex items-center justify-center font-black text-sm rounded-full shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all">X</button>
            <h2 className="text-lg font-black uppercase leading-tight border-b border-black border-dashed pb-1.5 mb-3">{selectedResto.name}</h2>
            <div className="bg-yellow-300 border-2 border-black p-2 text-center shadow-[2px_2px_0px_#000] rotate-[-1deg] mb-4 rounded-lg">
              <p className="text-[9px] font-black uppercase mb-0.5 flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> STATISTIK RADAR</p>
              <p className="text-2xl font-black tracking-tighter mb-0.5">{selectedResto.views} <span className="text-[10px] font-bold tracking-normal">MATA</span></p>
              <p className="text-[8px] font-bold bg-black text-white inline-block px-1.5 py-0.5 border border-black rounded-full">Warga kepo warung ini! 🔥</p>
            </div>
            <div className="space-y-1 mb-4 bg-white p-2 border-2 border-black text-[10px] font-bold uppercase rounded-lg">
              <p className="flex justify-between border-b border-dashed border-gray-300 pb-0.5"><span className="text-gray-500">KATEGORI:</span> <span className="text-right">{selectedResto.category}</span></p>
              <p className="flex justify-between border-b border-dashed border-gray-300 pb-0.5"><span className="text-gray-500">EST. HARGA:</span> <span className="text-red-600 text-right">{selectedResto.priceRange}</span></p>
              <p className="flex justify-between"><span className="text-gray-500">JARAK:</span> <span>{selectedResto.distance}</span></p>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=$${selectedResto.lat},${selectedResto.lng}`} target="_blank" rel="noreferrer" className="block w-full bg-blue-400 text-white text-center hover:bg-blue-500 font-black py-2 text-xs border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase">
              BUKA DI MAPS 📍
            </a>
          </div>
        </div>
      )}

      {/* NAVBAR STICKY */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 border-b-2 border-black ${scrollY > 20 ? 'bg-[#FFFDF5] shadow-[0_4px_0px_rgba(0,0,0,1)] py-1' : 'bg-[#FFFDF5] py-1.5'}`}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => handleNav('home')}>
              <div className="bg-red-500 text-white p-1 border-2 border-black rotate-[-5deg] group-hover:rotate-0 transition-transform rounded-full"><RadarBokekLogo /></div>
              <span className="font-black text-sm tracking-tighter hidden sm:block group-hover:tracking-normal transition-all">RADAR<span className="text-red-500">BOKEK</span></span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden sm:flex gap-1.5 pr-8"> 
              <button onClick={() => handleNav('scanner')} className="text-[10px] font-bold px-2.5 py-1 border-2 border-black bg-white rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">SCANNER</button>
              <button onClick={() => handleNav('about')} className="text-[10px] font-bold px-2.5 py-1 border-2 border-black bg-white rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">TENTANG</button>
              <button onClick={() => handleNav('lapor')} className="text-[10px] font-bold px-2.5 py-1 border-2 border-black bg-white rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">LAPOR</button>
              <button onClick={() => handleNav('undang')} className="text-[10px] font-bold px-2.5 py-1 border-2 border-black bg-lime-400 rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all">UNDANG 🕵️‍♂️</button>
            </div>
            {/* Mobile Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="sm:hidden bg-yellow-300 p-1 border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all mr-6">
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={`absolute top-0 right-0 h-full w-[220px] bg-[#FFFDF5] border-l-2 border-black shadow-[-4px_0_0_#000] pt-16 px-4 transition-transform duration-300 ease-out rounded-l-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleNav('scanner')} className="text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all bg-white">🔍 SCANNER</button>
            <button onClick={() => handleNav('about')} className="text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all bg-white">📖 TENTANG</button>
            <button onClick={() => handleNav('lapor')} className="text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all bg-white">📣 LAPOR WARUNG</button>
            <button onClick={() => handleNav('undang')} className="text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all bg-lime-400">🕵️‍♂️ UNDANG ADMIN</button>
            <button onClick={() => handleNav('faq')} className="text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all bg-white">❓ FAQ</button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <main className="flex-grow flex flex-col">
        <section id="home" className="w-full pt-10 pb-6">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center group cursor-default">
            <h1 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mb-1.5 transition-transform duration-300 group-hover:scale-[1.02]">
              RADAR BOKEK<br/>
              <span className="text-red-500 bg-yellow-300 px-2 py-0.5 border-2 border-black md:rotate-1 inline-block mt-2 shadow-[2px_2px_0px_#000] text-sm md:text-xl group-hover:rotate-0 transition-all rounded-lg">
                Selamatkan isi Dompet
              </span>
            </h1>
            <p className="text-[10px] md:text-sm font-bold text-gray-700 mt-3 max-w-[260px] md:max-w-md mx-auto">Nggak usah ribet mikir. Lacak GPS lo, masukin sisa duit di dompet, kita kasih list warung terdekat secara gratis.</p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. SCANNER SECTION */}
        {/* ======================================================== */}
        <section id="scanner" className="w-full pb-12 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="max-w-md mx-auto bg-[#FF90E8] p-3 md:p-4 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all relative">
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                {geoError || searchError ? (<div className="bg-red-500 text-white p-2 border-2 border-black rounded-lg text-[9px] font-bold flex items-center gap-1.5 animate-[shake_0.5s_ease-in-out]"><AlertTriangle className="w-3 h-3 shrink-0" /><span>{geoError || searchError}</span></div>) : null}
                
                <div className="bg-white p-3 border-2 border-black text-center rounded-xl">
                  <label className="block text-[10px] md:text-xs font-black uppercase mb-2 border-b border-dashed border-black pb-1.5">1. Lacak Titik Lo</label>
                  <button type="button" onClick={getLocation} disabled={isLocating} className={`w-full py-1.5 text-xs border-2 border-black font-black uppercase flex items-center justify-center gap-1.5 transition-all rounded-lg ${userCoords ? 'bg-green-400 shadow-[2px_2px_0px_#000]' : 'bg-yellow-300 hover:bg-yellow-400 shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none'}`}>
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {isLocating ? 'Satelit...' : userCoords ? '📍 AMAN!' : 'AKTIFKAN GPS'}
                  </button>
                  {locationName && <p className="text-[8px] md:text-[9px] font-bold mt-1.5 bg-gray-100 p-1 border border-black inline-block rounded-md animate-in fade-in">Terdeteksi: {locationName}</p>}
                </div>

                <div className="bg-white p-3 border-2 border-black text-center rounded-xl">
                  <label className="block text-[10px] md:text-xs font-black uppercase mb-2 border-b border-dashed border-black pb-1.5">2. Sisa Duit Lo (Rp)</label>
                  <div className="relative max-w-[140px] mx-auto group">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-black text-xs group-focus-within:text-red-500 transition-colors">Rp</span>
                    <input type="number" required min="5000" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Min 5000" className="w-full border-2 border-black py-1.5 pl-8 text-sm md:text-base font-black text-center rounded-lg focus:bg-yellow-100 focus:shadow-[2px_2px_0px_#000] focus:-translate-y-0.5 transition-all outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={isLoadingData} className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-sm md:text-base py-2 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-1.5 transition-all uppercase">
                  {isLoadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {isLoadingData ? 'SCANNING...' : 'GAS CARI!'}
                </button>
              </form>
            </div>

            {/* HASIL PENCARIAN GRID */}
            {isSearching && !isLoadingData && !(geoError || searchError) && (
              <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-10 duration-500">
                {filteredResults.length === 0 ? (
                  <div className="max-w-md mx-auto bg-white p-4 border-2 border-black text-center border-dashed rounded-xl">
                    <div className="text-2xl mb-1 animate-bounce">☠️</div><h3 className="font-black text-sm uppercase">Zonk Bosku!</h3>
                    <p className="text-[9px] font-bold text-gray-800 mt-1.5">Duit Rp {budget} kurang gede atau satelit OSM ga nemu warung murah di sekitar lo.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-5"><h2 className="text-sm md:text-base font-black uppercase border-b-2 border-black border-dashed pb-1 inline-block">--- HASIL SCAN OSM ---</h2></div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredResults.map((resto, index) => (
                        <li key={resto.id} onClick={() => handleRestoClick(resto)} className="bg-white p-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none transition-all cursor-pointer flex flex-col justify-between group" style={{ animation: `slideUp 0.3s ease-out ${index * 0.05}s both` }}>
                          <div className="flex justify-between items-start border-b border-black border-dashed pb-1.5 mb-2 pr-8">
                            <h3 className="font-black text-[10px] md:text-xs uppercase leading-tight m-0 group-hover:text-red-600 transition-colors">{resto.name}</h3>
                            <span className="bg-black text-yellow-300 text-[8px] font-black px-1.5 py-0.5 absolute top-2 right-2 border border-black rounded-md">{resto.distance}</span>
                          </div>
                          <div className="flex justify-between items-end mt-1">
                            <div className={`px-1.5 py-1 border border-black rounded-lg text-black ${resto.isWarung ? 'bg-green-100 group-hover:bg-green-200' : 'bg-yellow-100 group-hover:bg-yellow-300'} transition-colors`}>
                              <p className="font-black text-sm md:text-base text-red-600 m-0">{resto.priceRange}</p>
                            </div>
                            <div className="text-[8px] font-black underline opacity-50 group-hover:opacity-100 pb-0.5 group-hover:translate-x-0.5 transition-all">CEK DETAIL</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. ABOUT & TUTORIAL SECTION (RESTORED!) */}
        {/* ======================================================== */}
        <div id="about" className="scroll-mt-16">
          <section className="w-full bg-[#4DEEEA] py-10 border-y-2 border-black">
            <div className="max-w-4xl mx-auto px-5 sm:px-8">
              <div className="text-center mb-8">
                <h2 className="text-sm md:text-base font-black uppercase inline-block bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] rounded-lg rotate-[-1deg] hover:rotate-0 transition-transform">MASALAH HIDUP LO 🤯</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] rotate-[2deg] hover:rotate-0 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><img src="https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150&h=150&fit=crop" alt="" className="w-full aspect-square rounded-lg object-cover border border-black mb-1.5 filter grayscale hover:grayscale-0 transition-all" /><p className="text-[8px] md:text-[9px] font-black uppercase text-center text-black">1. BINGUNG MAKAN APA</p></div>
                <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] rotate-[-1deg] hover:rotate-0 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><img src="https://images.unsplash.com/photo-1584852953283-c23675034c44?w=150&h=150&fit=crop" alt="" className="w-full aspect-square rounded-lg object-cover border border-black mb-1.5 filter grayscale hover:grayscale-0 transition-all" /><p className="text-[8px] md:text-[9px] font-black uppercase text-center text-black">2. TAKUT KANTONG JEBOL</p></div>
                <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] rotate-[-2deg] hover:rotate-0 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop" alt="" className="w-full aspect-square rounded-lg object-cover border border-black mb-1.5 filter grayscale hover:grayscale-0 transition-all" /><p className="text-[8px] md:text-[9px] font-black uppercase text-center text-black">3. MUTER-MUTER DOANG</p></div>
                <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] rotate-[1deg] hover:rotate-0 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><img src="https://images.unsplash.com/photo-1529148482759-b35b25c5f217?w=150&h=150&fit=crop" alt="" className="w-full aspect-square rounded-lg object-cover border border-black mb-1.5 filter grayscale hover:grayscale-0 transition-all" /><p className="text-[8px] md:text-[9px] font-black uppercase text-center text-black">4. UJUNGNYA MIE INSTAN</p></div>
              </div>
            </div>
          </section>

          <section className="w-full bg-[#E2F1E7] py-10 border-b-2 border-black">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
              <div className="bg-black text-white px-3 py-1.5 border-2 border-black rounded-lg rotate-[-1deg] mb-6 shadow-[2px_2px_0px_#FF90E8] inline-block hover:rotate-1 transition-transform"><h2 className="text-xs md:text-sm font-black uppercase">🔥 FITUR SAKTI</h2></div>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex gap-3 items-center hover:translate-x-1 transition-transform"><Zap className="w-8 h-8 text-yellow-500 shrink-0" /><div><h3 className="font-black text-[10px] md:text-xs uppercase">Anti Kantong Jebol</h3><p className="text-[9px] font-bold text-gray-800 mt-1">Cukup modal minimal Goceng (Rp 5.000).</p></div></div>
                <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex gap-3 items-center hover:translate-x-1 transition-transform"><MapPin className="w-8 h-8 text-red-500 shrink-0" /><div><h3 className="font-black text-[10px] md:text-xs uppercase">Radar 5 KM (OSM)</h3><p className="text-[9px] font-bold text-gray-800 mt-1">Tarik data asli satelit tanpa bergantung sama Google!</p></div></div>
              </div>
            </div>
          </section>

          <section className="w-full bg-white py-10 border-b-2 border-black">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
              <div className="mb-8">
                <h2 className="text-xs md:text-sm font-black uppercase inline-block bg-yellow-300 border-2 border-black rounded-lg px-3 py-1.5 shadow-[2px_2px_0px_#000] rotate-1">TUTORIAL PAKAI</h2>
              </div>
              <ol className="grid md:grid-cols-3 gap-5 list-none p-0 m-0 text-left">
                {[{ num: '01', title: 'AKTIFKAN GPS', desc: 'Pencet tombol lacak lokasi di atas.' },{ num: '02', title: 'CEK ISI DOMPET', desc: 'Masukin sisa duit lo (min 5 ribu).' },{ num: '03', title: 'GAS BERANGKAT', desc: 'Klik cari, satelit muter, pilih warung!' }].map((step, i) => (
                  <li key={i} className="flex flex-col gap-1.5 items-start relative bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-colors">
                    <div className="text-2xl font-black text-blue-400 [-webkit-text-stroke:0.5px_black]">{step.num}</div>
                    <div><h3 className="font-black text-[10px] md:text-xs uppercase">{step.title}</h3><p className="text-[9px] md:text-[10px] font-bold text-gray-800 mt-1">{step.desc}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>

        {/* ======================================================== */}
        {/* 4. LAPOR WARUNG SECTION (RESTORED!) */}
        {/* ======================================================== */}
        <section id="lapor" className="w-full bg-white py-12 border-b-2 border-black scroll-mt-16">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="max-w-xl mx-auto bg-white p-5 md:p-6 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] relative hover:shadow-[6px_6px_0px_#000] transition-shadow">
              <div className="absolute -top-3 right-3 bg-blue-500 text-white rounded-full px-2 py-0.5 border-2 border-black text-[9px] font-black rotate-[5deg] uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000]"><CheckSquare className="w-3 h-3" /> GRATIS</div>
              
              <div className="text-center mb-6 mt-1">
                <h2 className="text-lg md:text-xl font-black uppercase leading-none tracking-tighter">LAPOR WARUNG 📍</h2>
                <p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-600">Bantu warga temukan warung murah di sekitar lo. Data akan masuk database!</p>
              </div>

              {formState.success ? (
                <div className="bg-green-400 p-4 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_#000] animate-[slideUp_0.5s_ease-out]"><CheckSquare className="w-6 h-6 mx-auto mb-1 text-black animate-pulse" /><h3 className="font-black text-sm uppercase text-black">MANTAP BOS!</h3><p className="text-[9px] font-bold text-black mt-1">Data warung udah masuk radar.</p></div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault(); dispatch({ type: 'SUBMIT_START' });
                  setTimeout(() => { dispatch({ type: 'SUBMIT_SUCCESS' }); setTimeout(() => dispatch({ type: 'RESET_SUCCESS' }), 5000); }, 1500); 
                }} className="space-y-3">
                  <div><input type="text" required value={formState.namaTempat} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'namaTempat', value: e.target.value })} placeholder="Nama Warung (Cth: Nasi Goreng Gila)" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><input type="text" required value={formState.menuTermurah} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'menuTermurah', value: e.target.value })} placeholder="Menu Andalan" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
                    <div><input type="number" required value={formState.hargaTermurah} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'hargaTermurah', value: e.target.value })} placeholder="Harga (Cth: 10000)" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
                  </div>
                  <div><input type="url" required value={formState.linkMaps} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'linkMaps', value: e.target.value })} placeholder="Link Google Maps..." className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
                  <button type="submit" disabled={formState.isSubmitting} className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-black text-sm py-2 mt-2 border-2 border-black shadow-[2px_2px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#fff] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-1.5 transition-all uppercase">
                    {formState.isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'KIRIM DATA GRATIS'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. UNDANG ADMIN SECTION (VIP - RESTORED!) */}
        {/* ======================================================== */}
        <section id="undang" className="w-full bg-[#FF6B6B] py-12 border-b-2 border-black scroll-mt-16">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="max-w-xl mx-auto bg-white p-5 md:p-6 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] relative hover:shadow-[6px_6px_0px_#000] transition-shadow">
              <div className="absolute -top-3 right-3 bg-yellow-300 text-black px-2 py-0.5 border-2 border-black rounded-full text-[9px] font-black rotate-[-5deg] uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000] animate-pulse"><Star className="w-3 h-3 fill-black" /> VIP SBY</div>
              
              <div className="mb-5 mt-1 text-center">
                <h2 className="text-lg md:text-xl font-black uppercase leading-tight tracking-tighter flex justify-center items-center gap-2"><Star className="w-4 h-4 fill-black"/> UNDANG ADMIN</h2>
                <p className="text-[8px] md:text-[9px] font-bold mt-1.5 text-gray-600 border-b border-dashed border-gray-300 pb-2">
                  Khusus Surabaya. Admin nyamar jadi pembeli biasa biar 100% fair. Garansi uang kembali jika 14 hari tidak tayang di Radar Bokek!
                </p>
              </div>

              {undangSuccess ? (
                <div className="bg-green-400 p-4 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_#000] animate-[slideUp_0.5s_ease-out]"><CheckSquare className="w-6 h-6 mx-auto mb-1 text-black" /><h3 className="font-black text-sm uppercase text-black">REQUEST DITERIMA!</h3><p className="text-[9px] font-bold text-black mt-1">Admin bakal meluncur diam-diam ke lokasi lo.</p></div>
              ) : (
                <form onSubmit={handleUndangSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase mb-1">Nama Warung</label>
                    <input type="text" required value={undangForm.nama} onChange={(e) => setUndangForm({...undangForm, nama: e.target.value})} placeholder="Warung Kopi Mantap" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase mb-1">Menu Yg Direview</label>
                      <input type="text" required value={undangForm.menu} onChange={(e) => setUndangForm({...undangForm, menu: e.target.value})} placeholder="Kopi Hitam" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase mb-1">Harga Menu (Rp)</label>
                      <input type="number" required value={undangForm.harga} onChange={(e) => setUndangForm({...undangForm, harga: e.target.value})} placeholder="Contoh: 10000" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase mb-1">Link Google Maps (WAJIB SURABAYA)</label>
                    <input type="url" required value={undangForm.link} onChange={(e) => setUndangForm({...undangForm, link: e.target.value})} placeholder="http://googleusercontent.com/maps.google.com/..." className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                  </div>

                  {/* KALKULATOR BIAYA LIVE */}
                  <div className="bg-yellow-100 rounded-xl p-2 border-2 border-black mt-2">
                     <p className="text-[9px] font-black uppercase border-b border-black pb-1 mb-1">📝 Rincian Biaya (Live)</p>
                     <div className="flex justify-between text-[9px] font-bold mb-0.5"><span className="text-gray-600">1x Harga Menu:</span><span>Rp {undangForm.harga ? parseInt(undangForm.harga).toLocaleString('id-ID') : '0'}</span></div>
                     <div className="flex justify-between text-[9px] font-bold mb-0.5"><span className="text-gray-600">Biaya Operasional Bensin:</span><span>Rp 5.000</span></div>
                     <div className="flex justify-between text-[9px] font-bold mb-1.5"><span className="text-gray-600">Biaya Server & Admin:</span><span>Rp 2.500</span></div>
                     <div className="flex justify-between text-[11px] font-black border-t border-dashed border-black pt-1"><span>TOTAL BAYAR:</span><span className="text-red-600">Rp {totalBiayaUndang.toLocaleString('id-ID')}</span></div>
                  </div>

                  <button type="submit" disabled={isUndangSubmitting || !undangForm.harga} className={`w-full rounded-xl text-white font-black text-sm py-2 mt-2 border-2 border-black flex items-center justify-center gap-1.5 transition-all uppercase ${!undangForm.harga ? 'bg-gray-400 cursor-not-allowed' : 'bg-black shadow-[2px_2px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#fff] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'}`}>
                    {isUndangSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'BAYAR SEKARANG!'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. FAQ SECTION (RESTORED!) */}
        {/* ======================================================== */}
        <section id="faq" className="w-full bg-blue-400 py-12 border-b-2 border-black scroll-mt-16">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <div className="mb-6">
              <h2 className="text-sm md:text-base font-black uppercase text-white bg-black inline-block px-3 py-1.5 rounded-lg rotate-[-1deg] shadow-[2px_2px_0px_#FFF] tracking-tight hover:rotate-1 transition-transform">FAQ WARGA BOKEK</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Ini Gratis Ngab?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">100% Gratis. Cuma ada iklan dikit buat nambah bayar server VPS.</p></div>
              <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Fitur Undang Admin?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Jalur VIP bayar super murah buat UMKM yang mau diutamakan di aplikasi kita.</p></div>
              <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all md:col-span-2"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Kok warung A ga ada?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Berarti belom daftar di OpenStreetMap atau database kita. Laporin aja bos lewat form di atas!</p></div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-black text-white mt-auto">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-16 md:pb-10 text-center relative overflow-hidden">
          <h2 className="font-black text-xl md:text-2xl mb-1 tracking-tighter text-yellow-300 relative z-10 hover:scale-105 transition-transform inline-block rounded-lg px-2">RADARBOKEK.</h2>
          <p className="text-[8px] md:text-[9px] font-bold opacity-80 mb-4 relative z-10">"Perut kenyang, dompet tenang, masa depan senang."</p>
          <div className="border-t border-dashed border-gray-700 pt-3 text-[8px] font-black uppercase text-gray-400 relative z-10">
            Dibuat di Surabaya dengan Keringat & Air Mata.<br/><span className="mt-0.5 block opacity-50">© 2026 HAK CIPTA MILIK BERSAMA. Data by OSM.</span>
          </div>
        </div>
      </footer>

      {/* 🟢 STICKY BANNER ADSTERRA DI BAWAH LAYAR */}
      {showStickyAd && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black z-[45] flex justify-center items-center py-1.5 px-4 shadow-[0_-2px_0px_rgba(0,0,0,0.1)] rounded-t-2xl">
          <button 
            onClick={() => setShowStickyAd(false)} 
            className="absolute -top-2.5 right-2 sm:right-6 bg-red-500 text-white border-2 border-black w-5 h-5 flex items-center justify-center text-[8px] font-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[2px_2px_0px_#000] rounded-full"
            aria-label="Tutup iklan"
          >
            X
          </button>
          <div className="w-full max-w-[320px] md:max-w-[728px] h-[50px] md:h-[90px] bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-xl">
            <span className="text-[9px] font-black text-gray-400 uppercase opacity-70">
              [ STICKY AD BANNER ADSTERRA SINI ]
            </span>
          </div>
        </div>
      )}

      {/* FLOATING BACK TO TOP BUTTON */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed right-3 sm:right-6 z-50 bg-yellow-300 p-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all duration-300 rounded-full ${
          scrollY > 300 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${showStickyAd ? 'bottom-[65px] md:bottom-[105px]' : 'bottom-4'}`}
        aria-label="Kembali ke atas"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* CUSTOM ANIMATIONS CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(10px); border-radius: 10%; } 100% { opacity: 1; transform: translateY(0); border-radius: 0; } }
        html { scroll-behavior: smooth; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}} />
    </div>
  );
}
