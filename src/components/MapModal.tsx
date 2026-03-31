import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from '../context/MapContext';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const markers = [
  { id: 1, position: [27.0238, 74.2179] as [number, number], title: 'Rajasthan', type: 'heritage', desc: 'Majestic forts, vibrant culture, and golden deserts.', link: '#destinations' },
  { id: 2, position: [10.8505, 76.2711] as [number, number], title: 'Kerala', type: 'nature', desc: 'Tranquil backwaters, lush hills, and pristine beaches.', link: '#destinations' },
  { id: 3, position: [15.2993, 74.1240] as [number, number], title: 'Goa', type: 'beach', desc: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage.', link: '#destinations' },
  { id: 4, position: [31.1048, 77.1734] as [number, number], title: 'Himachal Pradesh', type: 'adventure', desc: 'Breathtaking landscapes, serene monasteries, and adventure.', link: '#destinations' },
  { id: 5, position: [25.3176, 83.0062] as [number, number], title: 'Varanasi', type: 'spiritual', desc: 'The spiritual capital of India on the banks of the Ganges.', link: '#destinations' },
  { id: 6, position: [11.7401, 92.6586] as [number, number], title: 'Andaman', type: 'beach', desc: 'Pristine beaches, coral reefs, and marine life.', link: '#destinations' },
  { id: 7, position: [31.6200, 74.8765] as [number, number], title: 'Golden Temple, Amritsar', type: 'spiritual', desc: 'The holiest Gurdwara of Sikhism, known for its stunning golden architecture and peaceful sarovar.', link: '#destinations' },
  { id: 8, position: [9.9195, 78.1193] as [number, number], title: 'Meenakshi Temple, Madurai', type: 'heritage', desc: 'A historic Hindu temple located on the southern bank of the Vaigai River, famous for its towering gopurams.', link: '#destinations' },
  { id: 9, position: [28.6507, 77.2334] as [number, number], title: 'Jama Masjid, Delhi', type: 'spiritual', desc: 'One of the largest mosques in India, built by Mughal Emperor Shah Jahan, offering stunning views of Old Delhi.', link: '#destinations' },
];

const filters = ['all', 'heritage', 'nature', 'beach', 'spiritual', 'adventure'];

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useLeafletMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function MapModal() {
  const { isMapModalOpen, closeMapModal } = useMap();
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

  const filteredMarkers = activeFilter === 'all' 
    ? markers 
    : markers.filter(m => m.type === activeFilter);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isMapModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMapModalOpen]);

  return (
    <AnimatePresence>
      {isMapModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full h-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-white z-20">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Explore Interactive Map</h2>
              <button 
                onClick={closeMapModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close map"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
              {/* Sidebar Filters */}
              <div className="w-full md:w-64 bg-orange-50 p-4 md:p-6 border-r border-orange-200 overflow-y-auto z-20">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold">
                  <Filter className="w-5 h-5" />
                  <h3>Filters</h3>
                </div>
                <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  {filters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setMapCenter([20.5937, 78.9629]);
                        setMapZoom(5);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                        activeFilter === filter
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 relative h-full min-h-[400px] z-10">
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapUpdater center={mapCenter} zoom={mapZoom} />
                  {filteredMarkers.map(marker => (
                    <Marker 
                      key={marker.id} 
                      position={marker.position}
                      eventHandlers={{
                        click: () => {
                          setMapCenter(marker.position);
                          setMapZoom(8);
                        },
                        mouseover: (e) => {
                          e.target.openPopup();
                        }
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{marker.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{marker.desc}</p>
                          <div className="flex flex-col items-center gap-2">
                            <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full capitalize font-medium">
                              {marker.type}
                            </span>
                            <a 
                              href={marker.link}
                              onClick={() => {
                                closeMapModal();
                              }}
                              className="inline-block mt-2 px-4 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-full hover:bg-orange-700 transition-colors"
                            >
                              View Section
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
