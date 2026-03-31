import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, MapPin, Tag } from 'lucide-react';
import DetailsModal, { DetailsModalData } from './DetailsModal';

const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const states = ['All', 'Rajasthan', 'West Bengal', 'Maharashtra', 'Kerala', 'Uttar Pradesh'];
const themes = ['All', 'Religious', 'Cultural', 'Harvest', 'Arts'];

const festivals = [
  {
    id: 1,
    name: 'Diwali',
    desc: 'The Festival of Lights, celebrating the victory of light over darkness.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/The_Rangoli_of_Lights.jpg/960px-The_Rangoli_of_Lights.jpg',
    longDescription: 'Diwali, or Deepavali, is the Hindu festival of lights, with variations celebrated in other Indian religions. It symbolises the spiritual "victory of light over darkness, good over evil, and knowledge over ignorance". Diwali is celebrated during the Hindu lunisolar month Kartika (between mid-October and mid-November). The festival generally lasts five days.',
    month: 'Nov',
    state: 'Uttar Pradesh',
    theme: 'Religious',
  },
  {
    id: 2,
    name: 'Holi',
    desc: 'The Festival of Colors, welcoming spring with vibrant joy.',
    image: '/images/holi.png',
    longDescription: 'Holi is a popular and significant Hindu festival celebrated as the Festival of Colours, Love, and Spring. It celebrates the eternal and divine love of the god Radha and Krishna. The day also signifies the triumph of good over evil, as it celebrates the victory of Vishnu as Narasimha over Hiranyakashipu.',
    month: 'Mar',
    state: 'Uttar Pradesh',
    theme: 'Cultural',
  },
  {
    id: 3,
    name: 'Pushkar Fair',
    desc: 'A spectacular camel and livestock fair in the deserts of Rajasthan.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/%28A%29_Camel_Pushkar_fair.jpg/960px-%28A%29_Camel_Pushkar_fair.jpg',
    longDescription: 'The Pushkar Fair, also called the Pushkar Camel Fair or locally as Kartik Mela or Pushkar ka Mela is an annual multi-day livestock fair and cultural fete held in the town of Pushkar (Rajasthan, India). The fair starts with the Hindu calendar month of Kartik and ends on the Kartik Purnima, which typically overlaps with late October and early November in the Gregorian calendar.',
    month: 'Nov',
    state: 'Rajasthan',
    theme: 'Cultural',
  },
  {
    id: 4,
    name: 'Durga Puja',
    desc: 'Grand celebrations honoring Goddess Durga with elaborate pandals.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/%E0%A6%AC%E0%A6%BE%E0%A6%97%E0%A6%AC%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%B0_%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%9C%E0%A6%A8%E0%A7%80%E0%A6%A8_%E0%A6%A6%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%97%E0%A7%8B%E0%A7%8E%E0%A6%B8%E0%A6%AC_%E0%A7%A8%E0%A7%A6%E0%A7%A7%E0%A7%AE.jpg/960px-%E0%A6%AC%E0%A6%BE%E0%A6%97%E0%A6%AC%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%B0_%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%9C%E0%A6%A8%E0%A7%80%E0%A6%A8_%E0%A6%A6%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%97%E0%A7%8B%E0%A7%8E%E0%A6%B8%E0%A6%AC_%E0%A7%A8%E0%A7%A6%E0%A7%A7%E0%A7%AE.jpg',
    longDescription: 'Durga Puja, also known as Durgotsava or Sharodotsava, is an annual Hindu festival originating in the Indian subcontinent which reveres and pays homage to the Hindu goddess Durga and is also celebrated because of Durga\'s victory over Mahishasura. It is particularly popular and traditionally celebrated in the Indian states of West Bengal, Bihar, Assam, Tripura, Odisha, Jharkhand, Uttar Pradesh and the country of Bangladesh.',
    month: 'Oct',
    state: 'West Bengal',
    theme: 'Religious',
  },
  {
    id: 5,
    name: 'Onam',
    desc: 'A harvest festival celebrated with boat races and floral carpets.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Onapookkalam.jpg/960px-Onapookkalam.jpg',
    longDescription: 'Onam is an annual Indian harvest festival celebrated predominantly by the Hindus of Kerala. A major annual event for Keralites, it is the official festival of the state and includes a spectrum of cultural events. Drawing from Hindu mythology, Onam commemorates King Mahabali and Vamana.',
    month: 'Aug',
    state: 'Kerala',
    theme: 'Harvest',
  },
  {
    id: 6,
    name: 'Ganesh Chaturthi',
    desc: 'A spectacular 10-day festival celebrating Lord Ganesha.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Khairathabad_Vinayakudu_2021.jpg/960px-Khairathabad_Vinayakudu_2021.jpg',
    longDescription: 'Ganesh Chaturthi, also known as Vinayaka Chaturthi, is a Hindu festival celebrating the arrival of Lord Ganesh to earth from Kailash Parvat with his mother Goddess Parvati/Gauri. The festival is marked with the installation of Ganesh clay idols privately in homes and publicly on elaborate pandals (temporary stages).',
    month: 'Sep',
    state: 'Maharashtra',
    theme: 'Religious',
  },
];

