import React, { useEffect } from 'react';
import { Property } from '../types';

interface SEOStructuredDataProps {
  properties: Property[];
  selectedProperty: Property | null;
}

const updateMeta = (attributeName: string, attributeValue: string, content: string) => {
  let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attributeName, attributeValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const updateCanonical = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

export const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({
  properties,
  selectedProperty,
}) => {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.ezy.homes';

    if (selectedProperty) {
      // Dynamic SEO Title & Meta for direct listing link sharing (Google Maps / Social links)
      const pageTitle = `${selectedProperty.title} - ${selectedProperty.location.neighborhood}, ${selectedProperty.location.city} | ezy.homes`;
      const priceText = `₹${selectedProperty.priceINR.toLocaleString('en-IN')}`;
      const pageDesc = `${selectedProperty.title} in ${selectedProperty.location.neighborhood}, ${selectedProperty.location.city}. Rate: ${priceText}. Direct owner contact, zero brokerage fee, verified listing on ezy.homes.`;
      const propertyUrl = `${origin}/?property=${selectedProperty.id}`;
      const imageUrl = selectedProperty.images[0];

      document.title = pageTitle;
      updateMeta('name', 'description', pageDesc);
      updateMeta('property', 'og:title', pageTitle);
      updateMeta('property', 'og:description', pageDesc);
      updateMeta('property', 'og:image', imageUrl);
      updateMeta('property', 'og:url', propertyUrl);
      updateMeta('name', 'twitter:title', pageTitle);
      updateMeta('name', 'twitter:description', pageDesc);
      updateMeta('name', 'twitter:image', imageUrl);
      updateCanonical(propertyUrl);

      // Single Property Schema with Google Maps & Local Business references
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedProperty.location.lat},${selectedProperty.location.lng}`;
      const selectedSchema = {
        '@context': 'https://schema.org',
        '@type': selectedProperty.rentalType === 'pg_hostel' ? 'LodgingBusiness' : 'RealEstateListing',
        'name': selectedProperty.title,
        'description': selectedProperty.description,
        'image': selectedProperty.images,
        'url': propertyUrl,
        'hasMap': mapsUrl,
        'sameAs': [mapsUrl, propertyUrl],
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
          'seller': {
            '@type': 'Person',
            'name': selectedProperty.owner.name,
            'telephone': selectedProperty.owner.phone,
          },
        },
        'aggregateRating': selectedProperty.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          'ratingValue': selectedProperty.rating,
          'reviewCount': selectedProperty.reviewCount,
          'bestRating': 5,
          'worstRating': 1,
        } : undefined,
        'amenityFeature': selectedProperty.amenities.map((a) => ({
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
      // Default Global Site Meta
      const defaultTitle = 'ezy.homes | Rental Houses, Free Rental Listing & Independent Room Stays';
      const defaultDesc = 'Discover verified rental houses, independent room stays, monthly flats, and OYO rooms style homestays with free property listing for owners & zero brokerage in India.';
      const defaultKeywords = 'rental houses, free rental listing, property listing, oyo rooms, independent room stays, house for rent without broker, mens pg, womens pg, monthly flat rental, zero brokerage room stays, ezy homes';
      
      document.title = defaultTitle;
      updateMeta('name', 'description', defaultDesc);
      updateMeta('name', 'keywords', defaultKeywords);
      updateMeta('property', 'og:title', defaultTitle);
      updateMeta('property', 'og:description', defaultDesc);
      updateMeta('property', 'og:url', `${origin}/`);
      updateMeta('name', 'twitter:title', defaultTitle);
      updateMeta('name', 'twitter:description', defaultDesc);
      updateCanonical(`${origin}/`);

      const existingSingle = document.getElementById('jsonld-single-property');
      if (existingSingle) {
        existingSingle.remove();
      }
    }

    // ItemList Schema for Google Search Grid
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'ezy.homes Rental Property Search Listings',
      'description': 'Verified PGs, monthly rooms, and daily homestays across Indian cities.',
      'numberOfItems': properties.length,
      'itemListElement': properties.map((prop, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'item': {
          '@type': prop.rentalType === 'pg_hostel' ? 'LodgingBusiness' : 'Accommodation',
          '@id': `${origin}/?property=${prop.id}`,
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

    let scriptItemList = document.getElementById('jsonld-itemlist') as HTMLScriptElement | null;
    if (!scriptItemList) {
      scriptItemList = document.createElement('script');
      scriptItemList.id = 'jsonld-itemlist';
      scriptItemList.type = 'application/ld+json';
      document.head.appendChild(scriptItemList);
    }
    scriptItemList.textContent = JSON.stringify(itemListSchema);

  }, [properties, selectedProperty]);

  return null;
};
