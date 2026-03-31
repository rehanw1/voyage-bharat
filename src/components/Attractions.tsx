import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ArrowRight, MapPin } from 'lucide-react';
import L from 'leaflet';
import DetailsModal, { DetailsModalData } from './DetailsModal';

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

const attractions = [
  {
    id: 1,
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg',
    description: 'An ivory-white marble mausoleum on the right bank of the river Yamuna.',
    longDescription: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself. The tomb is the centrepiece of a 17-hectare (42-acre) complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall.',
    coordinates: [27.1751, 78.0421] as [number, number]
  },
  {
    id: 2,
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg',
    description: 'A palace built from red and pink sandstone, known as the Palace of Winds.',
    longDescription: 'The Hawa Mahal is a palace in the city of Jaipur, India. Built from red and pink sandstone, it is on the edge of the City Palace, Jaipur, and extends to the Zenana, or women\'s chambers. The structure was built in 1799 by the Maharaja Sawai Pratap Singh, grandson of Maharaja Sawai Jai Singh, the founder of the city of Jaipur, India. Its unique five-storey exterior is akin to a honeycomb with its 953 small windows called Jharokhas decorated with intricate latticework.',
    coordinates: [26.9239, 75.8267] as [number, number]
  },
  {
    id: 3,
    name: 'Gateway of India',
    location: 'Mumbai, Maharashtra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/960px-Mumbai_03-2016_30_Gateway_of_India.jpg',
    description: 'An arch monument built during the 20th century in Bombay.',
    longDescription: 'The Gateway of India is an arch-monument built in the early twentieth century in the city of Mumbai, in the Indian state of Maharashtra. It was erected to commemorate the landing in December 1911 at Apollo Bunder, Mumbai (then Bombay) of King-Emperor George V and Queen-Empress Mary, the first British monarch to visit India. The monument has also been referred to as the Taj Mahal of Mumbai, and is the city\'s top tourist attraction.',
    coordinates: [18.9220, 72.8347] as [number, number]
  },
  {
    id: 4,
    name: 'Meenakshi Temple',
    location: 'Madurai, Tamil Nadu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/960px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg',
    description: 'A historic Hindu temple located on the southern bank of the Vaigai River.',
    longDescription: 'Meenakshi Temple is a historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai, Tamil Nadu, India. It is dedicated to the goddess Meenakshi, a form of Parvati, and her consort, Sundareshwarar, a form of Shiva. The temple is at the center of the ancient temple city of Madurai mentioned in the Tamil Sangam literature, with the goddess temple mentioned in 6th-century CE texts.',
    coordinates: [9.9195, 78.1193] as [number, number]
  },
  {
    id: 5,
    name: 'Victoria Memorial',
    location: 'Kolkata, West Bengal',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Victoria_Memorial_situated_in_Kolkata.jpg/960px-Victoria_Memorial_situated_in_Kolkata.jpg',
    description: 'A large marble building dedicated to the memory of Queen Victoria.',
    longDescription: 'The Victoria Memorial is a large marble building on the Maidan in Central Kolkata, built between 1906 and 1921. It is dedicated to the memory of Queen Victoria, then Empress of India, and is now a museum and tourist destination under the auspices of the Ministry of Culture. The memorial lies on the Maidan by the bank of the Hooghly River, near Jawaharlal Nehru Road.',
    coordinates: [22.5448, 88.3426] as [number, number]
  },
  {
    id: 6,
    name: 'Mysore Palace',
    location: 'Mysore, Karnataka',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/960px-Mysore_Palace_Morning.jpg',
    description: 'A historical palace and a royal residence at Mysore.',
    longDescription: 'Mysore Palace, also known as Amba Vilas Palace, is a historical palace and a royal residence at Mysore in the Indian State of Karnataka. It is the official residence of the Wadiyar dynasty and the seat of the Kingdom of Mysore. The palace is in the centre of Mysore, and faces the Chamundi Hills eastward. Mysore is commonly described as the \'City of Palaces\', and there are seven palaces including this one.',
    coordinates: [12.3052, 76.6552] as [number, number]
  },
  {
    id: 7,
    name: 'Golden Temple',
    location: 'Amritsar, Punjab',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/960px-The_Golden_Temple_of_Amrithsar_7.jpg',
    description: 'The preeminent spiritual site of Sikhism.',
    longDescription: 'The Golden Temple, also known as Harmandir Sahib, meaning "abode of God" or Darbār Sahib, meaning "exalted court", is a gurdwara located in the city of Amritsar, Punjab, India. It is the preeminent spiritual site of Sikhism. The temple is built around a man-made pool (sarovar) that was completed by the fourth Sikh Guru, Guru Ram Das, in 1577.',
    coordinates: [31.6200, 74.8765] as [number, number]
  },
  {
    id: 8,
    name: 'Qutub Minar',
    location: 'New Delhi, Delhi',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/960px-Qutb_Minar_2022.jpg',
    description: 'A minaret and "victory tower" that forms part of the Qutb complex.',
    longDescription: 'The Qutb Minar, also spelled Qutub Minar and Qutab Minar, is a minaret and "victory tower" that forms part of the Qutb complex, which lies at the site of Delhi\'s oldest fortified city, Lal Kot, founded by the Tomar Rajputs. It is a UNESCO World Heritage Site in the Mehrauli area of South Delhi, India. It is one of the most visited tourist spots in the city, mostly built between 1199 and 1220.',
    coordinates: [28.5245, 77.1855] as [number, number]
  },
  {
    id: 9,
    name: 'Ajanta Caves',
    location: 'Aurangabad, Maharashtra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/960px-Ajanta_%2863%29.jpg',
    description: 'Approximately 30 rock-cut Buddhist cave monuments.',
    longDescription: 'The Ajanta Caves are approximately 30 rock-cut Buddhist cave monuments dating from the second century BCE to about 480 CE in the Aurangabad district of Maharashtra state in India. The caves include paintings and rock-cut sculptures described as among the finest surviving examples of ancient Indian art, particularly expressive paintings that present emotions through gesture, pose and form.',
    coordinates: [20.5519, 75.7033] as [number, number]
  }
];

