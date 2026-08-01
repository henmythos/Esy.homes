import { Property } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  // 1. PG HOSTEL - BENGALURU
  {
    id: 'prop-pg-1',
    title: 'Zolo Stays Premium Mens PG Hostel & Co-Living',
    slug: 'zolo-premium-mens-pg-koramangala-bengaluru',
    description: 'Modern fully furnished Mens PG Hostel in the heart of Koramangala 4th Block. Includes 3-time north & south Indian hygienic meals, 200 Mbps fiber Wi-Fi, daily room cleaning, power backup inverter, washing machines, and 24/7 CCTV surveillance.',
    rentalType: 'pg_hostel',
    category: 'pg_hostel',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '12th Main Road, Koramangala 4th Block',
      neighborhood: 'Koramangala',
      lat: 12.9352,
      lng: 77.6245,
      pincode: '560034'
    },
    priceINR: 8500, // ₹8,500/month
    pricePerNightUSD: 101, // fallback conversion
    securityDepositINR: 5000,
    cleaningFeeUSD: 0,
    rating: 4.85,
    reviewCount: 142,
    maxGuests: 1,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    pgDetails: {
      gender: 'mens',
      sharing: 'double',
      foodIncluded: true,
      foodType: 'both',
      acAvailable: true,
      noticePeriodDays: 30,
      gateClosingTime: '11:00 PM'
    },
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'solar', 'ac', 'kitchen', 'security', 'workspace', 'tv'],
    nearbyPOIs: [
      { id: 'poi-101', name: 'Forum Mall Koramangala', category: 'attraction', lat: 12.9340, lng: 77.6110, distanceMeters: 800 },
      { id: 'poi-102', name: 'Christ University Main Campus', category: 'college', lat: 12.9360, lng: 77.6060, distanceMeters: 1200 },
      { id: 'poi-103', name: 'Sony World Junction Bus Stop', category: 'transport', lat: 12.9370, lng: 77.6270, distanceMeters: 300 }
    ],
    owner: {
      id: 'owner-pg-1',
      name: 'Ramesh Reddy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98450 12345',
      whatsapp: '919845012345',
      responseRate: '100% within 5 minutes',
      languages: ['Kannada', 'English', 'Telugu', 'Hindi'],
      joinedDate: 'January 2023',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Biometric entry access provided upon check-in',
      'Food served: Breakfast (7:30 - 9:30 AM), Dinner (8:00 - 10:00 PM)',
      '1 Month security deposit fully refundable on 30-day notice'
    ],
    checkInTime: '10:00 AM',
    checkOutTime: '12:00 PM',
    instantCallAvailable: true,
    createdAt: '2026-01-10',
    isFeatured: true
  },

  // 2. PG HOSTEL - HYDERABAD (WOMENS)
  {
    id: 'prop-pg-2',
    title: 'Sri Sai Luxury Womens PG Hostel & Co-Living',
    slug: 'sri-sai-womens-pg-hitec-city-hyderabad',
    description: 'High-security Womens PG Hostel located 5 minutes from Cyber Towers and Mindspace IT Park. Equipped with biometric facial recognition entry, 24/7 lady warden, high-speed Wi-Fi, delicious home-style food, and RO drinking water.',
    rentalType: 'pg_hostel',
    category: 'pg_hostel',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      address: 'Plot 42, Silicon Valley Colony, Madhapur',
      neighborhood: 'Hitec City',
      lat: 17.4483,
      lng: 78.3808,
      pincode: '500081'
    },
    priceINR: 9500, // ₹9,500/month
    pricePerNightUSD: 113,
    securityDepositINR: 5000,
    cleaningFeeUSD: 0,
    rating: 4.92,
    reviewCount: 98,
    maxGuests: 1,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    pgDetails: {
      gender: 'womens',
      sharing: 'double',
      foodIncluded: true,
      foodType: 'both',
      acAvailable: true,
      noticePeriodDays: 30,
      gateClosingTime: '10:30 PM'
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'ac', 'security', 'kitchen', 'workspace'],
    nearbyPOIs: [
      { id: 'poi-201', name: 'Cyber Towers Hitec City', category: 'it_park', lat: 17.4500, lng: 78.3810, distanceMeters: 400 },
      { id: 'poi-202', name: 'Hitec City Metro Station', category: 'transport', lat: 17.4470, lng: 78.3830, distanceMeters: 350 },
      { id: 'poi-203', name: 'Inorbit Mall Cyberabad', category: 'attraction', lat: 17.4360, lng: 78.3870, distanceMeters: 1500 }
    ],
    owner: {
      id: 'owner-pg-2',
      name: 'Sunitha Rao',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      phone: '+91 91770 98765',
      whatsapp: '919177098765',
      responseRate: '100% within 10 minutes',
      languages: ['Telugu', 'English', 'Hindi'],
      joinedDate: 'March 2022',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      '24/7 Lady security warden on premises',
      'No male visitors inside rooms; visitor lounge provided at entrance',
      'Zero deposit deduction on clear notice period'
    ],
    checkInTime: '9:00 AM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-02-01',
    isFeatured: true
  },

  // 3. MONTHLY ROOM - BENGALURU (HSR LAYOUT)
  {
    id: 'prop-m-1',
    title: 'Fully Furnished 1BHK Apartment with Balcony',
    slug: 'furnished-1bhk-flat-hsr-layout-bengaluru',
    description: 'Spacious independent 1BHK monthly rental flat in HSR Layout Sector 1. Fully modular kitchen with gas cylinder & fridge, king size bed, dedicated work desk with 300 Mbps Wi-Fi, inverter power backup, and private balcony.',
    rentalType: 'monthly_room',
    category: 'monthly_room',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      address: '27th Main, Sector 1, HSR Layout',
      neighborhood: 'HSR Layout',
      lat: 12.9121,
      lng: 77.6445,
      pincode: '560102'
    },
    priceINR: 22000, // ₹22,000/month
    pricePerNightUSD: 263,
    securityDepositINR: 40000,
    cleaningFeeUSD: 0,
    rating: 4.90,
    reviewCount: 36,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'solar', 'ac', 'kitchen', 'workspace', 'parking', 'tv'],
    nearbyPOIs: [
      { id: 'poi-301', name: 'NIFT Bengaluru College', category: 'college', lat: 12.9140, lng: 77.6480, distanceMeters: 500 },
      { id: 'poi-302', name: 'Agara Lake Park', category: 'attraction', lat: 12.9200, lng: 77.6430, distanceMeters: 700 },
      { id: 'poi-303', name: 'Silk Board Junction', category: 'transport', lat: 12.9170, lng: 77.6230, distanceMeters: 1800 }
    ],
    owner: {
      id: 'owner-m-1',
      name: 'Vikram Gowda',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      phone: '+91 99800 54321',
      whatsapp: '919980054321',
      responseRate: '100% within 15 minutes',
      languages: ['Kannada', 'English', 'Hindi'],
      joinedDate: 'August 2022',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Monthly lease with 1-month notice period',
      'Maintenance charges included in monthly rent',
      'Pets allowed with prior permission'
    ],
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-02-15'
  },

  // 4. DAILY RENTAL - GOA (ANJUNA BEACH)
  {
    id: 'prop-d-1',
    title: 'Portuguese Heritage Beach Cottage & Garden',
    slug: 'portuguese-heritage-cottage-goa',
    description: 'Restored 19th-century Goan home with red-tile roof, spacious veranda, private garden with coconut trees, and 5-minute walk to Anjuna Beach. Equipped with water filtration, high-speed Wi-Fi, and inverter power backup.',
    rentalType: 'daily_rental',
    category: 'daily_rental',
    location: {
      city: 'Goa',
      state: 'Goa',
      country: 'India',
      address: 'Near Flea Market Road, Anjuna',
      neighborhood: 'Anjuna',
      lat: 15.5802,
      lng: 73.7420,
      pincode: '403509'
    },
    priceINR: 3800, // ₹3,800/night
    pricePerNightUSD: 45,
    cleaningFeeUSD: 8,
    rating: 4.95,
    reviewCount: 156,
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'solar', 'ac', 'kitchen', 'parking', 'bbq'],
    nearbyPOIs: [
      { id: 'poi-401', name: 'Anjuna Sunset Beach Point', category: 'attraction', lat: 15.5820, lng: 73.7390, distanceMeters: 300 },
      { id: 'poi-402', name: 'Curlies Beach Shack', category: 'food', lat: 15.5780, lng: 73.7380, distanceMeters: 450 },
      { id: 'poi-403', name: 'Anjuna Wednesday Flea Market', category: 'attraction', lat: 15.5810, lng: 73.7440, distanceMeters: 200 }
    ],
    owner: {
      id: 'owner-d-1',
      name: 'Aarav D\'Souza',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98220 12345',
      whatsapp: '919822012345',
      responseRate: '100% within 5 minutes',
      languages: ['English', 'Hindi', 'Konkani'],
      joinedDate: 'November 2020',
      isSuperhost: true
    },
    blockedDates: ['2026-08-10', '2026-08-11', '2026-08-12'],
    houseRules: [
      'Pets welcomed in outdoor garden area',
      'Please turn off AC when leaving rooms to save energy',
      'Scooter rental contact provided upon WhatsApp request'
    ],
    checkInTime: '1:00 PM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-03-01',
    isFeatured: true
  },

  // 5. DAILY RENTAL - JAIPUR (PENTHOUSE VILLA)
  {
    id: 'prop-d-2',
    title: 'Royal Palace View Villa & Terrace Garden',
    slug: 'royal-palace-view-villa-jaipur',
    description: 'Luxury Rajasthani heritage villa with rooftop terrace overlooking Nahargarh Fort and City Palace. Features hand-painted Jharokhas, modern AC bedrooms, high-speed Wi-Fi, and traditional thali breakfast.',
    rentalType: 'daily_rental',
    category: 'daily_rental',
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      address: 'Subhash Marg, C Scheme',
      neighborhood: 'C Scheme',
      lat: 26.9124,
      lng: 75.7873,
      pincode: '302001'
    },
    priceINR: 4200, // ₹4,200/night
    pricePerNightUSD: 50,
    cleaningFeeUSD: 5,
    rating: 4.96,
    reviewCount: 88,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'ac', 'kitchen', 'parking', 'workspace'],
    nearbyPOIs: [
      { id: 'poi-501', name: 'City Palace & Hawa Mahal', category: 'attraction', lat: 26.9250, lng: 75.8230, distanceMeters: 2500 },
      { id: 'poi-502', name: 'Jaipur Junction Railway Station', category: 'transport', lat: 26.9180, lng: 75.7880, distanceMeters: 1100 }
    ],
    owner: {
      id: 'owner-d-2',
      name: 'Rathore Family',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 94140 88888',
      whatsapp: '919414088888',
      responseRate: '100% within 10 minutes',
      languages: ['Hindi', 'English', 'Rajasthani'],
      joinedDate: 'December 2021',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Pure veg breakfast included in nightly stay',
      'Rooftop open until midnight for stargazing',
      'Direct taxi & city tour booking assistance on WhatsApp'
    ],
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-03-20',
    isFeatured: true
  },

  // 6. MONTHLY ROOM - MUMBAI (BANDRA WEST)
  {
    id: 'prop-m-2',
    title: 'Sea Facing Executive Studio Apartment',
    slug: 'sea-facing-studio-bandra-west-mumbai',
    description: 'Chic fully furnished studio apartment located on Carter Road, Bandra West. Unobstructed Arabian Sea views, smart TV, high-speed fiber internet, fully fitted kitchenette, and 24/7 security concierge.',
    rentalType: 'monthly_room',
    category: 'monthly_room',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: 'Carter Road, Bandra West',
      neighborhood: 'Bandra West',
      lat: 19.0600,
      lng: 72.8220,
      pincode: '400050'
    },
    priceINR: 48000, // ₹48,000/month
    pricePerNightUSD: 575,
    securityDepositINR: 80000,
    cleaningFeeUSD: 0,
    rating: 4.98,
    reviewCount: 45,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'ac', 'kitchen', 'security', 'workspace', 'tv'],
    nearbyPOIs: [
      { id: 'poi-601', name: 'Carter Road Promenade', category: 'attraction', lat: 19.0610, lng: 72.8210, distanceMeters: 50 },
      { id: 'poi-602', name: 'Bandra Local Railway Station', category: 'transport', lat: 19.0540, lng: 72.8400, distanceMeters: 1800 }
    ],
    owner: {
      id: 'owner-m-2',
      name: 'Priya Merchant',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98200 99999',
      whatsapp: '919820099999',
      responseRate: '100% within 5 minutes',
      languages: ['English', 'Hindi', 'Marathi'],
      joinedDate: 'May 2021',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Suitable for corporate executives & working expats',
      'Electricity billed separately as per actual meter reading',
      'Direct WhatsApp inquiry for instant video walkthrough'
    ],
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-04-01'
  },

  // 7. PG HOSTEL - PUNE (HINJEWADI)
  {
    id: 'prop-pg-3',
    title: 'Stanza Living Co-Living Unisex PG Hostel',
    slug: 'stanza-living-coliving-pg-hinjewadi-pune',
    description: 'Modern co-living PG hostel in Hinjewadi Phase 1, walking distance from Wipro & Infosys campus. Offers single & double occupancy rooms, gym access, gaming area, 3 meals daily, laundry, and fast Wi-Fi.',
    rentalType: 'pg_hostel',
    category: 'pg_hostel',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      address: 'Near Wipro Circle, Hinjewadi Phase 1',
      neighborhood: 'Hinjewadi',
      lat: 18.5912,
      lng: 73.7389,
      pincode: '411057'
    },
    priceINR: 11000, // ₹11,000/month
    pricePerNightUSD: 131,
    securityDepositINR: 10000,
    cleaningFeeUSD: 0,
    rating: 4.88,
    reviewCount: 112,
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    pgDetails: {
      gender: 'unisex',
      sharing: 'single',
      foodIncluded: true,
      foodType: 'both',
      acAvailable: true,
      noticePeriodDays: 30,
      gateClosingTime: '11:30 PM'
    },
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'ac', 'security', 'kitchen', 'workspace'],
    nearbyPOIs: [
      { id: 'poi-701', name: 'Infosys Phase 1 Campus', category: 'it_park', lat: 18.5930, lng: 73.7360, distanceMeters: 400 },
      { id: 'poi-702', name: 'Wipro Circle Bus Stop', category: 'transport', lat: 18.5900, lng: 73.7400, distanceMeters: 200 }
    ],
    owner: {
      id: 'owner-pg-3',
      name: 'Aniket Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      phone: '+91 97640 11111',
      whatsapp: '919764011111',
      responseRate: '98% within 10 minutes',
      languages: ['Marathi', 'English', 'Hindi'],
      joinedDate: 'September 2022',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Professional working environment',
      'Daily housekeeping and laundry services included',
      'High-speed Wi-Fi with backup line'
    ],
    checkInTime: '10:00 AM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-04-10'
  },

  // 8. MONTHLY ROOM - DELHI NCR (GURUGRAM)
  {
    id: 'prop-m-3',
    title: 'Independent 2BHK Floor near Cyber City',
    slug: 'independent-2bhk-floor-cyber-city-gurugram',
    description: 'Fully furnished independent 2BHK builder floor in Sector 24, Gurugram. 5 minutes from Cyber Hub & DLF Phase 3 Metro. Equipped with modular kitchen, AC in both bedrooms, power backup, and dedicated parking slot.',
    rentalType: 'monthly_room',
    category: 'monthly_room',
    location: {
      city: 'Delhi NCR',
      state: 'Haryana',
      country: 'India',
      address: 'DLF Phase 3, Sector 24',
      neighborhood: 'Gurugram Cyber City',
      lat: 28.4950,
      lng: 77.0890,
      pincode: '122002'
    },
    priceINR: 32000, // ₹32,000/month
    pricePerNightUSD: 383,
    securityDepositINR: 50000,
    cleaningFeeUSD: 0,
    rating: 4.87,
    reviewCount: 29,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['wifi', 'solar', 'ac', 'kitchen', 'parking', 'security', 'workspace'],
    nearbyPOIs: [
      { id: 'poi-801', name: 'DLF Cyber Hub Restaurants', category: 'food', lat: 28.4960, lng: 77.0880, distanceMeters: 600 },
      { id: 'poi-802', name: 'Micromax Moulsari Avenue Rapid Metro', category: 'transport', lat: 28.4930, lng: 77.0910, distanceMeters: 300 }
    ],
    owner: {
      id: 'owner-m-3',
      name: 'Sanjeev Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98100 22222',
      whatsapp: '919810022222',
      responseRate: '100% within 10 minutes',
      languages: ['Hindi', 'English'],
      joinedDate: 'October 2021',
      isSuperhost: true
    },
    blockedDates: [],
    houseRules: [
      'Ideal for families or corporate colleagues sharing',
      'Power backup inverter provided for continuous work',
      'Direct WhatsApp booking & key handover'
    ],
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    instantCallAvailable: true,
    createdAt: '2026-05-02'
  }
];
