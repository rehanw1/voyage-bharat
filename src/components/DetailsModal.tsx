import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, Tag, Clock } from 'lucide-react';

export interface DetailsModalData {
  title: string;
  image: string;
  description: string;
  longDescription?: string;
  location?: string;
  theme?: string;
  budget?: string;
  date?: string;
  duration?: string;
  author?: string;
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailsModalData | null;
}

export default function DetailsModal({ isOpen, onClose, data }: DetailsModalProps) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={data.image} 
                alt={data.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
              <h2 className="absolute bottom-4 left-4 text-3xl font-serif font-bold text-white md:hidden">
                {data.title}
              </h2>
            </div>

            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              <h2 className="hidden md:block text-4xl font-serif font-bold text-gray-900 mb-6">
                {data.title}
              </h2>

              <div className="flex flex-wrap gap-4 mb-8">
                {data.location && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    {data.location}
                  </div>
                )}
                {data.theme && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Tag className="w-4 h-4 text-orange-600" />
                    {data.theme}
                  </div>
                )}
                {data.date && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    {data.date}
                  </div>
                )}
                {data.duration && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 text-orange-600" />
                    {data.duration}
                  </div>
                )}
              </div>

              <div className="prose prose-orange max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {data.description}
                </p>
                {data.longDescription ? (
                  <div className="text-gray-600 leading-relaxed mt-4 whitespace-pre-line">
                    {data.longDescription}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 leading-relaxed mt-4">
                      Experience the vibrant culture, rich history, and breathtaking landscapes that make this destination truly unique. Whether you're seeking adventure, spiritual awakening, or simply a peaceful retreat, you'll find an unforgettable journey waiting for you here.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                      Plan your visit today and immerse yourself in the local traditions, savor the authentic cuisine, and create memories that will last a lifetime.
                    </p>
                  </>
                )}
              </div>

              {data.author && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    {data.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Written by</p>
                    <p className="font-semibold text-gray-900">{data.author}</p>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <button className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg">
                  Plan Your Trip
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
