import { HelpCircle } from 'lucide-react';
import ScallopedDivider from '../ui/ScallopedDivider';

const FaqSection = () => (
  <section id="faq" className="w-full bg-blue-400 py-12 scroll-mt-16">
    <ScallopedDivider color="#60A5FA" flip={true} />
    <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
      <div className="mb-6">
        <h2 className="text-sm md:text-base font-black uppercase text-white bg-black inline-block px-3 py-1.5 rounded-lg rotate-[-1deg] shadow-[2px_2px_0px_#FFF] tracking-tight hover:rotate-1 transition-transform">FAQ WARGA BOKEK</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-left">
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Ini Gratis Ngab?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">100% Gratis. Cuma ada iklan dikit buat nambah bayar server VPS.</p></div>
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Fitur Undang Admin?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Jalur VIP bayar super murah buat UMKM yang mau diutamakan di aplikasi kita.</p></div>
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all md:col-span-2"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Kok warung A ga ada?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Berarti belom daftar di OpenStreetMap atau database kita. Laporin aja bos lewat form di atas!</p></div>
      </div>
    </div>
  </section>
);

export default FaqSection;
