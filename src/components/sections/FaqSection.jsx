import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const MotionSection = motion.section;

const FaqSection = () => (
  <MotionSection
    id="faq"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="w-full bg-sky-400 py-12 border-b-2 border-black scroll-mt-16"
  >
    <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
      <div className="mb-6">
        <h2 className="text-sm md:text-base font-black uppercase text-white bg-black inline-block px-3 py-1.5 rounded-lg rotate-[-1deg] shadow-[2px_2px_0px_#FFF] tracking-tight hover:rotate-1 transition-transform">FAQ WARGA BOKEK</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-left">
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Ini Gratis Ngab?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">100% Gratis. Cuma ada iklan dikit buat nambah bayar server VPS.</p></div>
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Fitur Undang Admin?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Jalur VIP bayar super murah buat UMKM yang mau diutamakan di aplikasi kita.</p></div>
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all md:col-span-2"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Kok warung A ga ada?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Berarti belom daftar di OpenStreetMap atau database kita. Laporin aja bos lewat form di atas!</p></div>

        {/* FAQ Mitra / Pemilik Warung */}
        <div className="bg-yellow-300 p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Apa keuntungan warung saya jadi VIP Admin?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Warung Anda akan tampil di urutan teratas selama 1 bulan penuh dan mendapatkan lencana &quot;Verified&quot; yang meningkatkan kepercayaan calon pembeli.</p></div>
        <div className="bg-cyan-300 p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Gimana saya tahu Admin benar-benar datang setelah saya undang?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Kami menggunakan sistem &quot;Ghost Shopping&quot;. Admin datang secara anonim sebagai pembeli biasa untuk menjaga porsi tetap asli. Setelah selesai, Admin akan mengirimkan bukti foto kunjungan dan bukti bayar ke WhatsApp Anda.</p></div>
        <div className="bg-white p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Apakah Admin akan minta porsi lebih saat datang?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Tidak. Admin menyamar agar mendapatkan pengalaman dan porsi yang sama persis dengan pelanggan lain. Ini memastikan review kami tetap jujur dan terpercaya.</p></div>
        <div className="bg-yellow-300 p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Berapa biaya untuk fitur Undang Admin?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Anda cukup membayar harga menu yang dipesan ditambah biaya operasional ringan. Tanpa biaya langganan bulanan yang mencekik.</p></div>
        <div className="bg-cyan-300 p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all md:col-span-2"><h3 className="font-black text-xs md:text-sm uppercase flex items-center gap-1.5 tracking-tight text-black"><HelpCircle className="w-4 h-4"/> Bisa tidak saya mendaftarkan warung saya secara gratis?</h3><p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-800">Tentu saja! Gunakan fitur &quot;Lapor Warung&quot;. Warung Anda akan masuk radar secara publik, meski tanpa prioritas urutan seperti fitur VIP.</p></div>
      </div>
    </div>
  </MotionSection>
);

export default FaqSection;
