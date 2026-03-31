import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Train, Bus, Car, Hotel, Users, Search, MapPin, Calendar, User, Clock, BadgeIndianRupee, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import PaymentModal, { type PaymentItem } from './PaymentModal';

const tabs = [
  { id: 'flights', label: 'Flights', icon: <Plane className="w-5 h-5" /> },
  { id: 'trains', label: 'Trains', icon: <Train className="w-5 h-5" /> },
  { id: 'buses', label: 'Buses', icon: <Bus className="w-5 h-5" /> },
  { id: 'cabs', label: 'Cabs', icon: <Car className="w-5 h-5" /> },
  { id: 'accommodations', label: 'Accommodations', icon: <Hotel className="w-5 h-5" /> },
  { id: 'partners', label: 'Travel Partners', icon: <Users className="w-5 h-5" /> },
];

const fareTypes = [
  'Regular Fares',
  'Armed Forces Fares',
  'Student Fares',
  'Senior Citizen Fares',
  'Doctors & Nurses Fares',
];

type SamplePlan = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tabId: (typeof tabs)[number]['id'];
  tripType: 'one-way' | 'round-trip';
  from: string;
  to: string;
  departOffsetDays: number;
  returnOffsetDays?: number;
  travelersText: string;
  fareType?: (typeof fareTypes)[number];
  directOnly?: boolean;
};

