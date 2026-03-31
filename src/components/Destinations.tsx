import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'motion/react';
import { MapPin, Filter, ChevronDown, Search, Heart } from 'lucide-react';
import DetailsModal, { DetailsModalData } from './DetailsModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export type DestItem = {
  id: string;
  name: string;
  region: string;
  theme: string;
  budget: string;
  image: string;
  description: string;
  longDescription: string;
};

const FALLBACK_DESTINATIONS: DestItem[] = [
  { id: '1', name: 'Rajasthan', region: 'North', theme: 'Heritage', budget: 'Luxury', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Thar_Khuri.jpg/960px-Thar_Khuri.jpg', description: 'Majestic forts, vibrant culture, and golden deserts.', longDescription: 'Rajasthan, the Land of Kings, is synonymous with heroism, royalty, and honor. Historic tales of battles fought and romances of the bygone era adorn the walls of the state. Explore the magnificent forts of Jaipur, the lakes of Udaipur, and the vast Thar Desert.' },
  { id: '2', name: 'Kerala', region: 'South', theme: 'Nature', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Boathouse_%287063399547%29.jpg/960px-Boathouse_%287063399547%29.jpg', description: 'Tranquil backwaters, lush hills, and pristine beaches.', longDescription: 'Known as "God\'s Own Country", Kerala is famous for its unique geography, tranquil backwaters, unspoiled beaches, art forms, and spices. Cruise the backwaters of Alleppey in a traditional houseboat, or wander through the lush tea gardens of Munnar.' },
  { id: '3', name: 'Goa', region: 'West', theme: 'Beach', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/960px-BeachFun.jpg', description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage.', longDescription: 'Goa is a state in western India with coastlines stretching along the Arabian Sea. Its long history as a Portuguese colony prior to 1961 is evident in its preserved 17th-century churches and the area’s tropical spice plantations. Goa is also known for its beaches, ranging from popular stretches at Baga and Palolem to those in laid-back fishing villages such as Agonda.' },
  { id: '4', name: 'Himachal Pradesh', region: 'North', theme: 'Adventure', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Kinnaur_Kailash.jpg/960px-Kinnaur_Kailash.jpg', description: 'Breathtaking landscapes, serene monasteries, and adventure.', longDescription: 'Himachal Pradesh is a northern Indian state in the Himalayas. It\'s home to scenic mountain towns and resorts such as Dalhousie. Host to the Dalai Lama, Himachal Pradesh has a strong Tibetan presence. This is reflected in its Buddhist temples and monasteries, as well as its vibrant Tibetan New Year celebrations. The region is also well known for its trekking, climbing and skiing areas.' },
  { id: '5', name: 'Varanasi', region: 'North', theme: 'Spiritual', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/960px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg', description: 'The spiritual capital of India on the banks of the Ganges.', longDescription: 'Varanasi is a city in the northern Indian state of Uttar Pradesh dating to the 11th century B.C. Regarded as the spiritual capital of India, the city draws Hindu pilgrims who bathe in the Ganges River’s sacred waters and perform funeral rites. Along the city\'s winding streets are some 2,000 temples, including Kashi Vishwanath, the "Golden Temple," dedicated to the Hindu god Shiva.' },
  { id: '6', name: 'Andaman', region: 'South', theme: 'Beach', budget: 'Luxury', image: '/images/andaman.png', description: 'Pristine beaches, coral reefs, and marine life.', longDescription: 'The Andaman Islands are an Indian archipelago in the Bay of Bengal. These roughly 300 islands are known for their palm-lined, white-sand beaches, mangroves and tropical rainforests. Coral reefs supporting marine life such as sharks and rays make for popular diving and snorkeling sites. Indigenous Andaman Islanders inhabit the more remote islands, many of which are off limits to visitors.' },
  { id: '7', name: 'Golden Temple, Amritsar', region: 'North', theme: 'Spiritual', budget: 'Budget', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/960px-The_Golden_Temple_of_Amrithsar_7.jpg', description: 'The holiest Gurdwara of Sikhism, known for its stunning golden architecture and peaceful sarovar.', longDescription: 'The Golden Temple, also known as Harmandir Sahib, meaning "abode of God" or Darbār Sahib, meaning "exalted court", is a gurdwara located in the city of Amritsar, Punjab, India. It is the preeminent spiritual site of Sikhism. The temple is built around a man-made pool (sarovar) that was completed by the fourth Sikh Guru, Guru Ram Das, in 1577.' },
  { id: '8', name: 'Meenakshi Temple, Madurai', region: 'South', theme: 'Heritage', budget: 'Mid-range', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/960px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg', description: 'A historic Hindu temple located on the southern bank of the Vaigai River, famous for its towering gopurams.', longDescription: 'Meenakshi Temple is a historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai, Tamil Nadu, India. It is dedicated to the goddess Meenakshi, a form of Parvati, and her consort, Sundareshwarar, a form of Shiva. The temple is at the center of the ancient temple city of Madurai mentioned in the Tamil Sangam literature, with the goddess temple mentioned in 6th-century CE texts.' },
  { id: '9', name: 'Jama Masjid, Delhi', region: 'North', theme: 'Spiritual', budget: 'Luxury', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jama_Masjid_-_In_the_Noon.jpg/960px-Jama_Masjid_-_In_the_Noon.jpg', description: 'One of the largest mosques in India, built by Mughal Emperor Shah Jahan, offering stunning views of Old Delhi.', longDescription: 'The Masjid-i Jehan-Numa, commonly known as the Jama Masjid of Delhi, is one of the largest mosques in India. It was built by the Mughal Emperor Shah Jahan between 1650 and 1656, and inaugurated by its first Imam, Syed Abdul Ghafoor Shah Bukhari. Situated in the Mughal capital of Shahjahanabad (today Old Delhi), it served as the imperial mosque of the Mughal emperors until the demise of the empire in 1857.' },
];

const regions = ['All', 'North', 'South', 'East', 'West', 'Central', 'Northeast'];
const themes = ['All', 'Heritage', 'Nature', 'Beach', 'Adventure', 'Spiritual'];
const budgets = ['All', 'Budget', 'Mid-range', 'Luxury'];

export default function Destinations() {
  const { user } = useAuth();
  const [allDestinations, setAllDestinations] = useState<DestItem[]>(FALLBACK_DESTINATIONS);
  const [favByDestination, setFavByDestination] = useState<Record<string, string>>({});
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeTheme, setActiveTheme] = useState('All');
  const [activeBudget, setActiveBudget] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<DetailsModalData | null>(null);

  useEffect(() => {
    api<{ destinations: DestItem[] }>('/destinations')
      .then((d) => setAllDestinations(d.destinations))
      .catch(() => setAllDestinations(FALLBACK_DESTINATIONS));
  }, []);

  useEffect(() => {
    if (!user?.emailVerified) {
      setFavByDestination({});
      return;
    }
    api<{ favorites: { id: string; destinationId: string }[] }>('/favorites')
      .then((d) => {
        const m: Record<string, string> = {};
        d.favorites.forEach((f) => {
          m[f.destinationId] = f.id;
        });
        setFavByDestination(m);
      })
      .catch(() => setFavByDestination({}));
  }, [user?.id, user?.emailVerified]);

  const toggleFavorite = async (e: ReactMouseEvent<HTMLButtonElement>, dest: DestItem) => {
    e.stopPropagation();
    if (!user) {
      window.dispatchEvent(new CustomEvent('vb:open-auth'));
      return;
    }
    if (!user.emailVerified) {
      window.dispatchEvent(new CustomEvent('vb:need-verify'));
      return;
    }
    const did = String(dest.id);
    try {
      if (favByDestination[did]) {
        await api(`/favorites/${favByDestination[did]}`, { method: 'DELETE' });
        setFavByDestination((prev) => {
          const n = { ...prev };
          delete n[did];
          return n;
        });
      } else {
        const created = await api<{ id: string; destinationId: string }>('/favorites', {
          method: 'POST',
          body: JSON.stringify({
            destinationId: did,
            name: dest.name,
            region: dest.region,
            theme: dest.theme,
            budget: dest.budget,
            image: dest.image,
            description: dest.description,
            longDescription: dest.longDescription,
          }),
        });
        setFavByDestination((prev) => ({ ...prev, [did]: created.id }));
      }
    } catch {
      /* silent */
    }
  };

  const filteredDestinations = allDestinations.filter(dest => {
    return (activeRegion === 'All' || dest.region === activeRegion) &&
           (activeTheme === 'All' || dest.theme === activeTheme) &&
           (activeBudget === 'All' || dest.budget === activeBudget) &&
           (searchQuery === '' || dest.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <section id="destinations" className="min-h-screen py-24 bg-indian-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Destination for Every Bucket List
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Explore famous states known for their unique identity and attractions around India.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 shadow-sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <Filter className="w-5 h-5" />
            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Sidebar Filters */}
          <div className={`lg:w-1/4 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Filter className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              </div>

              {/* Search Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Search</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-10 pr-4 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Region Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Region</h4>
                <div className="relative">
                  <select 
                    value={activeRegion}
                    onChange={(e) => setActiveRegion(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                  >
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Theme Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Theme</h4>
                <div className="flex flex-wrap gap-2">
                  {themes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => setActiveTheme(theme)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeTheme === theme 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Budget</h4>
                <div className="flex flex-wrap gap-2">
                  {budgets.map(budget => (
                    <button
                      key={budget}
                      onClick={() => setActiveBudget(budget)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeBudget === budget 
                          ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => { setActiveRegion('All'); setActiveTheme('All'); setActiveBudget('All'); setSearchQuery(''); }}
                className="w-full mt-8 py-2 text-sm text-gray-500 underline hover:text-gray-800"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:w-3/4">
            {filteredDestinations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-lg">No destinations found matching your filters.</p>
                <button 
                  onClick={() => { setActiveRegion('All'); setActiveTheme('All'); setActiveBudget('All'); setSearchQuery(''); }}
                  className="mt-4 text-orange-600 font-medium hover:underline"
                >
                  Try broadening your search
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.slice(0, visibleCount).map((dest, index) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                      onClick={() => setSelectedDest({
                        title: dest.name,
                        image: dest.image,
                        description: dest.description,
                        longDescription: dest.longDescription,
                        location: `${dest.region} India`,
                        theme: dest.theme,
                        budget: dest.budget
                      })}
                      className="group relative rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-[350px] cursor-pointer border border-gray-100"
                    >
                      <img
                        src={dest.image}
                        alt={dest.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                      
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded-md">
                          {dest.theme}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(e, dest)}
                          className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-orange-600 hover:bg-white shadow-md transition-colors"
                          aria-label={favByDestination[String(dest.id)] ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-5 h-5 ${favByDestination[String(dest.id)] ? 'fill-orange-600' : ''}`} />
                        </button>
                      </div>

                      <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center gap-1 text-orange-400 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">{dest.region} India</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{dest.name}</h3>
                        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                          {dest.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {visibleCount < filteredDestinations.length && (
                  <div className="mt-12 text-center">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 6)}
                      className="inline-flex items-center justify-center px-8 py-3 border-2 border-orange-600 text-orange-600 font-bold rounded-full hover:bg-orange-600 hover:text-white transition-colors shadow-sm hover:shadow-orange-600/20"
                    >
                      Load More Destinations
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <DetailsModal 
        isOpen={!!selectedDest} 
        onClose={() => setSelectedDest(null)} 
        data={selectedDest} 
      />
    </section>
  );
}

