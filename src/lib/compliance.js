/**
 * compliance.js — Official ID, Passport & Visa Standards Reference Database
 * Provides millimeter-accurate dimensions, backdrop colors, biometric oval rules,
 * and nametag requirements for major domestic & international standards.
 */

export const COMPLIANCE_STANDARDS = [
  {
    id: 'us_visa',
    category: 'visa',
    name: 'US Visa / US Passport',
    country: 'United States',
    flag: '🇺🇸',
    sizeId: '2x2',
    dimensionsLabel: '2×2 inches (51×51 mm)',
    w: 2.0,
    h: 2.0,
    unit: 'in',
    bgPreset: 'white',
    bgDescription: 'Pure white or off-white backdrop with no shadows.',
    showOval: true,
    ovalDescription: 'Head height must be between 50% and 69% of image height.',
    nameTagAllowed: false,
    nameTagDescription: 'Prohibited. No text or labels permitted on photo.',
    rules: [
      'Neutral facial expression with both eyes open.',
      'Eyeglasses prohibited unless documented medical necessity.',
      'No uniforms; daily civilian clothing required.'
    ]
  },
  {
    id: 'schengen_visa',
    category: 'visa',
    name: 'Schengen Visa (Europe)',
    country: 'European Union',
    flag: '🇪🇺',
    sizeId: 'passport',
    dimensionsLabel: '35×45 mm',
    w: 1.378,
    h: 1.772,
    unit: 'mm',
    bgPreset: 'gray',
    bgDescription: 'Light gray or plain light-colored background (not pure white).',
    showOval: true,
    ovalDescription: 'Face must cover 70% to 80% of photo (32–36 mm from chin to crown).',
    nameTagAllowed: false,
    nameTagDescription: 'Prohibited. No borders, text, or staples on image area.',
    rules: [
      'Direct camera gaze with closed mouth.',
      'Even lighting without shadows or flash reflections on skin.',
      'Headwear only allowed for religious reasons.'
    ]
  },
  {
    id: 'ph_passport',
    category: 'passport',
    name: 'Philippine Passport (DFA)',
    country: 'Philippines',
    flag: '🇵🇭',
    sizeId: 'passport',
    dimensionsLabel: '35×45 mm',
    w: 1.378,
    h: 1.772,
    unit: 'mm',
    bgPreset: 'blue',
    bgDescription: 'Royal blue backdrop (standard DFA biometric specification).',
    showOval: true,
    ovalDescription: 'Crown of head to chin must occupy 70–80% of frame.',
    nameTagAllowed: false,
    nameTagDescription: 'Not required on standard biometric e-passport submissions.',
    rules: [
      'Dark collared shirt or formal business attire recommended.',
      'No colored contact lenses or tinted glasses.',
      'Both ears must be clearly visible.'
    ]
  },
  {
    id: 'ph_prc',
    category: 'gov',
    name: 'PRC Board Exam (Professional Regulation)',
    country: 'Philippines',
    flag: '🇵🇭',
    sizeId: '2x2',
    dimensionsLabel: '2×2 inches (51×51 mm)',
    w: 2.0,
    h: 2.0,
    unit: 'in',
    bgPreset: 'white',
    bgDescription: 'Plain solid white backdrop.',
    showOval: false,
    ovalDescription: 'Shoulders and full head visible.',
    nameTagAllowed: true,
    nameTagRequired: true,
    nameTagDescription: 'Mandatory white banner with complete SURNAME, FIRST NAME, M.I.',
    rules: [
      'Formal attire with collar (coat & tie or polo).',
      'Name tag positioned at bottom margin in capital letters.',
      'Taken within the last 6 months.'
    ]
  },
  {
    id: 'ph_civil_service',
    category: 'gov',
    name: 'Civil Service Exam (CSC / CS)',
    country: 'Philippines',
    flag: '🇵🇭',
    sizeId: 'passport',
    dimensionsLabel: 'Passport Size (35×45 mm) / 2×2 in',
    w: 1.378,
    h: 1.772,
    unit: 'mm',
    bgPreset: 'white',
    bgDescription: 'Pure white background with sharp lighting.',
    showOval: false,
    ovalDescription: 'Standard passport proportion framing.',
    nameTagAllowed: true,
    nameTagRequired: true,
    nameTagDescription: 'Mandatory full nameplate at the bottom (First, Middle, Last, Ext).',
    rules: [
      'Bareheaded without eyeglasses or earrings.',
      'Neutral expression looking straight into lens.',
      'Signature over printed name often applied on nametag.'
    ]
  },
  {
    id: 'canada_visa',
    category: 'visa',
    name: 'Canada Visa / PR / Passport',
    country: 'Canada',
    flag: '🇨🇦',
    sizeId: 'custom',
    dimensionsLabel: '50×70 mm (2×2.75 in)',
    w: 1.968,
    h: 2.756,
    unit: 'mm',
    bgPreset: 'white',
    bgDescription: 'Plain uniform white or light-coloured background.',
    showOval: true,
    ovalDescription: 'Chin to crown height must be between 31 mm and 36 mm.',
    nameTagAllowed: false,
    nameTagDescription: 'No digital captions on front. Studio stamp on back.',
    rules: [
      'Clear, sharp focus without glare.',
      'Natural facial expression with mouth closed.',
      'Full front view of the face and top of the shoulders.'
    ]
  },
  {
    id: 'japan_visa',
    category: 'visa',
    name: 'Japan Visa',
    country: 'Japan',
    flag: '🇯🇵',
    sizeId: 'custom',
    dimensionsLabel: '45×45 mm',
    w: 1.772,
    h: 1.772,
    unit: 'mm',
    bgPreset: 'white',
    bgDescription: 'Plain white background with no shadows.',
    showOval: true,
    ovalDescription: 'Head height should be approx. 27–30 mm.',
    nameTagAllowed: false,
    nameTagDescription: 'Strictly no text overlays.',
    rules: [
      'Front-facing without hat or cap.',
      'Hair must not obscure eyebrows or eyes.',
      'No border lines around the 45×45 mm square.'
    ]
  },
  {
    id: 'uk_passport',
    category: 'passport',
    name: 'UK Passport & Visa',
    country: 'United Kingdom',
    flag: '🇬🇧',
    sizeId: 'passport',
    dimensionsLabel: '35×45 mm',
    w: 1.378,
    h: 1.772,
    unit: 'mm',
    bgPreset: 'gray',
    bgDescription: 'Plain light cream or light grey background.',
    showOval: true,
    ovalDescription: 'Head size between 29 mm and 34 mm from crown to chin.',
    nameTagAllowed: false,
    nameTagDescription: 'Prohibited. Must be clear photograph only.',
    rules: [
      'Clear separation between face and background.',
      'No red-eye, no shadows over face or behind head.',
      'Children must be on their own without toys or parents in frame.'
    ]
  }
];

export function getAllComplianceStandards() {
  return COMPLIANCE_STANDARDS;
}

export function getComplianceById(id) {
  return COMPLIANCE_STANDARDS.find(item => item.id === id) || null;
}
