import { useState } from 'react';
import { Star, Loader2, CheckSquare, Phone, QrCode, Banknote } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import LocationPicker from '../ui/LocationPicker';

const DEFAULT_COORDS = { lat: -7.2575, lng: 112.7521 };

const UndangSection = () => {
  const [undangForm, setUndangForm] = useState({ nama: '', whatsapp: '', menu: '', harga: '', metodePembayaran: '', nominalUnik: '', coords: DEFAULT_COORDS });
  const [isUndangSubmitting, setIsUndangSubmitting] = useState(false);
  const [undangSuccess, setUndangSuccess] = useState(false);
  const nominalUnikVal = undangForm.metodePembayaran === 'qris' && parseInt(undangForm.nominalUnik) > 0 ? parseInt(undangForm.nominalUnik) : 0;
  const isFormInvalid = !undangForm.harga || !undangForm.metodePembayaran || (undangForm.metodePembayaran === 'qris' && !undangForm.nominalUnik);
  const totalBiayaUndang = parseInt(undangForm.harga) ? parseInt(undangForm.harga) + 7500 + nominalUnikVal : 0;

  const handleUndangSubmit = (e) => {
    e.preventDefault();
    setIsUndangSubmitting(true);
    setTimeout(() => { setIsUndangSubmitting(false); setUndangSuccess(true); setUndangForm({ nama: '', whatsapp: '', menu: '', harga: '', metodePembayaran: '', nominalUnik: '', coords: DEFAULT_COORDS }); setTimeout(() => setUndangSuccess(false), 5000); }, 1500);
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
                <input type="text" required value={undangForm.nama} onChange={(e) => setUndangForm({...undangForm, nama: e.target.value})} placeholder="Warung Kopi Mantap" className="w-full border-2 border-black rounded-xl p-3 text-[10px] font-bold shadow-[4px_4px_0px_#000] focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase mb-1">Nomor WhatsApp (Aktif)</label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={undangForm.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUndangForm({...undangForm, whatsapp: val});
                    }}
                    placeholder="Contoh: 08123456789"
                    pattern="^(08|62)\d+"
                    title="Nomor harus diawali dengan 08 atau 62 dan hanya angka"
                    className="w-full border-2 border-black rounded-xl p-3 pl-9 text-[10px] font-bold shadow-[4px_4px_0px_#000] focus:bg-yellow-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400 bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase mb-1">Menu Yg Direview</label>
                  <input type="text" required value={undangForm.menu} onChange={(e) => setUndangForm({...undangForm, menu: e.target.value})} placeholder="Kopi Hitam" className="w-full border-2 border-black rounded-xl p-3 text-[10px] font-bold shadow-[4px_4px_0px_#000] focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase mb-1">Harga Menu (Rp)</label>
                  <input type="number" required value={undangForm.harga} onChange={(e) => setUndangForm({...undangForm, harga: e.target.value})} placeholder="Contoh: 10000" className="w-full border-2 border-black rounded-xl p-3 text-[10px] font-bold shadow-[4px_4px_0px_#000] focus:bg-red-50 focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400" />
                </div>
              </div>
              {/* METODE PEMBAYARAN */}
              <div>
                <label className="block text-[9px] font-black uppercase mb-1">Metode Pembayaran yang Disediakan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUndangForm({...undangForm, metodePembayaran: 'qris', nominalUnik: ''})}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-black rounded-xl text-[10px] font-black uppercase transition-all ${undangForm.metodePembayaran === 'qris' ? 'bg-blue-400 shadow-[2px_2px_0px_#000] -translate-y-0.5' : 'bg-white hover:bg-blue-50'}`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setUndangForm({...undangForm, metodePembayaran: 'tunai', nominalUnik: ''})}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-black rounded-xl text-[10px] font-black uppercase transition-all ${undangForm.metodePembayaran === 'tunai' ? 'bg-green-400 shadow-[2px_2px_0px_#000] -translate-y-0.5' : 'bg-white hover:bg-green-50'}`}
                  >
                    <Banknote className="w-3.5 h-3.5" /> TUNAI
                  </button>
                </div>
              </div>

              {/* NOMINAL UNIK — hanya muncul jika QRIS dipilih */}
              {undangForm.metodePembayaran === 'qris' && (
                <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-400">
                  <label className="block text-[9px] font-black uppercase mb-1 text-blue-700">
                    Nominal Unik (Rp 1 – Rp 10)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={undangForm.nominalUnik}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { setUndangForm({...undangForm, nominalUnik: ''}); return; }
                      const val = Math.min(10, Math.max(1, parseInt(raw)));
                      setUndangForm({...undangForm, nominalUnik: String(val)});
                    }}
                    placeholder="Contoh: 7"
                    className="w-full border-2 border-blue-400 rounded-lg p-1.5 text-[10px] font-bold focus:bg-white focus:-translate-y-0.5 transition-all outline-none placeholder:text-gray-400"
                  />
                  <p className="text-[8px] font-bold text-blue-600 mt-1.5 leading-tight">
                    💡 Admin wajib membayar harga menu + nominal unik ini saat berkunjung ke warung kamu, sebagai bukti kunjungan nyata.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black uppercase mb-1">Lokasi Warung (WAJIB SURABAYA)</label>
                <MapContainer center={[undangForm.coords.lat, undangForm.coords.lng]} zoom={13} className="w-full h-48 border-2 border-black rounded-lg z-0 relative">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  <LocationPicker onLocationSelect={(coords) => setUndangForm({...undangForm, coords})} />
                  <Marker position={[undangForm.coords.lat, undangForm.coords.lng]} />
                </MapContainer>
              </div>

              {/* KALKULATOR BIAYA LIVE */}
              <div className="bg-yellow-100 rounded-xl p-2 border-2 border-black mt-2">
                 <p className="text-[9px] font-black uppercase border-b border-black pb-1 mb-1">📝 Rincian Biaya (Live)</p>
                 <div className="flex justify-between text-[9px] font-bold mb-0.5"><span className="text-gray-600">1x Harga Menu:</span><span>Rp {undangForm.harga ? parseInt(undangForm.harga).toLocaleString('id-ID') : '0'}</span></div>
                 <div className="flex justify-between text-[9px] font-bold mb-0.5"><span className="text-gray-600">Biaya Operasional Bensin:</span><span>Rp 5.000</span></div>
                 <div className="flex justify-between text-[9px] font-bold mb-0.5"><span className="text-gray-600">Biaya Server & Admin:</span><span>Rp 2.500</span></div>
                 {undangForm.metodePembayaran === 'qris' && nominalUnikVal > 0 && (
                   <div className="flex justify-between text-[9px] font-bold mb-0.5 text-blue-700"><span>Nominal Unik (QRIS):</span><span>Rp {nominalUnikVal.toLocaleString('id-ID')}</span></div>
                 )}
                 <div className="flex justify-between text-[11px] font-black border-t border-dashed border-black pt-1"><span>TOTAL BAYAR:</span><span className="text-red-600">Rp {totalBiayaUndang.toLocaleString('id-ID')}</span></div>
              </div>

              <button type="submit" disabled={isUndangSubmitting || isFormInvalid} className={`w-full rounded-xl text-white font-black text-sm py-2 mt-2 border-2 border-black flex items-center justify-center gap-1.5 transition-all uppercase ${isFormInvalid ? 'bg-gray-400 cursor-not-allowed' : 'bg-black shadow-[2px_2px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#fff] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'}`}>
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
