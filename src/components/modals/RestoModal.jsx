import { Eye } from 'lucide-react';

const RestoModal = ({ selectedResto, showAdModal, onClose }) => {
  if (!selectedResto || showAdModal) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-3 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDF5] border-2 border-black p-4 shadow-[4px_4px_0px_#4DEEEA] w-full max-w-[280px] rounded-xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute -top-3 -right-3 bg-red-500 text-white border-2 border-black w-6 h-6 flex items-center justify-center font-black text-sm rounded-full shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all">X</button>
        <h2 className="text-lg font-black uppercase leading-tight border-b border-black border-dashed pb-1.5 mb-3">{selectedResto.name}</h2>
        <div className="bg-yellow-300 border-2 border-black p-2 text-center shadow-[2px_2px_0px_#000] rotate-[-1deg] mb-4 rounded-lg">
          <p className="text-[9px] font-black uppercase mb-0.5 flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> STATISTIK RADAR</p>
          <p className="text-2xl font-black tracking-tighter mb-0.5">{selectedResto.views} <span className="text-[10px] font-bold tracking-normal">MATA</span></p>
          <p className="text-[8px] font-bold bg-black text-white inline-block px-1.5 py-0.5 border border-black rounded-full">Warga kepo warung ini! 🔥</p>
        </div>
        <div className="space-y-1 mb-4 bg-white p-2 border-2 border-black text-[10px] font-bold uppercase rounded-lg">
          <p className="flex justify-between border-b border-dashed border-gray-300 pb-0.5"><span className="text-gray-500">KATEGORI:</span> <span className="text-right">{selectedResto.category}</span></p>
          <p className="flex justify-between border-b border-dashed border-gray-300 pb-0.5"><span className="text-gray-500">EST. HARGA:</span> <span className="text-red-600 text-right">{selectedResto.priceRange}</span></p>
          <p className="flex justify-between"><span className="text-gray-500">JARAK:</span> <span>{selectedResto.distance}</span></p>
        </div>
        <a href={`https://www.google.com/maps/search/?api=1&query=$${selectedResto.lat},${selectedResto.lng}`} target="_blank" rel="noreferrer" className="block w-full bg-blue-400 text-white text-center hover:bg-blue-500 font-black py-2 text-xs border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase">
          BUKA DI MAPS 📍
        </a>
      </div>
    </div>
  );
};

export default RestoModal;
