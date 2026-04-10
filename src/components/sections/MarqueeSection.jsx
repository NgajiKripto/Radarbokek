import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const MARQUEE_TEXT = 'ANTI KANTONG JEBOL \u2022 RADAR 5 KM (OSM) \u2022 CARI JAJANAN/MAKANAN/MINUMAN MULAI DARI GOCENG \u2022 VERIFIKASI VIP ADMIN \u2022 ';

const MarqueeSection = () => (
  <div className="w-full bg-black border-y-2 border-black py-4 overflow-hidden">
    <div className="flex whitespace-nowrap">
      <MotionDiv
        className="flex shrink-0"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
      >
        <span className="text-white font-black uppercase font-mono text-xl tracking-wide px-4">
          {MARQUEE_TEXT}
        </span>
        <span className="text-white font-black uppercase font-mono text-xl tracking-wide px-4">
          {MARQUEE_TEXT}
        </span>
      </MotionDiv>
    </div>
  </div>
);

export default MarqueeSection;
