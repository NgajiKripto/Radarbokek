import { useState } from 'react';
import { Star, Loader2, CheckSquare } from 'lucide-react';

const UndangSection = () => {
  const [undangForm, setUndangForm] = useState({ nama: '', menu: '', harga: '', link: '' });
  const [isUndangSubmitting, setIsUndangSubmitting] = useState(false);
  const [undangSuccess, setUndangSuccess] = useState(false);
  const totalBiayaUndang = parseInt(undangForm.harga) ? parseInt(undangForm.harga) + 7500 : 0;

  const handleUndangSubmit = (e) => {
    e.preventDefault();
    setIsUndangSubmitting(true);
    setTimeout(() => { setIsUndangSubmitting(false); setUndangSuccess(true); setUndangForm({ nama: '', menu: '', harga: '', link: '' }); setTimeout(() => setUndangSuccess(false), 5000); }, 1500);
  };

  return (
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
  );
};

export default UndangSection;
