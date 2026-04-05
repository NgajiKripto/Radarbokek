const HeroSection = () => (
  <section id="home" className="w-full pt-10 pb-6">
    <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center group cursor-default">
      <h1 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mb-1.5 transition-transform duration-300 group-hover:scale-[1.02]">
        RADAR BOKEK<br/>
        <span className="text-red-500 bg-yellow-300 px-2 py-0.5 border-2 border-black md:rotate-1 inline-block mt-2 shadow-[2px_2px_0px_#000] text-sm md:text-xl group-hover:rotate-0 transition-all rounded-lg">
          Selamatkan isi Dompet
        </span>
      </h1>
      <p className="text-[10px] md:text-sm font-bold text-gray-700 mt-3 max-w-[260px] md:max-w-md mx-auto">Nggak usah ribet mikir. Lacak GPS lo, masukin sisa duit di dompet, kita kasih list warung terdekat secara gratis.</p>
    </div>
  </section>
);

export default HeroSection;
