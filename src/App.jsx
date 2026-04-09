import { useState, useEffect } from 'react';

import useGeolocation from './hooks/useGeolocation';
import usePlacesSearch from './hooks/usePlacesSearch';
import useScroll from './hooks/useScroll';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import ScrollDots from './components/ui/ScrollDots';
import BackToTop from './components/ui/BackToTop';

import AdModal from './components/modals/AdModal';
import RestoModal from './components/modals/RestoModal';
import StickyAd from './components/modals/StickyAd';

import HeroSection from './components/sections/HeroSection';
import ScannerSection from './components/sections/ScannerSection';
import AboutSection from './components/sections/AboutSection';
import LaporSection from './components/sections/LaporSection';
import UndangSection from './components/sections/UndangSection';
import FaqSection from './components/sections/FaqSection';

// ========================================================
// KOMPONEN UTAMA
// ========================================================
export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [selectedResto, setSelectedResto] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [showStickyAd, setShowStickyAd] = useState(true);

  const { locationName, userCoords, isLocating, geoError, getLocation } = useGeolocation();
  const { filteredResults, isSearching, isLoadingData, searchError, search } = usePlacesSearch();
  const { scrollY, scrollProgress } = useScroll();

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

  const handleNav = (id) => {
    setIsMobileMenuOpen(false);
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-mono text-black selection:bg-red-400 flex flex-col relative overflow-x-hidden text-sm pb-20">

      <ScrollDots scrollProgress={scrollProgress} />

      <AdModal showAdModal={showAdModal} adCountdown={adCountdown} onClose={() => setShowAdModal(false)} />

      <RestoModal selectedResto={selectedResto} showAdModal={showAdModal} onClose={() => setSelectedResto(null)} />

      <Navbar scrollY={scrollY} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onNav={handleNav} />

      <main className="flex-grow flex flex-col">
        <section id="home" className="w-full border-b-2 border-black">
          <HeroSection />

          <ScannerSection
          geoError={geoError}
          searchError={searchError}
          isLocating={isLocating}
          userCoords={userCoords}
          locationName={locationName}
          getLocation={getLocation}
          budget={budget}
          setBudget={setBudget}
          isLoadingData={isLoadingData}
          isSearching={isSearching}
          filteredResults={filteredResults}
          onSearchSubmit={handleSearchSubmit}
          onRestoClick={setSelectedResto}
        />
        </section>

        <AboutSection />

        <LaporSection />

        <UndangSection />

        <FaqSection />
      </main>

      <Footer />

      <StickyAd showStickyAd={showStickyAd} onClose={() => setShowStickyAd(false)} />

      <BackToTop scrollY={scrollY} showStickyAd={showStickyAd} />

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
