import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Compass, Heart, Mountain, Utensils, Map } from 'lucide-react';
import DetailsModal, { DetailsModalData } from './DetailsModal';

const themes = ['All', 'Wildlife', 'Heritage', 'Adventure', 'Food', 'Spiritual', 'Offbeat'];

const stories = [
  {
    id: 1,
    title: 'Tracking the Royal Bengal Tiger',
    theme: 'Wildlife',
    author: 'Rohan Sharma',
    date: 'Oct 12, 2023',
    icon: <Compass className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg/960px-Bengal_tiger_in_Sanjay_Dubri_Tiger_Reserve_December_2024_by_Tisha_Mukherjee_11.jpg',
    desc: 'A thrilling 3-day safari in Ranthambore National Park, capturing the majestic beast in its natural habitat.',
    longDescription: 'Ranthambore National Park is a vast wildlife reserve near the town of Sawai Madhopur in Rajasthan, northern India. It is a former royal hunting ground and home to tigers, leopards and marsh crocodiles. Its landmarks include the imposing 10th-century Ranthambore Fort, on a hilltop, and the Ganesh Mandir temple. Also in the park, Padam Talao Lake is known for its abundance of water lilies.'
  },
  {
    id: 2,
    title: 'Echoes of the Vijayanagara Empire',
    theme: 'Heritage',
    author: 'Priya Patel',
    date: 'Nov 05, 2023',
    icon: <Camera className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/960px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg',
    desc: 'Wandering through the ruins of Hampi, where every stone tells a story of a forgotten era.',
    longDescription: 'Hampi is an ancient village in the south Indian state of Karnataka. It’s dotted with numerous ruined temple complexes from the Vijayanagara Empire. On the south bank of the River Tungabhadra is the 7th-century Hindu Virupaksha Temple, near the revived Hampi Bazaar. A carved stone chariot stands in front of the huge Vittala Temple site. Southeast of Hampi, Daroji Bear Sanctuary is home to the Indian sloth bear.'
  },
  {
    id: 3,
    title: 'Conquering the Chadar Trek',
    theme: 'Adventure',
    author: 'Vikram Singh',
    date: 'Jan 20, 2024',
    icon: <Mountain className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Indus_Zanskar_confluence.jpg/960px-Indus_Zanskar_confluence.jpg',
    desc: 'Walking on the frozen Zanskar River: a test of endurance and a journey of a lifetime.',
    longDescription: 'The Chadar Trek or the Zanskar Gorge is a winter trail in the Zanskar region of Ladakh, in the Indian state of Jammu and Kashmir. Traditionally, the only means of travel in the area during the harsh winter months, the trail has become popular with international adventure tourists. The walls are near vertical cliffs up to 600 m high and the Zanskar River (a tributary of the Indus) is only 5 metres (16 ft) in places.'
  },
  {
    id: 4,
    title: 'Finding Peace in Varanasi',
    theme: 'Spiritual',
    author: 'Anita Desai',
    date: 'Feb 14, 2024',
    icon: <Heart className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/960px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg',
    desc: 'Experiencing the mesmerizing Ganga Aarti and the profound silence of the ghats at dawn.',
    longDescription: 'Varanasi is a city in the northern Indian state of Uttar Pradesh dating to the 11th century B.C. Regarded as the spiritual capital of India, the city draws Hindu pilgrims who bathe in the Ganges River’s sacred waters and perform funeral rites. Along the city\'s winding streets are some 2,000 temples, including Kashi Vishwanath, the "Golden Temple," dedicated to the Hindu god Shiva.'
  },
  {
    id: 5,
    title: 'A Culinary Journey through Old Delhi',
    theme: 'Food',
    author: 'Karan Kapoor',
    date: 'Mar 02, 2024',
    icon: <Utensils className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Gurudwara_Sisganj_Sahib_Chandni_Chowk_19.jpg/960px-Gurudwara_Sisganj_Sahib_Chandni_Chowk_19.jpg',
    desc: 'From spicy chaat to rich kebabs, exploring the hidden food gems of Chandni Chowk.',
    longDescription: 'Chandni Chowk is one of the oldest and busiest markets in Old Delhi, India. It is located close to Old Delhi Railway Station. The Red Fort monument is located at the eastern end of Chandni Chowk. It was built in the 17th century by Mughal Emperor of India Shah Jahan and designed by his daughter Jahanara. The market was once divided by canals (now closed) to reflect moonlight and remains one of India\'s largest wholesale markets.'
  },
  {
    id: 6,
    title: 'The Living Root Bridges of Meghalaya',
    theme: 'Offbeat',
    author: 'Meera Reddy',
    date: 'Apr 18, 2024',
    icon: <Map className="w-5 h-5" />,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg/960px-Living_root_bridges%2C_Nongriat_village%2C_Meghalaya2.jpg',
    desc: 'Trekking deep into the Khasi hills to witness nature and human ingenuity intertwined.',
    longDescription: 'A living root bridge is a type of simple suspension bridge formed of living plant roots by tree shaping. They are common in the southern part of the Northeast Indian state of Meghalaya. They are handmade from the aerial roots of rubber fig trees (Ficus elastica) by the Khasi and Jaintia peoples of the mountainous terrain along the southern part of the Shillong Plateau.'
  },
];

export default function TravelDiaries() {
  const [activeTheme, setActiveTheme] = useState('All');
  const [selectedStory, setSelectedStory] = useState<DetailsModalData | null>(null);

  const filteredStories = activeTheme === 'All' 
    ? stories 
    : stories.filter(story => story.theme === activeTheme);

  return (
    <section id="diaries" className="min-h-screen py-24 bg-mandala-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Travel Stories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            User-inspired narratives and curated experiences for every passion.
          </motion.p>
        </div>

        {/* Theme Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTheme === theme
                  ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Animated Card Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                key={story.id}
                onClick={() => setSelectedStory({
                  title: story.title,
                  image: story.image,
                  description: story.desc,
                  longDescription: story.longDescription,
                  theme: story.theme,
                  author: story.author,
                  date: story.date
                })}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 flex items-center gap-1 shadow-sm">
                    {story.icon}
                    {story.theme}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif group-hover:text-orange-600 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 flex-grow">
                    {story.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                        {story.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{story.author}</span>
                    </div>
                    <span className="text-xs text-gray-500">{story.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredStories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No stories found for this theme yet.</p>
          </div>
        )}
      </div>
      <DetailsModal 
        isOpen={!!selectedStory} 
        onClose={() => setSelectedStory(null)} 
        data={selectedStory} 
      />
    </section>
  );
}
