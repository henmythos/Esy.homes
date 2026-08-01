import { Amenity } from '../types';

export const ALL_AMENITIES: Amenity[] = [
  { id: 'wifi', name: 'Fast Fiber Wi-Fi', icon: 'Wifi', category: 'essential' },
  { id: 'ac', name: 'Air Conditioning', icon: 'Wind', category: 'comfort' },
  { id: 'solar', name: 'Solar / Generator Backup (24/7 Power)', icon: 'Zap', category: 'essential' },
  { id: 'water_tank', name: '24/7 Water Storage Tank', icon: 'Droplets', category: 'essential' },
  { id: 'workspace', name: 'Dedicated Workspace Desk', icon: 'Briefcase', category: 'essential' },
  { id: 'kitchen', name: 'Fully Equipped Kitchen', icon: 'Utensils', category: 'essential' },
  { id: 'pool', name: 'Private Pool / Plunge Pool', icon: 'Waves', category: 'outdoor' },
  { id: 'parking', name: 'Free Secure Parking', icon: 'Car', category: 'essential' },
  { id: 'security', name: '24/7 Gated Security / CCTV', icon: 'ShieldCheck', category: 'safety' },
  { id: 'beach_access', name: 'Direct Beach Walking Access', icon: 'Sun', category: 'outdoor' },
  { id: 'tv', name: 'Smart TV with Netflix', icon: 'Tv', category: 'comfort' },
  { id: 'washing_machine', name: 'Washing Machine', icon: 'Shirt', category: 'comfort' },
  { id: 'balcony', name: 'Balcony / Rooftop Terrace', icon: 'Maximize2', category: 'outdoor' },
  { id: 'bbq', name: 'BBQ Grill Area', icon: 'Flame', category: 'outdoor' },
];
