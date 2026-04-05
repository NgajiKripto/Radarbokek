const StickyAd = ({ showStickyAd, onClose }) => {
  if (!showStickyAd) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black z-[45] flex justify-center items-center py-1.5 px-4 shadow-[0_-2px_0px_rgba(0,0,0,0.1)] rounded-t-2xl">
      <button 
        onClick={onClose} 
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
  );
};

export default StickyAd;
