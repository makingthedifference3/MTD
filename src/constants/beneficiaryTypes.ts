// Predefined beneficiary types for projects
export const BENEFICIARY_TYPES = [
  'Direct Beneficiaries',
  'Students',
  'Women',
  'Children',
  'Farmers',
  'Senior Citizens',
  'Healthcare Workers',
  'Artisans',
  'Youth',
  'Tribal Communities',
  'Differently Abled',
  'Families',
  'Villages',
  'Schools',
  'Community Members',
] as const;

export type BeneficiaryType = typeof BENEFICIARY_TYPES[number] | string;
