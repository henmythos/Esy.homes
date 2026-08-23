import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface LocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Native Android & Web Unified Location Detection Service
 * - On Android Capacitor: Requests native Android runtime permissions via @capacitor/geolocation
 * - On Web Browser / PWA: Uses standard navigator.geolocation
 * Handles granted, denied, position unavailable, and disabled location services gracefully.
 */
export async function getCurrentUserLocation(): Promise<LocationResult> {
  // 1. Android Capacitor Native App
  if (Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.location.protocol === 'capacitor:')) {
    try {
      let permStatus = await Geolocation.checkPermissions();
      
      if (permStatus.location !== 'granted' && permStatus.coarseLocation !== 'granted') {
        permStatus = await Geolocation.requestPermissions();
      }

      if (permStatus.location === 'granted' || permStatus.coarseLocation === 'granted') {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 3000,
        });

        return {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: position.coords.accuracy,
        };
      } else {
        throw new Error('Location access is unavailable. Please enable location permission in your device settings or select your city manually.');
      }
    } catch (e: any) {
      console.warn('Capacitor native location detection error:', e);
      throw new Error(
        e?.message || 'Location services are disabled or unavailable. Please enable GPS location permission or select your city manually.'
      );
    }
  }

  // 2. Standard Web Browser & PWA
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please select your city manually.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Could not detect location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enable location permission or select your city manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location position is unavailable. Please select your city manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or select your city manually.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 3000,
      }
    );
  });
}
