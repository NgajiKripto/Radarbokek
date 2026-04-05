import { ArrowUp } from 'lucide-react';

const BackToTop = ({ scrollY, showStickyAd }) => (
  <button 
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className={`fixed right-3 sm:right-6 z-50 bg-yellow-300 p-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all duration-300 rounded-full ${
      scrollY > 300 ? 'opacity-100' : 'opacity-0 pointer-events-none'
    } ${showStickyAd ? 'bottom-[65px] md:bottom-[105px]' : 'bottom-4'}`}
    aria-label="Kembali ke atas"
  >
    <ArrowUp className="w-4 h-4" />
  </button>
);

export default BackToTop;
