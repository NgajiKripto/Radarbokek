const LocationPermissionModal = ({ onAllow, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-black p-5 w-full max-w-[320px] text-center shadow-[6px_6px_0px_#000] rounded-2xl animate-in zoom-in-95">

        <div className="text-4xl mb-3">📍</div>

        <h2 className="font-black text-base uppercase tracking-tight mb-1">
          Boleh Tau Lokasimu?
        </h2>

        <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
          RadarBokek butuh akses lokasi buat nyariin warung & resto murah di sekitar kamu.
          Data lokasi <span className="font-bold text-black">cuma dipakai sekarang</span> dan nggak disimpen.
        </p>

        <button
          onClick={onAllow}
          className="w-full font-black py-2.5 text-xs border-2 border-black rounded-xl uppercase tracking-tight bg-yellow-300 shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition-all mb-2"
        >
          📡 Izinkan Akses Lokasi
        </button>

        <button
          onClick={onDismiss}
          className="w-full font-black py-2 text-[11px] border-2 border-black rounded-xl uppercase tracking-tight bg-white text-gray-500 hover:bg-gray-100 transition-all"
        >
          Nanti Aja
        </button>

        <p className="text-[9px] text-gray-400 mt-3 leading-relaxed">
          Kamu bisa izinkan lokasi kapan saja lewat tombol GPS di halaman utama.
        </p>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