export default function Festivals() {
  const [activeMonthTab, setActiveMonthTab] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [filterTheme, setFilterTheme] = useState('All');
  const [selectedFestival, setSelectedFestival] = useState<DetailsModalData | null>(null);

  // Sync tab and dropdown for month
  const handleMonthTabClick = (month: string) => {
    setActiveMonthTab(month);
    setFilterMonth(month);
  };

  const handleMonthDropdownChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterMonth(val);
    setActiveMonthTab(val);
  };

  const filteredFestivals = festivals.filter(fest => {
    const matchMonth = filterMonth === 'All' || fest.month === filterMonth;
    const matchState = filterState === 'All' || fest.state === filterState;
    const matchTheme = filterTheme === 'All' || fest.theme === filterTheme;
    return matchMonth && matchState && matchTheme;
  });

  return (
    <section id="festivals" className="min-h-screen py-24 bg-mandala-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-orange-600 mb-4"
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-lg font-semibold uppercase tracking-widest">Every day a celebration</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif font-bold text-gray-900"
            >
              Festivals of India
            </motion.h2>
          </div>
        </div>

        {/* Month Strip Tabs */}
        <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {months.map(month => (
              <button
                key={month}
                onClick={() => handleMonthTabClick(month)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeMonthTab === month
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Dropdown Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 mb-12 flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="w-full md:w-auto flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <select 
              value={filterMonth}
              onChange={handleMonthDropdownChange}
              className="flex-1 md:w-40 bg-orange-50 border border-orange-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <select 
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="flex-1 md:w-40 bg-orange-50 border border-orange-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-600" />
            <select 
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="flex-1 md:w-40 bg-orange-50 border border-orange-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {themes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={() => {
              setActiveMonthTab('All');
              setFilterMonth('All');
              setFilterState('All');
              setFilterTheme('All');
            }}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredFestivals.map((fest, index) => (
              <motion.div
                layout
                key={fest.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onClick={() => setSelectedFestival({
                  title: fest.name,
                  image: fest.image,
                  description: fest.desc,
                  longDescription: fest.longDescription,
                  location: fest.state,
                  date: fest.month,
                  theme: fest.theme
                })}
                className="group relative rounded-2xl overflow-hidden shadow-lg h-[450px] border border-orange-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={fest.image}
                  alt={fest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-700 shadow-sm">
                  {fest.theme}
                </div>

                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex gap-2 mb-3">
                    <div className="inline-block bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {fest.month}
                    </div>
                    <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30">
                      {fest.state}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-serif">{fest.name}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {fest.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredFestivals.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No festivals found matching your criteria.</p>
          </div>
        )}
      </div>
      <DetailsModal 
        isOpen={!!selectedFestival} 
        onClose={() => setSelectedFestival(null)} 
        data={selectedFestival} 
      />
    </section>
  );
}
