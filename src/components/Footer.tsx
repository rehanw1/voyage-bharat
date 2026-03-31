import { Globe, Facebook, Twitter, Instagram, Youtube, Send, Smartphone } from 'lucide-react';

const statesAndUTs = [
  'Andaman & Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function Footer() {
  return (
    <footer className="bg-stone-950 bg-dark-pattern text-white pt-20 pb-10 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Newsletter & CTA */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 pb-12 border-b border-stone-800">
          <div className="max-w-xl">
            <h3 className="text-3xl font-serif font-bold mb-4">Subscribe to our Newsletter</h3>
            <p className="text-stone-400 mb-6">Get the latest travel updates, exclusive offers, and inspiration delivered straight to your inbox.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                Subscribe <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-6">
            <button className="bg-white text-stone-900 hover:bg-orange-50 px-8 py-4 rounded-full text-lg font-bold transition-colors shadow-lg shadow-white/10">
              Plan Your Voyage
            </button>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 px-4 py-2 rounded-lg transition-colors">
                <Smartphone className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] text-stone-400 leading-none">Download on the</div>
                  <div className="text-sm font-semibold leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 px-4 py-2 rounded-lg transition-colors">
                <Smartphone className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] text-stone-400 leading-none">GET IT ON</div>
                  <div className="text-sm font-semibold leading-tight">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Social */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold tracking-tighter text-white">
                VOYAGE BHARAT
              </span>
            </div>
            <p className="text-stone-400 mb-8 leading-relaxed">
              Discover the soul of India through its vibrant culture, majestic heritage, and breathtaking landscapes. Your journey begins here.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors text-stone-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors text-stone-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors text-stone-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors text-stone-400">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6 uppercase tracking-wider text-stone-200">Quick Links</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li><a href="#destinations" className="hover:text-orange-500 transition-colors">Destinations</a></li>
              <li><a href="#attractions" className="hover:text-orange-500 transition-colors">Attractions</a></li>
              <li><a href="#travel-diaries" className="hover:text-orange-500 transition-colors">Travel Diaries</a></li>
              <li><a href="#itineraries" className="hover:text-orange-500 transition-colors">Itineraries</a></li>
              <li><a href="#hidden-gems" className="hover:text-orange-500 transition-colors">Hidden Gems</a></li>
              <li><a href="#artisan-traditions" className="hover:text-orange-500 transition-colors">Artisan Traditions</a></li>
              <li><a href="#festivals" className="hover:text-orange-500 transition-colors">Festivals</a></li>
              <li><a href="#booking" className="hover:text-orange-500 transition-colors">Bookings</a></li>
            </ul>
          </div>

          {/* States & UTs Grid */}
          <div className="lg:col-span-6">
            <h4 className="text-lg font-bold mb-6 uppercase tracking-wider text-stone-200">Explore States & UTs</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs text-stone-400">
              {statesAndUTs.map((state) => (
                <a key={state} href="#" className="hover:text-orange-500 transition-colors truncate">
                  {state}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center text-stone-500 text-xs border-t border-stone-800 pt-8">
          <p>&copy; {new Date().getFullYear()} Voyage Bharat. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Accessibility</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
