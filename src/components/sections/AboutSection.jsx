import { Zap, MapPin } from 'lucide-react';

const AboutSection = () => (
  <div id="about" className="scroll-mt-16">
    <section className="w-full bg-[#4DEEEA] py-10 border-b-2 border-black">
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
);

export default AboutSection;
