// Base light theme tokens
export const light = {
  // Surfaces
  bg: '#F9FAFB',
  card: '#FFFFFF',
  //E5E7EB
  
  // icono +
  white: '#FFFFFF',
  backIcon: '#99A1AF',

  // Text
  text: '#1A1A1A',
  subtext: '#4A5565',
  muted: '#6A7282',         // generic muted text (used by Home components)
  gmted: '#4A5565',         // generic muted text (used by Home components)

  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',
  iconbase: '#57D1B9',

  // Status
  successBg: '#D1FAE5',
  success: '#00C950',

  // Borders / dividers
  border: '#F3F4F6',
  ringoutline: '#EEF2F7',

  // Controls
  // UI helpers used by the `home` feature (src/features/home)
  // These tokens are consumed by Home screens
  mealsCard: '#FFFFFF',    // background for meals card
  secondary: '#99A1AF',     // secondary text / small labels
  dot: '#edf3f5ff',           // small pager dots
  dotActive: '#FFFFFF',     // active pager dot
  mealRowBg: '#F8FAFC',     // background for meal rows
  addBtnBg: '#2FCCAC',      // add button bg

  // Per-meal chip colors (used by MealsList / Home)
  mealChips: {
    breakfast: { bg: '#FFEDD4', icon: '#FF6900' },
    lunch:     { bg: '#FEF9C2', icon: '#D08700' },
    dinner:    { bg: '#E9D5FF', icon: '#AD46FF' },
  },

  // IMC tokens: bubble + per-category pill colors
  imc: {
    bubbleBg: '#E8FAF6',
    pillBg: {
      underweight: '#FEF3C7',
      normal: '#D0F7DC',
      overweight: '#FFF4E6',
      obese: '#FFE5E5',
    },
    pillText: {
      underweight: '#D97706',
      normal: '#00C950',
      overweight: '#B45309',
      obese: '#DC2626',
    },
  },

} as const;

export type LightTheme = typeof light;
