import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, ArrowRight } from 'lucide-react';
import { useMap } from '../context/MapContext';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop',
    title: 'Timeless Journeys',
    subtitle: 'Discover the soul of India through its majestic heritage.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2070&auto=format&fit=crop',
    title: 'Serene Landscapes',
    subtitle: 'Find peace in the tranquil backwaters and lush hills.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1510006851064-e6056cd0e3a8?q=80&w=2070&auto=format&fit=crop',
    title: 'Vibrant Celebrations',
    subtitle: 'Immerse yourself in the colors and joy of local festivals.',
  },
];

const teasers = [
  { title: 'Heritage', desc: 'Ancient forts & palaces', img: '/images/heritage.png' },
  { title: 'Nature', desc: 'Wildlife & serene lakes', img: '/images/nature.png' },
  { title: 'Festivals', desc: 'Colors & traditions', img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop' },
  { title: 'Adventure', desc: 'Himalayan treks', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2070&auto=format&fit=crop' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { openMapModal } = useMap();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex flex-col justify-center overflow-hidden bg-black">
      {/* Background Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & CTAs */}
          <div className="lg:col-span-7 text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-orange-400 font-medium tracking-widest uppercase mb-4"
            >
              Embark on Voyage Bharat
            </motion.p>
            
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-xl text-white/80 mb-10 font-light max-w-2xl"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#destinations"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all hover:shadow-lg hover:shadow-orange-600/30 group"
              >
                Explore Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={openMapModal}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-medium transition-all border border-white/20"
              >
                <MapPin className="w-5 h-5" />
                Open Interactive Map
              </button>
            </motion.div>
          </div>

          {/* Right: Teaser Cards */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {teasers.map((teaser, index) => (
                <motion.div
                  key={teaser.title}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + (index * 0.1) }}
                  className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img 
                    src={teaser.img} 
                    alt={teaser.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-lg">{teaser.title}</h3>
                    <p className="text-white/70 text-xs">{teaser.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              currentSlide === index ? 'w-12 bg-orange-500' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 right-10 z-20 animate-bounce hidden md:block"
      >
        <a href="#destinations" className="text-white/70 hover:text-white transition-colors flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest rotate-90 mb-6">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </a>
      </motion.div>
    </section>
  );
}

