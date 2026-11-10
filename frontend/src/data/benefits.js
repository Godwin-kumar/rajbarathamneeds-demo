/**
 * Why Choose Us / Brand Benefits Configuration
 *
 * Schema:
 * {
 *   id: string,
 *   iconName: string, // Corresponds to Lucide icon key
 *   title: string,
 *   description: string,
 * }
 *
 * Editable neutral placeholders until actual business claims are defined.
 * If empty, the BenefitsSection displays neutral configurable placeholders.
 */
export const benefits = [
  {
    id: 'benefit-1',
    iconName: 'ShieldCheck',
    title: '[Service Pillar 1]',
    description: '[Editable service or craftsmanship guarantee placeholder]',
  },
  {
    id: 'benefit-2',
    iconName: 'Sparkles',
    title: '[Service Pillar 2]',
    description: '[Editable bespoke design or quality assurance placeholder]',
  },
  {
    id: 'benefit-3',
    iconName: 'Truck',
    title: '[Service Pillar 3]',
    description: '[Editable delivery, packaging, or concierge details placeholder]',
  },
  {
    id: 'benefit-4',
    iconName: 'Clock',
    title: '[Service Pillar 4]',
    description: '[Editable customer care or consultation assistance placeholder]',
  },
];

export default benefits;
