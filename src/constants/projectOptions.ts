export const PROJECT_NAME_OPTIONS = [
  'Shoonya',
  'Lajja',
  'Lajja - Naari Shakti Niketan',
  'Lake Restoration',
  'Gyandaan',
  'Construction',
  'Road Safety',
  'Roshni',
  'Traffic Park',
] as const;

export const PROJECT_LOGO_PATHS: Record<string, string> = {
  // Map trimmed, lowercase project names to their logo image paths.
  'shoonya': '/assets/logos/Shoonya.png',
  'lajja': '/assets/logos/Lajja.png',
  'lajja - naari shakti niketan': '/assets/logos/Lajja.png',
  'gyandaan': '/assets/logos/GYAANDAAN BLACK.png',
  'roshni': '/assets/logos/roshni Logo_1.png',
  // Add more entries (e.g., 'lake restoration', 'traffic park') once their logos are available.
};

const normalizeProjectKey = (name?: string) => name?.trim().toLowerCase();

export const getProjectLogoPath = (projectName?: string) => {
  if (!projectName) return undefined;
  return PROJECT_LOGO_PATHS[normalizeProjectKey(projectName) || ''];
};

export const WORK_TYPE_OPTIONS = [
  'Women Hygiene',
  'Health',
  'Hunger',
  'Education',
  'Environment',
  'Livelihood',
] as const;
