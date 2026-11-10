import React, { useState } from 'react';
import { X } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

/**
 * Announcement Bar Component
 * Displays editable top-of-page announcement if enabled in siteConfig.
 */
export const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);
  const announcement = siteConfig.announcement;

  if (!announcement || !announcement.enabled || !announcement.text || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Announcement"
      className="bg-luxury-ivory text-luxury-text-primary border-b border-luxury-border py-2 px-4 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Spacer for optical centering */}
        <div className="w-6 hidden sm:block" />

        <div className="flex-1 text-center">
          {announcement.link ? (
            <a
              href={announcement.link}
              className="text-[11px] sm:text-xs tracking-[0.12em] font-sans font-medium hover:underline underline-offset-4 transition-all"
            >
              {announcement.text}
            </a>
          ) : (
            <p className="text-[11px] sm:text-xs tracking-[0.12em] font-sans font-medium">
              {announcement.text}
            </p>
          )}
        </div>

        {announcement.dismissible ? (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            className="text-luxury-text-secondary hover:text-luxury-text-primary p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-6 hidden sm:block" />
        )}
      </div>
    </aside>
  );
};

export default AnnouncementBar;
