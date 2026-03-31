import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Map as MapIcon, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const itineraries = [
  {
    id: 1,
    title: 'The Golden Triangle',
    region: 'North',
    duration: '7 Days',
    interest: 'Heritage',
    route: 'Delhi - Agra - Jaipur',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1927&auto=format&fit=crop',
    desc: 'Experience the rich cultural heritage and architectural marvels of North India.',
    mapCenter: [27.1751, 77.5] as [number, number],
    mapZoom: 6,
    days: [
      { day: 1, title: 'Arrival in Delhi', desc: 'Explore Old Delhi, Red Fort, and Jama Masjid.', coords: [28.6139, 77.2090] as [number, number], color: '#FF5733' },
      { day: 3, title: 'Delhi to Agra', desc: 'Visit the Taj Mahal and Agra Fort.', coords: [27.1767, 78.0081] as [number, number], color: '#33FF57' },
      { day: 5, title: 'Agra to Jaipur', desc: 'En route visit Fatehpur Sikri. Arrive in Jaipur.', coords: [26.9124, 75.7873] as [number, number], color: '#3357FF' },
      { day: 7, title: 'Departure from Delhi', desc: 'Return to Delhi for your onward journey.', coords: [28.6139, 77.2090] as [number, number], color: '#F333FF' }
    ]
  },
  {
    id: 2,
    title: 'Himalayan Escape',
    region: 'North',
    duration: '10 Days',
    interest: 'Adventure',
    route: 'Shimla - Manali - Dharamshala',
    image: '/images/himalayan-escape.png',
    desc: 'Journey through the majestic peaks, serene valleys, and Tibetan culture.',
    mapCenter: [31.5, 77.0] as [number, number],
    mapZoom: 7,
    days: [
      { day: 1, title: 'Arrival in Shimla', desc: 'Explore the Mall Road and Ridge.', coords: [31.1048, 77.1734] as [number, number], color: '#FF5733' },
      { day: 4, title: 'Shimla to Manali', desc: 'Scenic drive to Manali. Visit Hadimba Temple.', coords: [32.2396, 77.1887] as [number, number], color: '#33FF57' },
      { day: 7, title: 'Manali to Dharamshala', desc: 'Drive to the home of the Dalai Lama.', coords: [32.2190, 76.3234] as [number, number], color: '#3357FF' },
      { day: 10, title: 'Departure', desc: 'Depart from Dharamshala.', coords: [32.2190, 76.3234] as [number, number], color: '#F333FF' }
    ]
  },
  {
    id: 3,
    title: 'Southern Spice Route',
    region: 'South',
    duration: '8 Days',
    interest: 'Nature',
    route: 'Kochi - Munnar - Alleppey',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2069&auto=format&fit=crop',
    desc: 'Cruise the backwaters, explore tea plantations, and savor coastal flavors.',
    mapCenter: [10.0, 76.5] as [number, number],
    mapZoom: 7,
    days: [
      { day: 1, title: 'Arrival in Kochi', desc: 'Explore Fort Kochi and Chinese Fishing Nets.', coords: [9.9312, 76.2673] as [number, number], color: '#FF5733' },
      { day: 3, title: 'Kochi to Munnar', desc: 'Drive to the tea gardens of Munnar.', coords: [10.0889, 77.0595] as [number, number], color: '#33FF57' },
      { day: 6, title: 'Munnar to Alleppey', desc: 'Overnight stay in a traditional houseboat.', coords: [9.4981, 76.3388] as [number, number], color: '#3357FF' },
      { day: 8, title: 'Departure from Kochi', desc: 'Return to Kochi for departure.', coords: [9.9312, 76.2673] as [number, number], color: '#F333FF' }
    ]
  },
];

const regions = ['All', 'North', 'South', 'East', 'West', 'Northeast'];
const durations = ['All', '1-5 Days', '6-10 Days', '11+ Days'];
const interests = ['All', 'Heritage', 'Adventure', 'Nature', 'Spiritual', 'Wildlife'];

export default function Itineraries() {
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeDuration, setActiveDuration] = useState('All');
  const [activeInterest, setActiveInterest] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredItineraries = itineraries.filter(itinerary => {
    const matchRegion = activeRegion === 'All' || itinerary.region === activeRegion;
    const matchInterest = activeInterest === 'All' || itinerary.interest === activeInterest;
    
    let matchDuration = true;
    if (activeDuration !== 'All') {
      const days = parseInt(itinerary.duration);
      if (activeDuration === '1-5 Days') matchDuration = days >= 1 && days <= 5;
      else if (activeDuration === '6-10 Days') matchDuration = days >= 6 && days <= 10;
      else if (activeDuration === '11+ Days') matchDuration = days >= 11;
    }

    return matchRegion && matchInterest && matchDuration;
  });

  const toggleAccordion = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section id="itineraries" className="min-h-screen py-24 bg-indian-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Journey Plans
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Pre-curated itineraries that beckon every traveller. Handcrafted routes for unforgettable memories.
          </motion.p>
        </div>

        {/* 3-Filter Bar */}
        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100 mb-12 flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="font-semibold text-gray-700 w-20 md:w-auto">Region:</span>
            <select 
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="flex-1 md:w-40 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="font-semibold text-gray-700 w-20 md:w-auto">Duration:</span>
            <select 
              value={activeDuration}
              onChange={(e) => setActiveDuration(e.target.value)}
              className="flex-1 md:w-40 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {durations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="font-semibold text-gray-700 w-20 md:w-auto">Interest:</span>
            <select 
              value={activeInterest}
              onChange={(e) => setActiveInterest(e.target.value)}
              className="flex-1 md:w-40 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {interests.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {filteredItineraries.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="bg-orange-50 rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold text-gray-900 shadow-sm">
                  <Clock className="w-4 h-4 text-orange-600" />
                  {item.duration}
                </div>
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-600 to-red-500 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                  {item.interest}
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">{item.title}</h3>
                <div className="flex items-center gap-2 text-orange-600 mb-4 font-medium">
                  <MapIcon className="w-5 h-5" />
                  <span>{item.route}</span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.desc}
                </p>
                
                {/* Accordion Toggle */}
                <button 
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full py-3 border border-orange-600 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-between px-6"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    View Full Itinerary
                  </span>
                  {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-6"
                    >
                      <div className="border-t border-gray-200 pt-6">
                        {/* Map Container */}
                        <div className="h-64 rounded-xl overflow-hidden mb-8 shadow-inner border border-gray-200">
                          <MapContainer 
                            center={item.mapCenter} 
                            zoom={item.mapZoom} 
                            zoomControl={false}
                            scrollWheelZoom={false}
                            className="w-full h-full"
                          >
                            <TileLayer
                              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {/* Draw Route Polylines */}
                            {item.days.map((day, i) => {
                              if (i < item.days.length - 1) {
                                return (
                                  <Polyline 
                                    key={`line-${i}`}
                                    positions={[day.coords, item.days[i+1].coords]} 
                                    color={day.color}
                                    weight={4}
                                    opacity={0.7}
                                    dashArray="10, 10"
                                  />
                                );
                              }
                              return null;
                            })}
                            {/* Draw Markers */}
                            {item.days.map((day, i) => (
                              <Marker key={`marker-${i}`} position={day.coords} icon={customIcon}>
                                <Popup>
                                  <strong>Day {day.day}: {day.title}</strong><br/>
                                  {day.desc}
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>
                        </div>

                        {/* Step-by-step Timeline */}
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                          {item.days.map((day, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <span className="text-xs font-bold">D{day.day}</span>
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-gray-900">{day.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{day.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredItineraries.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No itineraries found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
}