function toDateInputValue(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

type ResultBase = {
  id: string;
  title: string;
  subtitle: string;
  priceInr: number;
  badge?: string;
  note?: string;
};

type TransportResult = ResultBase & {
  kind: 'transport';
  modeLabel: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops?: string;
};

type HotelResult = ResultBase & {
  kind: 'hotel';
  nights: number;
  rating: number;
  area: string;
};

type PartnerResult = ResultBase & {
  kind: 'partner';
  match: string;
  languages: string;
  vibe: string;
};

type SearchResult = TransportResult | HotelResult | PartnerResult;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseTravelerCount(text: string) {
  const match = text.match(/(\d+)/);
  return match ? clamp(parseInt(match[1], 10), 1, 9) : 1;
}

function formatInr(n: number) {
  return n.toLocaleString('en-IN');
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

export default function Booking() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('one-way');
  const [fareType, setFareType] = useState('Regular Fares');
  const [directFlight, setDirectFlight] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelersText, setTravelersText] = useState('1 Traveler, Economy');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searchMeta, setSearchMeta] = useState<{ query: string; updatedAt: number } | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<PaymentItem | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<PaymentItem | null>(null);

  const samplePlans: SamplePlan[] = useMemo(() => ([
    {
      id: 'golden-triangle-week',
      title: 'Golden Triangle Week',
      subtitle: 'Delhi → Agra → Jaipur (heritage essentials)',
      image: '/images/heritage.png',
      tabId: 'trains',
      tripType: 'round-trip',
      from: 'New Delhi',
      to: 'Jaipur',
      departOffsetDays: 7,
      returnOffsetDays: 14,
      travelersText: '2 Travelers, Sleeper',
      fareType: 'Regular Fares',
    },
    {
      id: 'andaman-beach-break',
      title: 'Andaman Beach Break',
      subtitle: 'Chill beaches + snorkeling (quick luxury)',
      image: '/images/andaman.png',
      tabId: 'flights',
      tripType: 'round-trip',
      from: 'Kolkata',
      to: 'Port Blair',
      departOffsetDays: 10,
      returnOffsetDays: 15,
      travelersText: '2 Travelers, Economy',
      fareType: 'Student Fares',
      directOnly: true,
    },
    {
      id: 'holi-in-vrindavan',
      title: 'Holi in Vrindavan',
      subtitle: 'Colorful celebration + temples',
      image: '/images/holi.png',
      tabId: 'buses',
      tripType: 'round-trip',
      from: 'Delhi',
      to: 'Mathura / Vrindavan',
      departOffsetDays: 20,
      returnOffsetDays: 22,
      travelersText: '4 Travelers, Standard',
      fareType: 'Senior Citizen Fares',
    },
    {
      id: 'himalayan-escape',
      title: 'Himalayan Escape',
      subtitle: 'Shimla → Manali → Dharamshala (adventure)',
      image: '/images/himalayan-escape.png',
      tabId: 'cabs',
      tripType: 'round-trip',
      from: 'Chandigarh',
      to: 'Manali',
      departOffsetDays: 12,
      returnOffsetDays: 22,
      travelersText: '3 Travelers, SUV',
      fareType: 'Regular Fares',
    },
    {
      id: 'crafts-in-lucknow',
      title: 'Crafts in Lucknow',
      subtitle: 'Chikankari lanes + local food walks',
      image: '/images/chikankari-embroidery.png',
      tabId: 'trains',
      tripType: 'round-trip',
      from: 'Varanasi',
      to: 'Lucknow',
      departOffsetDays: 9,
      returnOffsetDays: 12,
      travelersText: '1 Traveler, Chair Car',
      fareType: 'Regular Fares',
    },
    {
      id: 'jaipur-blue-pottery',
      title: 'Jaipur Craft Trail',
      subtitle: 'Blue pottery workshops + bazaars',
      image: '/images/blue-pottery.png',
      tabId: 'accommodations',
      tripType: 'round-trip',
      from: 'Jaipur',
      to: 'Jaipur',
      departOffsetDays: 5,
      returnOffsetDays: 7,
      travelersText: '2 Travelers, Boutique Stay',
      fareType: 'Doctors & Nurses Fares',
    },
  ]), []);

  const applySamplePlan = (plan: SamplePlan) => {
    setActiveTab(plan.tabId);
    setTripType(plan.tripType);
    setDirectFlight(!!plan.directOnly);
    if (plan.fareType) setFareType(plan.fareType);
    setFrom(plan.from);
    setTo(plan.to);
    setTravelersText(plan.travelersText);

    const base = new Date();
    const depart = new Date(base);
    depart.setDate(depart.getDate() + plan.departOffsetDays);
    setDepartDate(toDateInputValue(depart));

    if (plan.tripType === 'round-trip' && plan.returnOffsetDays != null) {
      const ret = new Date(base);
      ret.setDate(ret.getDate() + plan.returnOffsetDays);
      setReturnDate(toDateInputValue(ret));
    } else {
      setReturnDate('');
    }

    setResults(null);
    setSearchMeta(null);
  };

  const generateResults = (): SearchResult[] => {
    const seedBase =
      (from.trim() + '|' + to.trim() + '|' + departDate.trim() + '|' + activeTab + '|' + tripType + '|' + fareType + '|' + String(directFlight))
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    const travellers = parseTravelerCount(travelersText);
    const baseMultiplier = activeTab === 'flights' ? 3.2 : activeTab === 'trains' ? 1.2 : activeTab === 'buses' ? 1.0 : activeTab === 'cabs' ? 2.4 : 1.8;
    const fareDiscount =
      fareType === 'Student Fares' ? 0.9 :
      fareType === 'Senior Citizen Fares' ? 0.88 :
      fareType === 'Armed Forces Fares' ? 0.85 :
      fareType === 'Doctors & Nurses Fares' ? 0.92 :
      1;

    if (activeTab === 'accommodations') {
      const nights = tripType === 'round-trip' && departDate && returnDate
        ? clamp(Math.ceil((new Date(returnDate).getTime() - new Date(departDate).getTime()) / (1000 * 60 * 60 * 24)), 1, 21)
        : 3;

      const areas = ['City Center', 'Near Station', 'Lake View', 'Old Town', 'Market Area', 'Hillside'];
      const brands = ['Heritage Haveli', 'Boutique Stay', 'Comfort Suites', 'Grand Residency', 'Eco Retreat', 'Skyline Inn'];

      return Array.from({ length: 6 }).map((_, i) => {
        const rating = clamp(3.6 + ((seedBase + i * 7) % 18) / 10, 3.6, 4.9);
        const base = Math.round((2200 + ((seedBase + i * 97) % 5200)) * nights * travellers * fareDiscount);
        return {
          kind: 'hotel',
          id: `hotel-${seedBase}-${i}`,
          title: `${pick(brands, seedBase + i)} • ${to || 'Destination'}`,
          subtitle: `${nights} nights • Free cancellation (limited)`,
          area: pick(areas, seedBase + i * 3),
          nights,
          rating,
          priceInr: base,
          badge: i === 0 ? 'Best value' : i === 1 ? 'Top rated' : undefined,
          note: i === 2 ? 'Includes breakfast for 2' : undefined,
        };
      });
    }

    if (activeTab === 'partners') {
      const names = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Ishaan', 'Anaya', 'Rohan', 'Sara'];
      const vibes = ['Food & culture', 'Photography', 'Chill explorer', 'Budget backpacker', 'Luxury comfort', 'Temple trail', 'Adventure trek'];
      const langs = ['Hindi • English', 'English • Marathi', 'Hindi • Bengali', 'Hindi • Tamil', 'English • Kannada', 'Hindi • Punjabi'];
      const matches = ['92% match', '88% match', '85% match', '90% match', '86% match', '91% match'];

      return Array.from({ length: 6 }).map((_, i) => {
        const price = 0; // partners are “free”; show as ₹0 with note
        return {
          kind: 'partner',
          id: `partner-${seedBase}-${i}`,
          title: `${pick(names, seedBase + i)} • ${pick(matches, seedBase + i * 2)}`,
          subtitle: `${pick(vibes, seedBase + i * 5)} • ${pick(langs, seedBase + i * 11)}`,
          match: pick(matches, seedBase + i * 2),
          languages: pick(langs, seedBase + i * 11),
          vibe: pick(vibes, seedBase + i * 5),
          priceInr: price,
          badge: i === 0 ? 'Recommended' : undefined,
          note: 'Message to connect',
        };
      });
    }

    // transport (flights/trains/buses/cabs)
    const operatorsByTab: Record<string, string[]> = {
      flights: ['IndiGo', 'Air India', 'Akasa Air', 'Vistara', 'SpiceJet', 'Go First'],
      trains: ['Vande Bharat', 'Rajdhani', 'Shatabdi', 'Intercity Express', 'Duronto', 'Jan Shatabdi'],
      buses: ['Volvo AC', 'Sleeper Coach', 'Semi-Sleeper', 'Deluxe', 'AC Seater', 'Luxury Coach'],
      cabs: ['Sedan', 'SUV', 'Innova', 'Tempo Traveller', 'Hatchback', 'Premium Sedan'],
    };
    const operator = operatorsByTab[activeTab] ?? ['Option'];
    const durations = activeTab === 'flights'
      ? ['1h 25m', '2h 10m', '2h 55m', '3h 30m', '4h 05m', '4h 40m']
      : activeTab === 'trains'
        ? ['4h 35m', '5h 10m', '6h 05m', '7h 20m', '8h 15m', '9h 00m']
        : activeTab === 'buses'
          ? ['3h 40m', '5h 05m', '6h 30m', '7h 45m', '9h 10m', '10h 20m']
          : ['5h', '6h', '7h', '8h', '9h', '10h'];

    const timePairs = [
      ['06:10', '08:20'],
      ['08:45', '11:15'],
      ['12:05', '15:10'],
      ['15:40', '19:20'],
      ['18:30', '22:15'],
      ['21:10', '01:05'],
    ];

    return Array.from({ length: 6 }).map((_, i) => {
      const op = pick(operator, seedBase + i * 13);
      const dur = pick(durations, seedBase + i * 17);
      const [dep, arr] = pick(timePairs, seedBase + i * 19);
      const stops =
        activeTab === 'flights'
          ? (directFlight ? 'Non-stop' : pick(['Non-stop', '1 stop'], seedBase + i * 23))
          : activeTab === 'trains'
            ? pick(['Limited stops', 'Few stops', 'Express'], seedBase + i * 29)
            : undefined;

      const basePrice =
        activeTab === 'flights'
          ? 3200 + ((seedBase + i * 211) % 5200)
          : activeTab === 'trains'
            ? 450 + ((seedBase + i * 97) % 1400)
            : activeTab === 'buses'
              ? 380 + ((seedBase + i * 83) % 1800)
              : 1600 + ((seedBase + i * 131) % 4200);

      const price = Math.round(basePrice * travellers * baseMultiplier * fareDiscount * (directFlight && activeTab === 'flights' ? 1.08 : 1));

      return {
        kind: 'transport',
        id: `transport-${seedBase}-${i}`,
        title: `${op}`,
        subtitle: `${from || 'Origin'} → ${to || 'Destination'}`,
        modeLabel: tabs.find(t => t.id === activeTab)?.label ?? 'Transport',
        departTime: dep,
        arriveTime: arr,
        duration: dur,
        stops,
        priceInr: price,
        badge: i === 0 ? 'Cheapest' : i === 1 ? 'Fastest' : i === 2 ? 'Best overall' : undefined,
        note: activeTab === 'cabs' ? 'Includes tolls' : undefined,
      };
    });
  };

  const onSearch = () => {
    const query = `${tabs.find(t => t.id === activeTab)?.label ?? 'Search'} • ${from || 'Origin'} → ${to || 'Destination'} • ${departDate || 'Date'}`;
    setResults(generateResults());
    setSearchMeta({ query, updatedAt: Date.now() });
  };

  const startCheckout = (item: PaymentItem) => {
    if (!user) {
      setPendingCheckout(item);
      setIsAuthOpen(true);
      return;
    }
    setCheckoutItem(item);
  };

  return (
    <section id="booking" className="py-24 bg-indian-pattern min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
          >
            Inspired? Get started
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Plan your perfect journey across Voyage Bharat.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-5 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div className="p-8">
            {/* Quick-start plans */}
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick-start plans</h3>
                  <p className="text-sm text-gray-600">Select a plan to auto-fill routes and dates, then search.</p>
                </div>
                <div className="text-xs text-gray-500">
                  Tip: change tabs after applying a plan to explore more.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => applySamplePlan(plan)}
                    className="text-left group bg-gray-50 hover:bg-white border border-gray-200 hover:border-orange-300 rounded-2xl overflow-hidden transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="h-32 overflow-hidden relative">
                      <img
                        src={plan.image}
                        alt={plan.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                          {tabs.find(t => t.id === plan.tabId)?.label ?? 'Plan'}
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {plan.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                            {plan.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {plan.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {plan.from} → {plan.to} • {plan.travelersText}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Type */}
            <div className="flex items-center gap-6 mb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  checked={tripType === 'one-way'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">One Way</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={tripType === 'round-trip'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">Round Trip</span>
              </label>
            </div>

            {/* Main Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Origin"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Destination"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Depart</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-700"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    disabled={tripType === 'one-way'}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Travelers & Class</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value={travelersText}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-700 cursor-pointer bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Fare Types & Checkbox */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select A Fare Type:</label>
                <div className="flex flex-wrap gap-3">
                  {fareTypes.map((fare) => (
                    <label
                      key={fare}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                        fareType === fare
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fareType"
                        value={fare}
                        checked={fareType === fare}
                        onChange={(e) => setFareType(e.target.value)}
                        className="hidden"
                      />
                      {fare}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="directFlight"
                  checked={directFlight}
                  onChange={(e) => setDirectFlight(e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="directFlight" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Direct flight only
                </label>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={onSearch}
                className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 rounded-full text-xl font-bold transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-3 transform hover:-translate-y-1"
              >
                <Search className="w-6 h-6" />
                Search
              </button>
            </div>

            {/* Results */}
            {results && (
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Results</h3>
                    <p className="text-sm text-gray-600">
                      {searchMeta?.query ?? 'Your search'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Results • Updated just now
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-base font-bold text-gray-900 truncate">{r.title}</div>
                              {r.badge && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                                  {r.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{r.subtitle}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1 text-gray-900 font-extrabold text-lg">
                              <BadgeIndianRupee className="w-4 h-4 text-orange-600" />
                              {formatInr(r.priceInr)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.kind === 'hotel' ? 'total' : r.kind === 'partner' ? 'free' : 'approx.'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                          {r.kind === 'transport' && (
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold">{r.departTime}</span>
                                <span className="text-gray-500">→</span>
                                <span className="font-semibold">{r.arriveTime}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{r.duration}</span>
                                {r.stops && <span className="text-gray-500"> • {r.stops}</span>}
                              </div>
                            </div>
                          )}

                          {r.kind === 'hotel' && (
                            <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold">{r.rating.toFixed(1)}</span>
                                <span className="text-gray-500">• {r.area}</span>
                              </div>
                              <div className="text-gray-500">{r.nights} nights</div>
                            </div>
                          )}

                          {r.kind === 'partner' && (
                            <div className="text-sm text-gray-700">
                              <div className="font-semibold">{r.match}</div>
                              <div className="text-gray-500 mt-1">{r.vibe} • {r.languages}</div>
                            </div>
                          )}
                        </div>

                        {r.note && (
                          <div className="mt-3 text-xs text-gray-500">
                            {r.note}
                          </div>
                        )}

                        <div className="mt-5 flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (r.kind === 'partner') {
                                alert('Messaging is not available for travel partners yet.');
                                return;
                              }
                              startCheckout({
                                id: r.id,
                                title: r.title,
                                subtitle: r.subtitle,
                                amountInr: r.priceInr,
                              });
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold transition-colors"
                          >
                            {r.kind === 'partner' ? 'Message' : 'Book'}
                          </button>
                          <button
                            type="button"
                            onClick={() => alert('Full details view will open here.')}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-500 text-center leading-relaxed">
              The information related to booking is provided through API integration from various Online Travel Aggregators (OTA). Other OTAs interested in integration with Voyage Bharat Digital Portal may contact the Ministry of Tourism.
            </div>
          </div>
        </motion.div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (pendingCheckout) {
            setCheckoutItem(pendingCheckout);
            setPendingCheckout(null);
          }
        }}
        initialMode="signin"
      />
      <PaymentModal
        isOpen={!!checkoutItem}
        onClose={() => setCheckoutItem(null)}
        item={checkoutItem}
      />
    </section>
  );
}
