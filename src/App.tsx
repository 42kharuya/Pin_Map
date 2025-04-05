import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { Moon, Sun, Search } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function InitialLocation() {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (markerRef.current) {
          markerRef.current.remove();
        }

        markerRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="w-6 h-6 -ml-3 -mt-3 rounded-full bg-red-500 dark:bg-red-400 shadow-lg border-2 border-white dark:border-gray-800"></div>`,
          })
        }).addTo(map);

        map.flyTo([latitude, longitude], 14, {
          duration: 1.5,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Default to New York if geolocation fails
        map.setView([40.7128, -74.0060], 9);
      }
    );
  }, [map]);

  return null;
}

function SearchControl() {
  const map = useMap();
  const [markers, setMarkers] = useState<L.Marker[]>([]); // 複数のマーカーを管理

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      searchLabel: 'Search any location...',
      autoComplete: true,
      autoCompleteDelay: 250,
      retainZoomLevel: false,
    });

    map.addControl(searchControl);

    // Handle search results
    map.on('geosearch/showlocation', (event: any) => {
      const { location } = event;

      // 新しい青色のマーカーを作成
      const newMarker = L.marker([location.y, location.x], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-6 h-6 -ml-3 -mt-3 rounded-full bg-blue-500 dark:bg-blue-400 shadow-lg border-2 border-white dark:border-gray-800"></div>`,
        }),
      }).addTo(map);

      // マーカーリストを更新
      setMarkers((prevMarkers) => {
        // 古いマーカーを削除
        prevMarkers.forEach((marker) => marker.remove());
        return [newMarker];
      });

      // マップを新しい位置に移動
      map.flyTo([location.y, location.x], 14, {
        duration: 1.5,
      });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

function App() {
  const [isDark, setIsDark] = useState(false); // Default to light mode

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="relative w-full h-screen">
        <MapContainer
          center={[40, -74.5]} // This will be immediately overridden by InitialLocation
          zoom={9}
          className="map-container"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isDark 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />
          <InitialLocation />
          <SearchControl />
        </MapContainer>
        <button
          onClick={toggleTheme}
          className="absolute bottom-5 right-5 z-[1000] p-3 rounded-full bg-white/90 dark:bg-gray-800/90 
                     shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700
                     text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     transition-all duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}

export default App;