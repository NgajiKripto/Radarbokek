import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const MotionDiv = motion.div;

const HeroSection = () => (
  <MotionDiv
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="w-full pt-10 pb-6"
  >
    <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center group cursor-default">
      <h1 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mb-1.5 transition-transform duration-300 group-hover:scale-[1.02]">
        RADAR BOKEK<br/>
        <span className="text-[#FFFDF5] bg-black px-2 py-0.5 border-2 border-black md:rotate-1 inline-block mt-2 shadow-[4px_4px_0px_rgba(0,0,0,0.3)] text-sm md:text-xl group-hover:rotate-0 transition-all rounded-lg">
          Selamatkan isi Dompet
        </span>
      </h1>
      <p className="text-[10px] md:text-sm font-bold text-gray-700 mt-3 max-w-[260px] md:max-w-md mx-auto">Nggak usah ribet mikir. Lacak GPS lo, masukin sisa duit di dompet, kita kasih list warung terdekat secara gratis.</p>
    </div>
  </MotionDiv>
);

export default HeroSection;
