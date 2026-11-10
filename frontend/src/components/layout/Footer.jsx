import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { footerNavigation } from '../../data/footer';

// Minimal luxury inline SVGs for social media channels
const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

/**
 * Luxury Footer Component
 * Fully data-driven, automatically hides unconfigured contact details or social links.
 */
export const Footer = () => {
  const { brand, business, socialLinks, copyright } = siteConfig;

  // Determine if any contact information is actually configured
  const hasContactInfo =
    business &&
    (business.address ||
      business.phone ||
      business.email ||
      business.workingHours);

  // Filter available social links
  const activeSocials = Object.entries(socialLinks || {}).filter(
    ([, url]) => Boolean(url)
  );

  return (
    <footer className="bg-luxury-ivory-light border-t border-luxury-border">
      {/* Upper Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column (Spans 2 cols on desktop) */}
          <div className="sm:col-span-2 space-y-4">
            <span className="font-serif text-2xl tracking-[0.15em] uppercase font-normal text-luxury-text-primary block">
              {brand.name}
            </span>
            <p className="text-xs text-luxury-text-secondary leading-relaxed max-w-sm font-sans">
              {brand.tagline}
            </p>

            {/* Configured Contact Info (Hides if null) */}
            {hasContactInfo && (
              <div className="pt-4 space-y-2.5 text-xs text-luxury-text-secondary">
                {business.address && (
                  <p className="flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-luxury-text-primary flex-shrink-0 mt-0.5" />
                    <span>{business.address}</span>
                  </p>
                )}
                {business.phone && (
                  <p className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-luxury-text-primary flex-shrink-0" />
                    <span>{business.phone}</span>
                  </p>
                )}
                {business.email && (
                  <p className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-2 text-luxury-text-primary flex-shrink-0" />
                    <span>{business.email}</span>
                  </p>
                )}
                {business.workingHours && (
                  <p className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-2 text-luxury-text-primary flex-shrink-0" />
                    <span>{business.workingHours}</span>
                  </p>
                )}
              </div>
            )}

            {/* Social Media Links (Only displays configured channels) */}
            {activeSocials.length > 0 && (
              <div className="pt-4 flex items-center space-x-3">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                  >
                    <TwitterIcon />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                  >
                    <YoutubeIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation Column 1: Shop Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-text-primary mb-4 pb-2 border-b border-luxury-border/60">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.shopLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-xs text-luxury-text-secondary hover:text-luxury-text-primary transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column 2: Client Care */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-text-primary mb-4 pb-2 border-b border-luxury-border/60">
              Client Care
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.customerCare.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-xs text-luxury-text-secondary hover:text-luxury-text-primary transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column 3: The Maison */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-text-primary mb-4 pb-2 border-b border-luxury-border/60">
              The Maison
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.aboutLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-xs text-luxury-text-secondary hover:text-luxury-text-primary transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-luxury-border bg-luxury-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-luxury-text-secondary space-y-4 sm:space-y-0">
          <p className="tracking-wide">
            &copy; {copyright.year} {copyright.holder}. {copyright.rightsText}
          </p>

          <div className="flex flex-wrap items-center justify-center space-x-6">
            {footerNavigation.legalLinks.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="hover:text-luxury-text-primary transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
