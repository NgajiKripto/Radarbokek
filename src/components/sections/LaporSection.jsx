import { useReducer } from 'react';
import { Loader2, CheckSquare } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import LocationPicker from '../ui/LocationPicker';
import ScallopedDivider from '../ui/ScallopedDivider';

const DEFAULT_COORDS = { lat: -7.2575, lng: 112.7521 };

const initialFormState = { namaTempat: '', menuTermurah: '', hargaTermurah: '', jamBuka: '', coords: DEFAULT_COORDS, isSubmitting: false, success: false };

const formReducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_FIELD': return { ...state, [action.field]: action.value };
    case 'UPDATE_COORDS': return { ...state, coords: action.coords };
    case 'SUBMIT_START': return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS': return { ...initialFormState, success: true };
    case 'RESET_SUCCESS': return { ...state, success: false };
    default: return state;
  }
};

const LaporSection = () => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  return (
    <section id="lapor" className="w-full bg-white py-12 scroll-mt-16">
      <ScallopedDivider color="#FFFFFF" flip={true} />
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="max-w-xl mx-auto bg-white p-5 md:p-6 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] relative hover:shadow-[6px_6px_0px_#000] transition-shadow">
          <div className="absolute -top-3 right-3 bg-blue-500 text-white rounded-full px-2 py-0.5 border-2 border-black text-[9px] font-black rotate-[5deg] uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000]"><CheckSquare className="w-3 h-3" /> GRATIS</div>
          
          <div className="text-center mb-6 mt-1">
            <h2 className="text-lg md:text-xl font-black uppercase leading-none tracking-tighter">LAPOR WARUNG 📍</h2>
            <p className="text-[9px] md:text-[10px] font-bold mt-1.5 text-gray-600">Bantu warga temukan warung murah di sekitar lo. Data akan masuk database!</p>
          </div>

          {formState.success ? (
            <div className="bg-green-400 p-4 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_#000] animate-[slideUp_0.5s_ease-out]"><CheckSquare className="w-6 h-6 mx-auto mb-1 text-black animate-pulse" /><h3 className="font-black text-sm uppercase text-black">MANTAP BOS!</h3><p className="text-[9px] font-bold text-black mt-1">Data warung udah masuk radar.</p></div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault(); dispatch({ type: 'SUBMIT_START' });
              setTimeout(() => { dispatch({ type: 'SUBMIT_SUCCESS' }); setTimeout(() => dispatch({ type: 'RESET_SUCCESS' }), 5000); }, 1500); 
            }} className="space-y-3">
              <div><input type="text" required value={formState.namaTempat} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'namaTempat', value: e.target.value })} placeholder="Nama Warung (Cth: Nasi Goreng Gila)" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><input type="text" required value={formState.menuTermurah} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'menuTermurah', value: e.target.value })} placeholder="Menu Andalan" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
                <div><input type="number" required value={formState.hargaTermurah} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'hargaTermurah', value: e.target.value })} placeholder="Harga (Cth: 10000)" className="w-full border-2 border-black rounded-lg p-1.5 text-[10px] font-bold focus:bg-blue-50 focus:translate-x-0.5 focus:shadow-[-2px_2px_0px_#000] transition-all outline-none placeholder:text-gray-400" /></div>
              </div>
              <div>
                <MapContainer center={[formState.coords.lat, formState.coords.lng]} zoom={13} className="w-full h-48 border-2 border-black rounded-lg z-0 relative">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  <LocationPicker onLocationSelect={(coords) => dispatch({ type: 'UPDATE_COORDS', coords })} />
                  <Marker position={[formState.coords.lat, formState.coords.lng]} />
                </MapContainer>
              </div>
              <button type="submit" disabled={formState.isSubmitting} className="w-full bg-black text-white hover:bg-gray-800 rounded-xl font-black text-sm py-2 mt-2 border-2 border-black shadow-[2px_2px_0px_#fff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#fff] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-1.5 transition-all uppercase">
                {formState.isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'KIRIM DATA GRATIS'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default LaporSection;
