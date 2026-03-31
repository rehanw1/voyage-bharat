/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Attractions from './components/Attractions';
import TravelDiaries from './components/TravelDiaries';
import Itineraries from './components/Itineraries';
import HiddenGems from './components/HiddenGems';
import ArtisanTraditions from './components/ArtisanTraditions';
import Festivals from './components/Festivals';
import Booking from './components/Booking';
import Events from './components/Events';
import Footer from './components/Footer';
import MapModal from './components/MapModal';
import TravelChat from './components/TravelChat';
import { MapProvider } from './context/MapContext';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <MapProvider>
        <div className="font-sans antialiased text-gray-900 bg-white selection:bg-orange-200 selection:text-orange-900">
          <Navbar />
          <main>
            <Hero />
            <Destinations />
            <Attractions />
            <TravelDiaries />
            <Itineraries />
            <HiddenGems />
            <ArtisanTraditions />
            <Festivals />
            <Booking />
            <Events />
          </main>
          <Footer />
          <MapModal />
          <TravelChat />
        </div>
      </MapProvider>
    </AuthProvider>
  );
}
