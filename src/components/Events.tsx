import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, MapPin, Heart, ArrowRight } from 'lucide-react';
import DetailsModal, { DetailsModalData } from './DetailsModal';

const eventCategories = [
  {
    id: 'month',
    title: 'By Month',
    icon: <CalendarDays className="w-6 h-6" />,
    desc: 'Plan your trip around the best time to visit.',
    image: 'https://images.unsplash.com/photo-1515091943-9d5c0ad475af?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'state',
    title: 'By States & UTs',
    icon: <MapPin className="w-6 h-6" />,
    desc: 'Discover local events and regional celebrations.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop',
  },
  {
    id: 'interest',
    title: 'By Interests',
    icon: <Heart className="w-6 h-6" />,
    desc: 'Find events that match your passion and hobbies.',
    image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1974&auto=format&fit=crop',
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Kumbh Mela',
    date: 'Jan 14 - Feb 26, 2025',
    location: 'Prayagraj, Uttar Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Third_Shahi_Snan_in_Hari_Ki_Pauri.jpg',
    desc: 'The largest peaceful gathering in the world, where millions of pilgrims bathe in the sacred rivers.',
    longDescription: 'The Kumbh Mela is a major Hindu festival and pilgrimage. It is celebrated in a cycle of approximately 12 years at four river-bank pilgrimage sites: Prayagraj (Ganges-Yamuna Sarasvati rivers confluence), Haridwar (Ganges), Nashik (Godavari), and Ujjain (Shipra). The festival is marked by a ritual dip in the waters, but it is also a celebration of community commerce with numerous fairs, education, religious discourses by saints, mass feedings of monks or the poor, and entertainment spectacle.'
  },
  {
    id: 2,
    title: 'Hornbill Festival',
    date: 'Dec 1 - 10, 2024',
    location: 'Kohima, Nagaland',
    image: '/images/hornbill-festival.png',
    desc: 'A vibrant celebration of the rich cultural heritage and traditions of the Naga tribes.',
    longDescription: 'The Hornbill Festival is an annual festival celebrated from 1 to 10 of December in the Northeastern Indian state of Nagaland. The festival represents all the ethnic groups of Nagaland for which it is also called the Festival of Festivals. It is organized by the State Tourism and Art & Culture Departments and also supported by the Union Government. The festival is named after the Indian hornbill, the large and colourful forest bird which is displayed in the folklore of most of the state\'s ethnic groups.'
  },
  {
    id: 3,
    title: 'Goa Carnival',
    date: 'Feb 10 - 13, 2024',
    location: 'Panaji, Goa',
    image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Goa_Carnaval.jpg',
    desc: 'A colorful and lively festival featuring parades, music, dance, and delicious food.',
    longDescription: 'The Goa Carnival is a festival that celebrates the culture and cuisine of Goa, India on a grand scale every year. The festival is a legacy of the Portuguese colonial rule in Goa, and is celebrated for four days before the month of Lent. It is characterized by vibrant parades, colorful floats, music, dance, and feasting. The festival is a major tourist attraction and draws visitors from all over the world.'
  },
  {
    id: 4,
    title: 'Rann Utsav',
    date: 'Nov 1 - Feb 28, 2024',
    location: 'Kutch, Gujarat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Rann_of_Kutch_-_White_Desert.jpg/960px-Rann_of_Kutch_-_White_Desert.jpg',
    desc: 'A cultural extravaganza set against the breathtaking backdrop of the white salt desert.',
    longDescription: 'Rann Utsav is a cultural festival celebrated in the Rann of Kutch, Gujarat, India. The festival is a celebration of the region\'s rich culture, art, and traditions. It is held during the winter months when the white salt desert is at its most beautiful. The festival features a variety of activities, including folk music and dance performances, camel safaris, and traditional crafts. It is a unique opportunity to experience the beauty and culture of the Rann of Kutch.'
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<DetailsModalData | null>(null);

  return (
    <section id="events" className="min-h-screen py-24 bg-dark-pattern text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Events
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Explore the vibrant tapestry of events happening across the country.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {eventCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="group relative rounded-3xl overflow-hidden h-[400px] cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center">
                <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 transform transition-transform group-hover:-translate-y-4 shadow-lg shadow-orange-600/30">
                  {category.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 transform transition-transform group-hover:-translate-y-4">
                  {category.title}
                </h3>
                <p className="text-gray-300 text-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:-translate-y-4 transition-all duration-300">
                  {category.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-16">
          <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-white mb-2">Upcoming Events</h3>
              <p className="text-gray-400">Don't miss out on these major upcoming celebrations.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium transition-colors">
              View Calendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => setSelectedEvent({
                  title: event.title,
                  image: event.image,
                  description: event.desc,
                  longDescription: event.longDescription,
                  location: event.location,
                  date: event.date
                })}
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-colors cursor-pointer group"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-400 border border-white/10">
                    {event.date}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{event.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="md:hidden w-full mt-8 py-3 rounded-xl border border-gray-700 text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            View Full Calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DetailsModal 
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        data={selectedEvent}
      />
    </section>
  );
}
