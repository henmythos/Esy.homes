import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, MapPin, Database, Server, Image as ImageIcon, MessageSquare, AlertCircle, FileText, CheckCircle2, ChevronLeft } from 'lucide-react';
import { PREMIUM_WHATSAPP_NUMBER, PREMIUM_WHATSAPP_URL } from '../utils/expiration';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col my-auto border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 sm:hidden"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xs text-gray-500 font-semibold">
                ezy.homes Direct Rental Platform • Effective Date: August 25, 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Policy Content Scrollable Area */}
        <div className="p-6 sm:p-8 space-y-8 text-gray-700 text-sm leading-relaxed">
          
          {/* Quick Summary Banner */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs sm:text-sm text-rose-950 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-start gap-2.5">
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">Your Privacy Matters at ezy.homes</span>
                <span className="text-rose-800/90 text-xs">
                  We connect property owners and renters directly across India. We do not sell personal data, use advertising trackers, or require mandatory password registrations.
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" /> 1. Introduction
            </h2>
            <p>
              Welcome to <strong>ezy.homes</strong> ("we", "us", or "our"). ezy.homes is a direct property discovery and listing platform designed for daily stay homestays, PG hostels, monthly rooms, and commercial shop spaces across all major Indian cities.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, process, and protect your information when you access our website (<a href="https://www.ezy.homes" target="_blank" rel="noopener noreferrer" className="text-rose-600 font-bold hover:underline">https://www.ezy.homes</a>), Progressive Web App (PWA), or Android mobile application.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-rose-500" /> 2. Information We Collect
            </h2>
            <p>
              We collect only the essential information necessary to facilitate direct property discovery between hosts and renters:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-xs sm:text-sm text-gray-700">
              <li>
                <strong>Property Listing Details (Voluntarily Provided)</strong>: Title, description, category (Daily Stay, PG Hostel, Monthly Room, Commercial Shop), city, neighborhood, exact or approximate address, rent/price in INR, security deposit, capacity specs, amenities, and custom terms provided by property hosts.
              </li>
              <li>
                <strong>Property Media & Photos</strong>: Images uploaded by property hosts to represent their property listing.
              </li>
              <li>
                <strong>Contact Information</strong>: Owner name, phone number, and WhatsApp number voluntarily supplied by property hosts to receive direct renter inquiries.
              </li>
              <li>
                <strong>Device Location Data</strong>: Approximate or precise GPS coordinates (latitude and longitude) collected <em>only</em> when you explicitly grant location permissions on your device (e.g. clicking "Use My Live GPS" or nearby distance calculation).
              </li>
              <li>
                <strong>Technical & Request Logs</strong>: Standard HTTP request metadata such as IP address, browser type, device type, operating system version, and system timestamps processed automatically by server infrastructure for security and operational monitoring.
              </li>
            </ul>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
              <strong>What We Do NOT Collect</strong>: We do <em>not</em> collect biometric data, facial recognition scans, financial credit card numbers, bank account logins, advertising IDs, or password account credentials.
            </div>
          </section>

          {/* Section 3: How We Use Information */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-rose-500" /> 3. How We Use Information
            </h2>
            <p>We use the collected information for the following specific purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-gray-900 block mb-1">🏡 Display Listings Publicly</span>
                <span>To publish property listings, photos, prices, and specs to site visitors and mobile app users.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-gray-900 block mb-1">📍 Location & Search Filter</span>
                <span>To render interactive maps (OpenStreetMap/Leaflet) and perform city or neighborhood searches.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-gray-900 block mb-1">📞 Connect Renters & Hosts</span>
                <span>To enable direct WhatsApp messages and phone calls between prospective tenants and owners.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-gray-900 block mb-1">🛡️ System Security & Anti-Spam</span>
                <span>To prevent platform abuse, double-submission errors, malicious scripts, and server failure.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Property Listings and Public Information */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" /> 4. Property Listings & Public Information
            </h2>
            <p>
              Information intentionally submitted in a property listing (including title, description, property photos, pricing, amenities, neighborhood, and provided WhatsApp/phone numbers) becomes <strong>publicly visible</strong> on the ezy.homes website, PWA, and Android application.
            </p>
            <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <strong>Notice to Hosts</strong>: Do not include unnecessary sensitive personal information (such as personal government ID numbers, personal financial statements, or private passwords) within public listing description fields or property title text.
            </p>
          </section>

          {/* Section 5: Location Information */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> 5. Location Information
            </h2>
            <p>
              Location access is requested <em>only</em> when a feature requires it (such as detecting your current city or computing distance to a property) and <em>only</em> after you grant explicit permission.
            </p>
            <p>
              You can control or revoke location permissions at any time through your Android device settings (<em>Settings &gt; Apps &gt; ezy.homes &gt; Permissions</em>) or browser site permission settings. If permission is denied, the application will remain fully functional by allowing manual city selection.
            </p>
          </section>

          {/* Section 6: Photos & Uploaded Content */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rose-500" /> 6. Photos & Uploaded Content
            </h2>
            <p>
              Property photos uploaded by hosts are converted into web-optimized image formats in the browser and stored securely in Cloudflare R2 object storage to serve listing displays. We do not perform facial recognition, biometric processing, or automated biometric scanning on property photos.
            </p>
          </section>

          {/* Section 7: Communications */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" /> 7. Communications & Third-Party Messaging
            </h2>
            <p>
              When a user chooses to contact a property owner via phone or WhatsApp, the interaction transitions directly to those respective phone networks or third-party applications. Their independent privacy policies and terms of service govern those external communications.
            </p>
          </section>

          {/* Section 8: Third-Party Services & Infrastructure */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-rose-500" /> 8. Third-Party Infrastructure Providers
            </h2>
            <p>
              ezy.homes utilizes reliable cloud infrastructure providers to operate the production platform:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-gray-700">
              <li><strong>Vercel Inc.</strong>: Application hosting, edge delivery, and serverless API execution.</li>
              <li><strong>Turso (libSQL/SQLite)</strong>: Serverless database infrastructure hosting active listing records.</li>
              <li><strong>Cloudflare Inc. (R2 Storage)</strong>: Secure object storage for uploaded property images.</li>
              <li><strong>OpenStreetMap & Leaflet</strong>: Open-source map tile rendering and location visualization.</li>
            </ul>
          </section>

          {/* Section 9: Data Security */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" /> 9. Data Security
            </h2>
            <p>
              We implement reasonable technical safeguards including HTTPS/TLS transport encryption, parameterized database queries, and serverless architecture. However, please note that no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          {/* Section 10: Data Retention & Deletion */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-rose-500" /> 10. Data Retention & Listing Deletion
            </h2>
            <p>
              Property listings remain active based on category duration policies (e.g., 90 days for monthly rooms, 365 days for daily rentals &amp; PG hostels, or active lifetime for verified premium listings).
            </p>
            <p>
              Property hosts may edit or delete their active listings at any time using the <strong>"My Listings"</strong> tool in the app, or request manual removal by contacting support via WhatsApp at{' '}
              <a 
                href={PREMIUM_WHATSAPP_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-rose-600 font-bold hover:underline"
              >
                +{PREMIUM_WHATSAPP_NUMBER}
              </a>.
            </p>
          </section>

          {/* Section 11: Children's Privacy */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" /> 11. Children's Privacy
            </h2>
            <p>
              ezy.homes is not directed at children under 13 years of age. We do not knowingly collect or solicit personal information from children under 13.
            </p>
          </section>

          {/* Section 12: User Rights & Choices */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-rose-500" /> 12. User Rights & Choices
            </h2>
            <p>You have full control over your interaction with ezy.homes:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-gray-700">
              <li>Control or disable device location permissions at any time.</li>
              <li>Edit or remove property listings you have created.</li>
              <li>Contact support to request listing removal or privacy inquiries.</li>
            </ul>
          </section>

          {/* Section 13: Changes to This Policy */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" /> 13. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect service updates or legal requirements. Updated versions will be published directly on this page (<a href="https://www.ezy.homes/privacy-policy" className="text-rose-600 font-bold hover:underline">/privacy-policy</a>) with a revised Effective Date.
            </p>
          </section>

          {/* Section 14: Contact Us */}
          <section className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" /> 14. Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              If you have any questions, deletion requests, or privacy concerns regarding ezy.homes, please reach out directly:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-bold text-gray-900">
              <a 
                href={PREMIUM_WHATSAPP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" /> Direct WhatsApp Support (+{PREMIUM_WHATSAPP_NUMBER})
              </a>
              <span className="text-gray-500 font-medium">Website: https://www.ezy.homes</span>
            </div>
          </section>

        </div>

        {/* Footer Action */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-semibold">ezy.homes • Direct Rental Platform</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Close Privacy Policy
          </button>
        </div>

      </div>
    </div>
  );
};
