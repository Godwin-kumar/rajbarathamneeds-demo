/**
 * Theme tokens and color definition
 * Conforms strictly to the required Luxury Palette:
 * - Pure White: #FFFFFF
 * - Soft Ivory: #F7F3EA
 * - Secondary Ivory: #FDFBF6
 * - Primary Text: #292929
 * - Secondary Text: #777777
 * - Subtle Border: #EAE6DE
 */
export const theme = {
  colors: {
    white: '#FFFFFF',
    ivory: '#F7F3EA',
    secondaryIvory: '#FDFBF6',
    primaryText: '#292929',
    secondaryText: '#777777',
    subtleBorder: '#EAE6DE',
  },
  typography: {
    headingFont: 'Cormorant Garamond, serif',
    bodyFont: 'Inter, sans-serif',
  },
  spacing: {
    sectionPadding: 'py-16 md:py-24',
    containerMaxWidth: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  }
};

export default theme;
