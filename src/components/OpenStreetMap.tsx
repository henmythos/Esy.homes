import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PointOfInterest } from '../types';
import { MapPin, Navigation, Compass, Utensils, ShoppingBag, Bus, Sun, Crosshair, Stethoscope, Loader2, ExternalLink, Car, Footprints } from 'lucide-react';

interface OpenStreetMapProps {
  lat: number;
  lng: number;
  title: string;
  priceFormatted: string;
  nearbyPOIs: PointOfInterest[];
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return {
    km: Number(km.toFixed(2)),
    driveMins: Math.max(1, Math.round(km * 3)), // Approx 20 km/h city average
    walkMins: Math.max(1, Math.round(km * 12)), // Approx 5 km/h walking speed
  };
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
  const userMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<{ km: number; driveMins: number; walkMins: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

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

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ezy.homes',
    }).addTo(map);

    // Custom Property Pin HTML
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
        <p style="margin: 4px 0 0 0; color: #FF385C; font-weight: 600;">${priceFormatted} / stay</p>
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

    // If User Location is already calculated, draw marker and line
    if (userLocation) {
      drawUserLocationOnMap(userLocation.lat, userLocation.lng, map);
    }

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

  const drawUserLocationOnMap = (uLat: number, uLng: number, mapObj?: L.Map) => {
    const map = mapObj || leafletInstance.current;
    if (!map) return;

    // Clear existing user marker/polyline
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div style="
          background-color: #2563eb;
          color: white;
          padding: 5px 10px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          border: 2px solid white;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
          transform: translate(-50%, -100%);
        ">
          <span>📍</span> You Are Here
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    userMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon }).addTo(map);

    // Draw Dashed Route Line
    polylineRef.current = L.polyline(
      [
        [uLat, uLng],
        [lat, lng],
      ],
      {
        color: '#2563eb',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.85,
      }
    ).addTo(map);

    // Fit Map Bounds to fit both property and user position
    map.fitBounds(
      [
        [uLat, uLng],
        [lat, lng],
      ],
      { padding: [60, 60], maxZoom: 16 }
    );
  };

  const handleEstimateDistance = () => {
    if (!navigator.geolocation) {
      setLocatingError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    setLocatingError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        setUserLocation({ lat: uLat, lng: uLng });
        const res = calculateHaversineDistance(uLat, uLng, lat, lng);
        setDistanceInfo(res);

        drawUserLocationOnMap(uLat, uLng);
        setIsLocatingUser(false);
      },
      (err) => {
        console.warn('Distance locate error:', err);
        setLocatingError('Could not obtain current location. Please allow location permissions in your browser.');
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Category Filter Pills on Top of Map */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
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
            <Utensils className="w-3.5 h-3.5" /> Dining
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
        </div>

        {/* Estimate Distance Button */}
        <button
          onClick={handleEstimateDistance}
          disabled={isLocatingUser}
          className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          {isLocatingUser ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          <span>{isLocatingUser ? 'Calculating...' : 'Distance from Me'}</span>
        </button>
      </div>

      {/* Distance Calculation Result Card */}
      {distanceInfo && userLocation && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-blue-950 flex items-center gap-2">
                <span>📍 You are {distanceInfo.km} km away from this property</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-blue-800 font-semibold mt-0.5">
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-blue-600" /> ~{distanceInfo.driveMins} mins drive
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-blue-600" /> ~{distanceInfo.walkMins} mins walk
                </span>
              </div>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>Open Google Maps Route</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {locatingError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          {locatingError}
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
        <div ref={mapRef} className="w-full h-full" />

        {/* OpenStreetMap Badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-gray-600 font-medium border border-gray-200/80 shadow-xs z-[400] flex items-center gap-1">
          <Navigation className="w-3 h-3 text-rose-500" />
          OpenStreetMap • Precise Coordinates
        </div>
      </div>
    </div>
  );
};
