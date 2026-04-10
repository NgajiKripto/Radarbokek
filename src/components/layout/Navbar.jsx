import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';

const NAV_ITEMS = [
  { id: 'scanner', label: 'SCANNER' },
  { id: 'about',   label: 'TENTANG' },
  { id: 'lapor',   label: 'LAPOR' },
  { id: 'undang',  label: 'UNDANG 🕵️‍♂️' },
];

const MOBILE_NAV_ITEMS = [
  { id: 'scanner', label: '🔍 SCANNER' },
  { id: 'about',   label: '📖 TENTANG' },
  { id: 'lapor',   label: '📣 LAPOR WARUNG' },
  { id: 'undang',  label: '🕵️‍♂️ UNDANG ADMIN' },
  { id: 'faq',     label: '❓ FAQ' },
];

const Navbar = ({ scrollY, isMobileMenuOpen, setIsMobileMenuOpen, onNav, activeSection }) => (
  <>
    <nav className={`sticky top-0 z-50 transition-all duration-300 border-b-2 border-black ${scrollY > 20 ? 'bg-[#FFFDF5] shadow-[0_4px_0px_rgba(0,0,0,1)] py-1' : 'bg-[#FFFDF5] py-1.5'}`}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => onNav('home')}>
            <div className="bg-red-500 text-white p-1 border-2 border-black rotate-[-5deg] group-hover:rotate-0 transition-transform rounded-full"><Logo /></div>
            <span className="font-black text-sm tracking-tighter hidden sm:block group-hover:tracking-normal transition-all">RADAR<span className="text-red-500">BOKEK</span></span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden sm:flex gap-1.5 pr-8">
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = activeSection === id || (id === 'scanner' && activeSection === 'home');
              return (
                <button
                  key={id}
                  onClick={() => onNav(id)}
                  className={`text-[10px] font-bold px-2.5 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all ${isActive ? 'bg-yellow-400' : 'bg-white'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Mobile Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="sm:hidden bg-yellow-400 p-1 border-2 border-black rounded-md shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all mr-6">
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>

    {/* MOBILE MENU */}
    <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
      <div className={`absolute top-0 right-0 h-full w-[220px] bg-[#FFFDF5] border-l-2 border-black shadow-[-4px_0_0_#000] pt-16 px-4 transition-transform duration-300 ease-out rounded-l-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          {MOBILE_NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeSection === id || (id === 'scanner' && activeSection === 'home');
            return (
              <button
                key={id}
                onClick={() => onNav(id)}
                className={`text-xs font-black p-2.5 border-2 border-black text-left rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all ${isActive ? 'bg-yellow-400' : 'bg-white'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </>
);

export default Navbar;
