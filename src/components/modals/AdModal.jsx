const AdModal = ({ showAdModal, adCountdown, onClose }) => {
  if (!showAdModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-black p-3 w-full max-w-[300px] text-center shadow-[4px_4px_0px_#4DEEEA] rounded-xl animate-in zoom-in-95">
        <p className="text-[9px] font-black text-gray-500 mb-2 uppercase tracking-widest border-b border-dashed border-gray-300 pb-1">Scanning satelit OSM... cek iklan 👇</p>
        <div className="w-full h-[250px] bg-gray-100 border-2 border-black flex items-center justify-center mb-3 rounded-lg"><span className="text-gray-400 font-black text-[9px] uppercase opacity-50 px-2">[ IKLAN ADSTERRA 300x250 ]</span></div>
        <button onClick={onClose} disabled={adCountdown > 0} className={`w-full font-black py-2 text-xs border-2 border-black rounded-lg uppercase transition-all tracking-tight ${adCountdown > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'}`}>
          {adCountdown > 0 ? `LEWATI DALAM ${adCountdown} DETIK...` : 'LIHAT HASIL SCAN'}
        </button>
      </div>
    </div>
  );
};

export default AdModal;
