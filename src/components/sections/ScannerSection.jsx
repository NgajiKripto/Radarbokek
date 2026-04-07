import { MapPin, Search, Loader2, AlertTriangle } from 'lucide-react';
import BrutalButton from '../ui/BrutalButton';

const ScannerSection = ({
  geoError, searchError,
  isLocating, userCoords, locationName, getLocation,
  budget, setBudget,
  isLoadingData, isSearching, filteredResults,
  onSearchSubmit, onRestoClick,
}) => (
  <section id="scanner" className="w-full pb-12 scroll-mt-20">
    <div className="max-w-4xl mx-auto px-5 sm:px-8">
      <div className="max-w-md mx-auto bg-[#FF90E8] p-3 md:p-4 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all relative">
        <form onSubmit={onSearchSubmit} className="space-y-3">
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

          <BrutalButton
            type="submit"
            disabled={isLoadingData}
            icon={isLoadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            className="text-sm md:text-base"
          >
            {isLoadingData ? 'SCANNING...' : 'GAS CARI!'}
          </BrutalButton>
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
                  <li key={resto.id} onClick={() => onRestoClick(resto)} className="bg-white p-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-none transition-all cursor-pointer flex flex-col justify-between group" style={{ animation: `slideUp 0.3s ease-out ${index * 0.05}s both` }}>
                    {resto.isVIP ? (
                      <span className="inline-flex w-fit items-center bg-yellow-300 text-black text-[8px] font-black px-2 py-0.5 border-2 border-black rounded-full mb-2">
                        ⭐ VIP ADMIN
                      </span>
                    ) : null}
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
);

export default ScannerSection;
