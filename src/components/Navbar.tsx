import { useState, useEffect } from 'react';
import { Menu, X, Globe, User, MapPin, Search, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMap } from '../context/MapContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import BookingsModal from './BookingsModal';
import AdminDashboard from './AdminDashboard';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { openMapModal } = useMap();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const openAuth = () => {
      setAuthInitialMode('signin');
      setIsAuthModalOpen(true);
    };
    const needVerify = () => {
      setAuthInitialMode('verify');
      setIsAuthModalOpen(true);
    };
    window.addEventListener('vb:open-auth', openAuth);
    window.addEventListener('vb:need-verify', needVerify);
    return () => {
      window.removeEventListener('vb:open-auth', openAuth);
      window.removeEventListener('vb:need-verify', needVerify);
    };
  }, []);

  useEffect(() => {
    const syncAdmin = () => setAdminOpen(window.location.hash === '#admin');
    syncAdmin();
    window.addEventListener('hashchange', syncAdmin);
    return () => window.removeEventListener('hashchange', syncAdmin);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#admin' && user && user.role !== 'admin') {
      window.location.hash = '';
      setAdminOpen(false);
    }
  }, [user]);

  const navLinks = [
    { 
      name: 'Destinations', 
      id: 'destinations',
      dropdown: ['Delhi', 'Goa', 'Leh', 'Kerala', 'Rajasthan']
    },
    { name: 'Attractions', id: 'attractions' },
    { 
      name: 'Travel Stories', 
      id: 'travel-diaries',
      dropdown: ['Wildlife', 'Heritage', 'Adventure', 'Spiritual']
    },
    { 
      name: 'Journey Plans', 
      id: 'itineraries',
      dropdown: ['Short Trips', 'Long Journeys', 'Family', 'Solo']
    },
    { name: 'Hidden Gems', id: 'hidden-gems' },
    { name: 'Artisan Traditions', id: 'artisan-traditions' },
    { name: 'Festivals', id: 'festivals' },
    { name: 'Bookings', id: 'booking' },
  ];

  return (
    <header className="fixed w-full z-50 transition-all duration-300">
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0 xl:flex-1">
              <Globe className={`w-6 h-6 ${isScrolled ? 'text-orange-600' : 'text-white'}`} />
              <span
                className={`text-xl font-serif font-bold tracking-tighter ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                Voyage Bharat
              </span>
            </div>

            {/* Desktop Center: Nav Links */}
            <div className="hidden xl:flex items-center justify-center px-8">
              {/* Nav Links */}
              <div className="flex items-center space-x-4 2xl:space-x-6">
                {navLinks.map((link) => (
                  <div 
                    key={link.id}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(link.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <a
                      href={`#${link.id}`}
                      className={`flex items-center gap-1 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider transition-colors hover:text-orange-500 ${
                        isScrolled ? 'text-gray-700' : 'text-white/90'
                      }`}
                    >
                      {link.name}
                      {link.dropdown && <ChevronDown className="w-3 h-3" />}
                    </a>
                    
                    {/* Simple Dropdown Example */}
                    <AnimatePresence>
                      {activeDropdown === link.id && link.dropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                        >
                          {link.dropdown.map((item) => (
                            <a key={item} href={`#${link.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                              {item}
                            </a>
                          ))}
                          <div className="border-t border-gray-100 my-1"></div>
                          <a href={`#${link.id}`} className="block px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                            View All
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Right: Search, Map Toggle & User */}
            <div className="hidden lg:flex items-center justify-end gap-4 xl:gap-6 flex-shrink-0 xl:flex-1">
              {/* Search Bar */}
              <div className="relative w-48 xl:w-64 group hidden xl:block">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isScrolled ? 'text-gray-400' : 'text-white/70'}`} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`w-full pl-9 pr-4 py-1.5 rounded-full text-sm transition-all outline-none focus:ring-2 focus:ring-orange-500 ${
                    isScrolled 
                      ? 'bg-gray-100 text-gray-900 border-transparent focus:bg-white' 
                      : 'bg-white/20 text-white placeholder-white/70 border border-white/30 focus:bg-white/30'
                  }`}
                />
              </div>

              <button 
                onClick={openMapModal}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="hidden xl:inline">Map View</span>
              </button>
              
              <div className="flex items-center gap-3 relative group cursor-pointer">
                {user ? (
                  <>
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${isScrolled ? 'bg-gray-100' : 'bg-white/20'}`}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className={`w-4 h-4 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                      )}
                    </div>
                    <div className={`text-sm hidden xl:block ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                      <p className="text-xs opacity-70">Namaste,</p>
                      <p className="font-semibold truncate max-w-[100px]">{user.displayName?.split(' ')[0] || 'Traveler'}</p>
                    </div>

                    {/* User Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <button
                        type="button"
                        onClick={() => setIsBookingsOpen(true)}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        My Bookings
                      </button>
                      <a href="#booking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">New Booking</a>
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            window.location.hash = '#admin';
                            setAdminOpen(true);
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                          Admin
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthInitialMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      isScrolled 
                        ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md' 
                        : 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg'
                    }`}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center gap-4">
              <button onClick={openMapModal} className={`lg:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                <MapPin className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`${isScrolled ? 'text-gray-900' : 'text-white'}`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 top-[76px] bg-white z-40 xl:hidden overflow-y-auto"
            >
              <div className="flex flex-col p-6 space-y-6">
                <div className="relative w-full mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                
                {navLinks.map((link) => (
                  <div key={link.id} className="border-b border-gray-100 pb-4">
                    <a
                      href={`#${link.id}`}
                      onClick={() => !link.dropdown && setIsMobileMenuOpen(false)}
                      className="text-gray-900 font-serif font-bold text-2xl flex justify-between items-center"
                    >
                      {link.name}
                      {link.dropdown && <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </a>
                    {link.dropdown && (
                      <div className="mt-4 pl-4 space-y-3">
                        {link.dropdown.map((item) => (
                          <a 
                            key={item} 
                            href={`#${link.id}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-gray-600 font-medium"
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-8 pt-8 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Namaste,</p>
                          <p className="text-lg font-bold text-gray-900">{user.displayName}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setIsBookingsOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 text-gray-600 font-medium">My Bookings</button>
                      <a href="#booking" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-gray-600 font-medium">New Booking</a>
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            window.location.hash = '#admin';
                            setAdminOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block w-full text-left py-3 text-gray-600 font-medium"
                        >
                          Admin
                        </button>
                      )}
                      <button type="button" onClick={() => logout()} className="block w-full text-left py-3 text-red-600 font-medium mt-4">Logout</button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthInitialMode('signin');
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {user && !user.emailVerified && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-950 text-xs sm:text-sm text-center py-2 px-4">
          Verify your email to use bookings, payments, and favorites.{' '}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => {
              setAuthInitialMode('verify');
              setIsAuthModalOpen(true);
            }}
          >
            Verify now
          </button>
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
      />
      <BookingsModal isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
      {user?.role === 'admin' && adminOpen && (
        <AdminDashboard
          onClose={() => {
            window.location.hash = '';
            setAdminOpen(false);
          }}
        />
      )}
    </header>
  );
}

