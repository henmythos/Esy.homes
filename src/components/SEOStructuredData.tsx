import React, { useEffect } from 'react';
import { Property } from '../types';

interface SEOStructuredDataProps {
  properties: Property[];
  selectedProperty: Property | null;
}

export const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({
  properties,
  selectedProperty,
}) => {
  useEffect(() => {
    // 1. Dynamic ItemList Schema for Google Search Cards Grid
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'esy.homes Rental Property Search Listings',
      'description': 'Verified PGs, monthly rooms, and daily homestays across Indian cities.',
      'numberOfItems': properties.length,
      'itemListElement': properties.map((prop, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'item': {
          '@type': prop.rentalType === 'pg_hostel' ? 'LodgingBusiness' : 'Accommodation',
          '@id': `https://esy.homes/property/${prop.slug || prop.id}`,
          'name': prop.title,
          'description': prop.description,
          'image': prop.images[0],
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': prop.location.address,
            'addressLocality': prop.location.neighborhood,
            'addressRegion': prop.location.city,
            'postalCode': prop.location.pincode || '',
            'addressCountry': 'IN',
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': prop.location.lat,
            'longitude': prop.location.lng,
          },
          'offers': {
            '@type': 'Offer',
            'price': prop.priceINR,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
            'priceSpecification': {
              '@type': 'UnitPriceSpecification',
              'price': prop.priceINR,
              'priceCurrency': 'INR',
              'unitCode': prop.rentalType === 'daily_rental' ? 'DAY' : 'MON',
            },
          },
          'aggregateRating': prop.reviewCount > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': prop.rating,
            'reviewCount': prop.reviewCount,
            'bestRating': 5,
            'worstRating': 1,
          } : undefined,
        },
      })),
    };

    // Inject ItemList script
    let scriptItemList = document.getElementById('jsonld-itemlist') as HTMLScriptElement | null;
    if (!scriptItemList) {
      scriptItemList = document.createElement('script');
      scriptItemList.id = 'jsonld-itemlist';
      scriptItemList.type = 'application/ld+json';
      document.head.appendChild(scriptItemList);
    }
    scriptItemList.textContent = JSON.stringify(itemListSchema);

    // 2. Dynamic Single Property Schema if Modal is open
    if (selectedProperty) {
      const selectedSchema = {
        '@context': 'https://schema.org',
        '@type': selectedProperty.rentalType === 'pg_hostel' ? 'LodgingBusiness' : 'RealEstateListing',
        'name': selectedProperty.title,
        'description': selectedProperty.description,
        'image': selectedProperty.images,
        'url': `https://esy.homes/property/${selectedProperty.slug || selectedProperty.id}`,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': selectedProperty.location.address,
          'addressLocality': selectedProperty.location.neighborhood,
          'addressRegion': selectedProperty.location.city,
          'postalCode': selectedProperty.location.pincode || '',
          'addressCountry': 'IN',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': selectedProperty.location.lat,
          'longitude': selectedProperty.location.lng,
        },
        'offers': {
          '@type': 'Offer',
          'price': selectedProperty.priceINR,
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'validFrom': selectedProperty.createdAt,
        },
        'aggregateRating': selectedProperty.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          'ratingValue': selectedProperty.rating,
          'reviewCount': selectedProperty.reviewCount,
          'bestRating': 5,
          'worstRating': 1,
        } : undefined,
        'amenityFeature': selectedProperty.amenities.map(a => ({
          '@type': 'LocationFeatureSpecification',
          'name': a,
          'value': true,
        })),
      };

      let scriptSelected = document.getElementById('jsonld-single-property') as HTMLScriptElement | null;
      if (!scriptSelected) {
        scriptSelected = document.createElement('script');
        scriptSelected.id = 'jsonld-single-property';
        scriptSelected.type = 'application/ld+json';
        document.head.appendChild(scriptSelected);
      }
      scriptSelected.textContent = JSON.stringify(selectedSchema);
    } else {
      const existingSingle = document.getElementById('jsonld-single-property');
      if (existingSingle) {
        existingSingle.remove();
      }
    }

  }, [properties, selectedProperty]);

  return null;
};
