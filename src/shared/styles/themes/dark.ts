// Base dark theme tokens (values chosen to preserve contrast)
export const dark = {
  // Surfaces
  bg: '#121212',
  card: '#072C26',

  white: '#2CC1A2',
  backIcon: '#2CC0A1',

  // Text
  text: '#E5E5E5',
  subtext: '#c5c5c5ff',
  muted: '#6A7282',  
  gmted: '#B5B5B5',         // generic muted text (used by Home components)
  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',
  iconbase: '#0C3A31',

  // Status
  successBg: '#063826',
  success: '#00C950',

  // Borders / dividers
  border: '#0F2E27',
  ringoutline: '#1F2228',

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

  // IMC tokens: bubble + per-category pill colors (darker variants)
  imc: {
    bubbleBg: '#06201B',
    pillBg: {
      underweight: '#3B2B00',
      normal: '#063826',
      overweight: '#3A2A12',
      obese: '#3A0F0F',
    },
    pillText: {
      underweight: '#F59E0B',
      normal: '#00C950',
      overweight: '#F59E0B',
      obese: '#FF7A6A',
    },
  },

} as const;

export type DarkTheme = typeof dark;
