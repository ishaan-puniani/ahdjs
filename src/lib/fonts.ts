export const FONT_FAMILY_NAMES = [
  'MODERN_SANS',
  'BOOK_SANS',
  'ORGANIC_SANS',
  'GEOMETRIC_SANS',
  'HEAVY_SANS',
  'ROUNDED_SANS',
  'MODERN_SERIF',
  'BOOK_SERIF',
  'MONOSPACE',
  'ROBOTO',
  'OPEN_SANS',
  'LATO',
  'POPPINS',
  'INTER',
  'MONTSERRAT',
  'RALEWAY',
  'NUNITO',
  'PLAYFAIR_DISPLAY',
  'MERRIWEATHER',
  'PT_SANS',
  'OSWALD',
  'SOURCE_SANS_PRO',
  'RUBIK',
  'WORK_SANS',
  'NOTO_SANS',
  'DANCING_SCRIPT',
  'PACIFICO',
  'LOBSTER',
  'BEBAS_NEUE',
] as const;

export type FontFamilyName = typeof FONT_FAMILY_NAMES[number];

export const FONT_FAMILY_MAP: Record<FontFamilyName, string> = {
  MODERN_SANS: 'Inter',
  BOOK_SANS: 'Source Sans Pro',
  ORGANIC_SANS: 'Nunito',
  GEOMETRIC_SANS: 'Montserrat',
  HEAVY_SANS: 'Oswald',
  ROUNDED_SANS: 'Rubik',
  MODERN_SERIF: 'Playfair Display',
  BOOK_SERIF: 'Merriweather',
  MONOSPACE: 'Roboto Mono',
  ROBOTO: 'Roboto',
  OPEN_SANS: 'Open Sans',
  LATO: 'Lato',
  POPPINS: 'Poppins',
  INTER: 'Inter',
  MONTSERRAT: 'Montserrat',
  RALEWAY: 'Raleway',
  NUNITO: 'Nunito',
  PLAYFAIR_DISPLAY: 'Playfair Display',
  MERRIWEATHER: 'Merriweather',
  PT_SANS: 'PT Sans',
  OSWALD: 'Oswald',
  SOURCE_SANS_PRO: 'Source Sans Pro',
  RUBIK: 'Rubik',
  WORK_SANS: 'Work Sans',
  NOTO_SANS: 'Noto Sans',
  DANCING_SCRIPT: 'Dancing Script',
  PACIFICO: 'Pacifico',
  LOBSTER: 'Lobster',
  BEBAS_NEUE: 'Bebas Neue',
};

export const googleFonts = Array.from(new Set(Object.values(FONT_FAMILY_MAP)));

export const createGoogleFontsURL = (fonts: string[]) => {
  const families = fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
};