export default function Attractions() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<DetailsModalData | null>(null);

  return (
    <section id="attractions" className="py-24 bg-mandala-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Must-See Attractions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Discover the iconic landmarks that define India's rich heritage.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction, index) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="group relative bg-orange-50 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-orange-100 flex flex-col h-[450px]"
              onMouseEnter={() => setHoveredId(attraction.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image / Map Container */}
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <AnimatePresence>
                  {hoveredId === attraction.id ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10"
                    >
                      <MapContainer 
                        center={attraction.coordinates} 
                        zoom={12} 
                        zoomControl={false}
                        dragging={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        className="w-full h-full"
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={attraction.coordinates} icon={customIcon} />
                      </MapContainer>
                      <div className="absolute inset-0 bg-black/10 z-[400] pointer-events-none" />
                    </motion.div>
                  ) : (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={attraction.image}
                      alt={attraction.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </AnimatePresence>
                
                {/* Number Badge */}
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-br from-orange-500 to-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg shadow-md">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-1 text-orange-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{attraction.location}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">{attraction.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                  {attraction.description}
                </p>
                
                <button 
                  onClick={() => setSelectedAttraction({
                    title: attraction.name,
                    image: attraction.image,
                    description: attraction.description,
                    longDescription: attraction.longDescription,
                    location: attraction.location
                  })}
                  className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors mt-auto group/link"
                >
                  Dive Deeper 
                  <ArrowRight className="w-4 h-4 transform transition-transform group-hover/link:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <DetailsModal 
        isOpen={!!selectedAttraction} 
        onClose={() => setSelectedAttraction(null)} 
        data={selectedAttraction} 
      />
    </section>
  );
}
