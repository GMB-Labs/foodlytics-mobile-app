// Base dark theme tokens (values chosen to preserve contrast)
export const dark = {
  // Surfaces
  bg: '#121212',
  card: '#072C26',

  white: '#2CC1A2',
  color: '#FFFFFF',
  backIcon: '#2CC0A1',

  // Text
  text: '#E5E5E5',
  subtext: '#c5c5c5ff',
  //
  textinfo: '#5175AF',
  infoCardBg:'#011D28',

  muted: '#6A7282',  
  gmted: '#B5B5B5',         // generic muted text (used by Home components)
  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',
  iconbase: '#0C3A31',

  // Icon semantic tokens
  icons: {
    active: '#41D3B6',
    idle: '#4A5565',
    activeBg: '#12211E',
    idleBg: '#1B1B1B',
    eyesIcon: '#021B3D',
    dataIcon: '#333333',
    secureIcon: '#053A18',
    shieldIcon: '#280547',
  },

  // Status
  successBg: '#063826',
  success: '#00C950',

  // Borders / dividers
  border: '#111111',
  border2: '#282828',
  ringoutline: '#1F2228',

  noteBox: '#06201B',

  // Controls
  // fondo del botón de añadir (circular)
  mealsCard: '#181818',    // fondo de la lista de comidas
  dot: '#0B3E34',           // small pager dots
  dotActive: '#181818',     // active pager dot
  chipBg: '#072C26',   
  mealRowBg: '#121212',     // fondo de las filas de comida
  addBtnBg: '#0B4B3E', 
  
  // Per-meal chip colors (used by MealsList / Home) — darker variants for dark mode
  mealChips: {
    breakfast: { bg: '#321D00', icon: '#FF791A' },
    lunch:     { bg: '#312D00', icon: '#EA9800' },
    dinner:    { bg: '#2B153C', icon: '#B760FF' },
  },

  gradient: {
    primaryFrom: '#0B4B3E',
    primaryTo: '#142D28',
  },

  // IMC tokens: bubble + per-category pill colors (darker variants)
  imc: {
    bubbleBg: '#06201B',
    pillBg: {
      underweight: '#003D57',
      normal: '#053A18',
      overweight: '#3B2B00',
      overweightI: '#3B1900',
      overweightII: '#3A0F0F',
      overweightIII: '#3A0F0F',
      obese: '#3A0F0F',
    },
    pillText: {
      underweight: '#0BF',
      normal: '#00E25A',
      overweight: '#FF8900',
      overweightI: '#D96806',
      overweightII: '#EA5B0C',
      overweightIII: '#DC2626',
      obese: '#DC2626',
    },
  },

} as const;

export type DarkTheme = typeof dark;
