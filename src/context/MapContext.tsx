import { createContext, useContext, useState, ReactNode } from 'react';

interface MapContextType {
  isMapModalOpen: boolean;
  openMapModal: () => void;
  closeMapModal: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const openMapModal = () => setIsMapModalOpen(true);
  const closeMapModal = () => setIsMapModalOpen(false);

  return (
    <MapContext.Provider value={{ isMapModalOpen, openMapModal, closeMapModal }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
