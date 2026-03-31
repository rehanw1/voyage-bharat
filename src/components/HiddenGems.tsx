import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import DetailsModal, { DetailsModalData } from './DetailsModal';

const hiddenGems = [
  {
    id: 1,
    name: 'Mawlynnong',
    location: 'Meghalaya',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mawlynnong_-_Cleanest_village_of_Asia.jpg/960px-Mawlynnong_-_Cleanest_village_of_Asia.jpg',
    desc: 'Known as the cleanest village in Asia, famous for its living root bridges.',
    longDescription: 'Mawlynnong is a village in the East Khasi Hills district of the Meghalaya state in North East India. It is notable for its cleanliness. The travel magazine Discover India declared the village as the cleanest in Asia in 2003, and the cleanest in India in 2005. The village offers picturesque natural beauty, a trek to the living root bridges at a neighboring village Riwai, and a sight of natural balancing rock.',
    height: 'h-96',
  },
  {
    id: 2,
    name: 'Ziro Valley',
    location: 'Arunachal Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/A_cross_section_of_luch_green_valley_of_Ziro.jpg/960px-A_cross_section_of_luch_green_valley_of_Ziro.jpg',
    desc: 'A picturesque valley known for its pine hills and the Apatani tribe.',
    longDescription: 'Ziro is a town and the district headquarters of the Lower Subansiri district in the Indian state of Arunachal Pradesh. It is included in the Tentative List for UNESCO\'s World Heritage Site for the Apatani cultural landscape. The valley is known for its lush green pine hills and the unique culture of the Apatani tribe, who practice a distinct form of agriculture and are known for their facial tattoos.',
    height: 'h-64',
  },
  {
    id: 3,
    name: 'Gurez Valley',
    location: 'Jammu & Kashmir',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Habba_Khatoon.jpg/960px-Habba_Khatoon.jpg',
    desc: 'A stunning, remote valley surrounded by snow-capped mountains.',
    longDescription: 'Gurez, or Gurais, is a valley located in the high Himalayas, about 86 kilometres from Bandipore and 123 kilometres from Srinagar in northern Jammu and Kashmir, India. At about 2,400 metres above sea level, the valley is surrounded by snow-capped mountains. It has diverse fauna and wildlife including the Himalayan brown bear and the snow leopard. The Kishanganga River flows through the valley.',
    height: 'h-80',
  },
  {
    id: 4,
    name: 'Majuli',
    location: 'Assam',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Doriya_River_of_Majuli.jpg/960px-Doriya_River_of_Majuli.jpg',
    desc: 'The world\'s largest river island, rich in Vaishnavite culture.',
    longDescription: 'Majuli or Majoli is a river island in the Brahmaputra River, Assam and in 2016 it became the first island to be made a district in India. It had an area of 880 square kilometres at the beginning of the 20th century, but having lost significantly to erosion it covers 352 square kilometres as at 2014. Majuli has shrunk as the river surrounding it has grown. The island is formed by the Brahmaputra river in the south and the Kherkutia Xuti, an anabranch of the Brahmaputra, joined by the Subansiri River in the north.',
    height: 'h-64',
  },
  {
    id: 5,
    name: 'Chembra Peak',
    location: 'Kerala',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chembra.jpg/960px-Chembra.jpg',
    desc: 'A beautiful peak featuring a heart-shaped lake.',
    longDescription: 'Chembra Peak is the highest peak in Wayanad district, Kerala, India, at an elevation of 2,100 m above sea level. Chembra is located near the town of Meppadi and is 8 km south of Kalpetta. It is part of the Wayanad hill ranges in Western Ghats, adjoining the Nilgiri Hills in Tamil Nadu and Vellarimala in Kozhikode district in Kerala. A heart-shaped lake on the way to the top of the peak is a major tourist attraction.',
    height: 'h-96',
  },
];

export default function HiddenGems() {
  const [selectedGem, setSelectedGem] = useState<DetailsModalData | null>(null);

  return (
    <section id="hidden-gems" className="py-24 bg-dark-pattern text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Hidden Gems
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Venture off the beaten path to discover India's best-kept secrets.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hiddenGems.map((gem, index) => (
            <motion.div
              key={gem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              onClick={() => setSelectedGem({
                title: gem.name,
                image: gem.image,
                description: gem.desc,
                longDescription: gem.longDescription,
                location: gem.location
              })}
              className={`group relative rounded-2xl overflow-hidden shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-[350px] cursor-pointer`}
            >
              <img
                src={gem.image}
                alt={gem.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              
              <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-1 text-orange-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{gem.location}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-serif">{gem.name}</h3>
                <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {gem.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <DetailsModal 
        isOpen={!!selectedGem} 
        onClose={() => setSelectedGem(null)} 
        data={selectedGem} 
      />
    </section>
  );
}
