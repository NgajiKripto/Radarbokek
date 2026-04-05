const ScrollDots = ({ scrollProgress }) => (
  <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`rounded-full border-2 border-black transition-all duration-300 ${i === Math.min(4, Math.floor(scrollProgress / 20)) ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 scale-125 shadow-[2px_2px_0px_#000]' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white opacity-50'}`} />
    ))}
  </div>
);

export default ScrollDots;
