import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Check, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import { getCurrentUserLocation } from '../utils/locationService';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  cityName: string;
  onChangeLocation: (lat: number, lng: number, address?: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  cityName,
  onChangeLocation,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string>('');

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
    });

    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | ezy.homes',
    }).addTo(map);

    // Draggable Custom Property Pin
    const pinIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          background-color: #f43f5e;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 12px;
          box-shadow: 0 4px 14px rgba(244, 63, 94, 0.5);
          border: 2.5px solid white;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transform: translate(-50%, -100%);
          cursor: grab;
        ">
          <span>🎯</span> Drag to Exact Entrance
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const marker = L.marker([lat, lng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    // Handle Drag End
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onChangeLocation(
        Number(position.lat.toFixed(6)),
        Number(position.lng.toFixed(6))
      );
    });

    // Handle Click on Map to Move Pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      onChangeLocation(
        Number(clickLat.toFixed(6)),
        Number(clickLng.toFixed(6))
      );
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Sync marker and view if lat/lng change from outside (e.g. GPS or Search)
  useEffect(() => {
    if (leafletMap.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - lat) > 0.00001 ||
        Math.abs(currentPos.lng - lng) > 0.00001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        leafletMap.current.setView([lat, lng], 16, { animate: true });
      }
    }
  }, [lat, lng]);

  // Handle GPS Auto Detect
  const handleGPSDetect = async () => {
    setIsLocatingGPS(true);
    setSearchError(null);

    try {
      const pos = await getCurrentUserLocation();
      const gpsLat = pos.lat;
      const gpsLng = pos.lng;

      if (leafletMap.current && markerRef.current) {
        markerRef.current.setLatLng([gpsLat, gpsLng]);
        leafletMap.current.setView([gpsLat, gpsLng], 17, { animate: true });
      }

      onChangeLocation(gpsLat, gpsLng, `GPS Pin (${gpsLat}, ${gpsLng})`);
    } catch (err: any) {
      console.warn('GPS location error:', err);
      setSearchError(err?.message || 'Location access is unavailable. Please enable location permission or select your city manually.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  // Address Geocode Search via Nominatim
  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const fullQuery = searchQuery.toLowerCase().includes(cityName.toLowerCase())
        ? searchQuery
        : `${searchQuery}, ${cityName}, India`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullQuery
        )}&limit=1`
      );

      const results = await response.json();

      if (results && results.length > 0) {
        const result = results[0];
        const newLat = Number(parseFloat(result.lat).toFixed(6));
        const newLng = Number(parseFloat(result.lon).toFixed(6));

        if (leafletMap.current && markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          leafletMap.current.setView([newLat, newLng], 16, { animate: true });
        }

        setDetectedAddress(result.display_name);
        onChangeLocation(newLat, newLng, result.display_name);
      } else {
        setSearchError(`No exact spot found for "${searchQuery}". Try dragging the red pin directly on the map.`);
      }
    } catch (err) {
      setSearchError('Search failed. You can still tap directly on the map to pin the exact location.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar & GPS Locate Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form onSubmit={handleSearchAddress} className="flex-1 flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder={`Search landmark or street in ${cityName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-900 outline-none py-1 px-1 font-medium"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGPSDetect}
          disabled={isLocatingGPS}
          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          title="Use current device GPS location"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          ) : (
            <Crosshair className="w-4 h-4 text-rose-600" />
          )}
          <span>{isLocatingGPS ? 'Getting GPS...' : 'Use My Live GPS'}</span>
        </button>
      </div>

      {/* Error / Feedback Banner */}
      {searchError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-gray-300 shadow-xs z-0">
        <div ref={mapRef} className="w-full h-full" />

        {/* Live Pin Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 border border-white/20 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-[400] bg-white/90 backdrop-blur-md text-gray-800 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-gray-200 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-rose-500" />
          Tap map to move pin
        </div>
      </div>

      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        Owners with accurate GPS pins receive 3x more guest calls & direction inquiries.
      </p>
    </div>
  );
};
