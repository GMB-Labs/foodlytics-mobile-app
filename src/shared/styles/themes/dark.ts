// Base dark theme tokens (values chosen to preserve contrast)
export const dark = {
  // Surfaces
  bg: '#121212',
  card: '#072C26',

  white: '#2CC1A2',
  backIcon: '#2CC0A1',

  // Text
  text: '#E5E5E5',
  subtext: '#A9C5BC',
  muted: '#6A7282',  

  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',

  // Status
  successBg: '#063826',
  success: '#00C950',

  // Borders / dividers
  border: '#0F2E27',

  // Controls
  chipBg: '#072C26',   
  mealRowBg: '#121212',     // fondo de las filas de comida
  addBtnBg: '#0B4B3E',    // fondo del botón de añadir (circular)
  mealsCard: '#181818',    // fondo de la lista de comidas

  // Per-meal chip colors (used by MealsList / Home) — darker variants for dark mode
  mealChips: {
    breakfast: { bg: '#321D00', icon: '#FF791A' },
    lunch:     { bg: '#312D00', icon: '#EA9800' },
    dinner:    { bg: '#2B153C', icon: '#B760FF' },
  },

  // Macronutrient colors (adjusted for dark backgrounds)
  carbs: '#FF8A42',
  protein: '#66A3FF',
  fats: '#FFD966',

  // Misc
  danger: '#FF7A6A',
} as const;

export type DarkTheme = typeof dark;
