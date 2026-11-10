/**
 * Centralized Site and Brand Configuration — RAJ BARATHAM NEEDS
 */
export const siteConfig = {
  // Brand identity
  brand: {
    name: "RAJ BARATHAM NEEDS",
    logoText: "RAJ BARATHAM NEEDS",
    tagline: "Authentic Bharatanatyam & Temple Jewellery",
    logoUrl: null,
  },

  // Contact & business details
  business: {
    address: null,
    phone: null,
    email: null,
    workingHours: null,
  },

  // Social media presence
  socialLinks: {
    instagram: null,
    facebook: null,
    pinterest: null,
    youtube: null,
    twitter: null,
  },

  // Copyright text
  copyright: {
    year: new Date().getFullYear(),
    holder: "RAJ BARATHAM NEEDS",
    rightsText: "All rights reserved.",
  },

  // Announcement bar configuration
  announcement: {
    enabled: true,
    text: "Exquisite Handcrafted Bharatanatyam Temple Jewellery & Dance Ornaments",
    link: null,
    dismissible: true,
  },

  // Newsletter configuration
  newsletter: {
    heading: "Join Our Inner Circle",
    subheading: "Subscribe to receive updates on new temple jewellery collections, private previews, and exclusive invitations.",
    placeholder: "Enter your email address",
    buttonText: "Subscribe",
  }
};

export default siteConfig;
