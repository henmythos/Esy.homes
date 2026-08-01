import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PointOfInterest } from '../types';
import { MapPin, Navigation, Compass, Utensils, ShoppingBag, Bus, Sun, Crosshair, Stethoscope } from 'lucide-react';

interface OpenStreetMapProps {
  lat: number;
  lng: number;
  title: string;
  priceFormatted: string;
  nearbyPOIs: PointOfInterest[];
}

export const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  lat,
  lng,
  title,
  priceFormatted,
  nearbyPOIs,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map if exists
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    leafletInstance.current = map;

    // OpenStreetMap Tile Layer (Free, Open Source)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | esy.homes',
    }).addTo(map);

    // Custom Property Pin HTML (Airbnb Pink Badge style)
    const propertyIcon = L.divIcon({
      className: 'custom-property-pin',
      html: `
        <div style="
          background-color: #FF385C;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(255, 56, 92, 0.4);
          border: 2px solid white;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
          transform: translate(-50%, -100%);
        ">
          <span>🏠</span> ${priceFormatted}
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // Add main property marker
    const propertyMarker = L.marker([lat, lng], { icon: propertyIcon }).addTo(map);
    propertyMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #111; font-size: 14px;">${title}</strong>
        <p style="margin: 4px 0 0 0; color: #FF385C; font-weight: 600;">${priceFormatted} / night</p>
      </div>
    `);

    // Category Color & Emoji Map for POIs
    const getPoiStyle = (category: string) => {
      switch (category) {
        case 'transport':
          return { bg: '#2563EB', emoji: '🚌', label: 'Transit' };
        case 'food':
          return { bg: '#D97706', emoji: '☕', label: 'Dining' };
        case 'grocery':
          return { bg: '#059669', emoji: '🛒', label: 'Market' };
        case 'beach':
          return { bg: '#0284C7', emoji: '🏖️', label: 'Beach' };
        case 'medical':
          return { bg: '#DC2626', emoji: '🏥', label: 'Medical' };
        default:
          return { bg: '#7C3AED', emoji: '📍', label: 'POI' };
      }
    };

    // Filter & Add POI Markers
    const filteredPOIs =
      selectedCategory === 'all'
        ? nearbyPOIs
        : nearbyPOIs.filter((poi) => poi.category === selectedCategory);

    filteredPOIs.forEach((poi) => {
      const style = getPoiStyle(poi.category);
      const poiIcon = L.divIcon({
        className: 'custom-poi-pin',
        html: `
          <div style="
            background-color: ${style.bg};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            border: 2px solid white;
            transform: translate(-50%, -50%);
          ">
            ${style.emoji}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const poiMarker = L.marker([poi.lat, poi.lng], { icon: poiIcon }).addTo(map);
      poiMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: #1f2937; font-size: 13px;">
            <span>${style.emoji}</span> ${poi.name}
          </div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
            ${poi.distanceMeters < 1000 ? `${poi.distanceMeters}m away` : `${(poi.distanceMeters / 1000).toFixed(1)}km away`}
          </p>
          ${poi.description ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #4b5563;">${poi.description}</p>` : ''}
        </div>
      `);
    });

    // Invalidate size after layout renders
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [lat, lng, title, priceFormatted, nearbyPOIs, selectedCategory]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Category Filter Pills on Top of Map */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> All Nearby ({nearbyPOIs.length})
        </button>
        <button
          onClick={() => setSelectedCategory('food')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'food'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" /> Dining & Cafes
        </button>
        <button
          onClick={() => setSelectedCategory('grocery')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'grocery'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Markets
        </button>
        <button
          onClick={() => setSelectedCategory('transport')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'transport'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Bus className="w-3.5 h-3.5" /> Transit
        </button>
        <button
          onClick={() => setSelectedCategory('beach')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'beach'
              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Sun className="w-3.5 h-3.5" /> Beaches
        </button>
        <button
          onClick={() => setSelectedCategory('medical')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === 'medical'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" /> Medical
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* OpenStreetMap Badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-gray-600 font-medium border border-gray-200/80 shadow-xs z-[400] flex items-center gap-1">
          <Navigation className="w-3 h-3 text-rose-500" />
          OpenStreetMap • Zero API Fees
        </div>
      </div>
    </div>
  );
};
