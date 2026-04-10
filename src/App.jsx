import { useState, useEffect, useRef } from 'react';

import useGeolocation from './hooks/useGeolocation';
import usePlacesSearch from './hooks/usePlacesSearch';
import useScroll from './hooks/useScroll';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import ScrollDots from './components/ui/ScrollDots';
import BackToTop from './components/ui/BackToTop';
import ScallopedDivider from './components/ui/ScallopedDivider';

import AdModal from './components/modals/AdModal';
import RestoModal from './components/modals/RestoModal';
import StickyAd from './components/modals/StickyAd';
import LocationPermissionModal from './components/modals/LocationPermissionModal';

import HeroSection from './components/sections/HeroSection';
import ScannerSection from './components/sections/ScannerSection';
import AboutSection from './components/sections/AboutSection';
import LaporSection from './components/sections/LaporSection';
import UndangSection from './components/sections/UndangSection';
import FaqSection from './components/sections/FaqSection';

// Section IDs in document order (used for active section detection)
const SECTION_IDS = ['home', 'about', 'lapor', 'undang', 'faq'];

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
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const { locationName, userCoords, isLocating, geoError, getLocation } = useGeolocation();
  const { filteredResults, isSearching, isLoadingData, searchError, search } = usePlacesSearch();
  const { scrollY, scrollProgress } = useScroll();

  // Active section detection via IntersectionObserver
  const observerRef = useRef(null);
  useEffect(() => {
    // rootMargin: top=-40% so section activates slightly before center, bottom=-55% so
    // only the section occupying the upper portion of the viewport is considered active.
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    let t; if (showAdModal && adCountdown > 0) t = setTimeout(() => setAdCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showAdModal, adCountdown]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (!navigator.permissions) {
      Promise.resolve().then(() => setShowLocationModal(true));
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'prompt') setShowLocationModal(true);
    }).catch(() => {});
  }, []);

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
    <div className="min-h-screen bg-[#FFFDF5] font-mono text-black selection:bg-yellow-400 flex flex-col relative overflow-x-hidden text-sm pb-20">

      <ScrollDots scrollProgress={scrollProgress} />

      {showLocationModal && (
        <LocationPermissionModal
          onAllow={() => { setShowLocationModal(false); getLocation(); }}
          onDismiss={() => setShowLocationModal(false)}
        />
      )}

      <AdModal showAdModal={showAdModal} adCountdown={adCountdown} onClose={() => setShowAdModal(false)} />

      <RestoModal selectedResto={selectedResto} showAdModal={showAdModal} onClose={() => setSelectedResto(null)} />

      <Navbar scrollY={scrollY} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onNav={handleNav} activeSection={activeSection} />

      <main className="flex-grow flex flex-col">
        <section id="home" className="w-full bg-yellow-400 border-b-2 border-black">
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

        {/* Divider: Yellow → Sky (AboutSection) */}
        <ScallopedDivider color="#38bdf8" flip={true} />

        <AboutSection />

        {/* Divider: Sky (last About sub-section bg-white) → Lime (LaporSection) */}
        <ScallopedDivider color="#bef264" flip={true} />

        <LaporSection />

        {/* Divider: Lime → Amber (UndangSection) */}
        <ScallopedDivider color="#fcd34d" flip={true} />

        <UndangSection />

        {/* Divider: Amber → Sky (FaqSection) */}
        <ScallopedDivider color="#38bdf8" flip={true} />

        <FaqSection />

        {/* Divider: Sky → Black (Footer) */}
        <ScallopedDivider color="#000000" flip={true} />
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
