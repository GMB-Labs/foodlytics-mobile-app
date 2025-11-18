// Base light theme tokens
export const light = {
  // Surfaces
  bg: '#F9FAFB',
  card: '#FFFFFF',
  // icono +
  white: '#FFFFFF',
  backIcon: '#99A1AF',

  // Text
  text: '#1A1A1A',
  subtext: '#4A5565',
  mutetext: '#6A7282',

  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',

  // Status
  successBg: '#D1FAE5',
  success: '#00C950',

  // Borders / dividers
  border: '#F3F4F6',

  // Controls
  chipBg: '#F8FAFC',
  // UI helpers used by the `home` feature (src/features/home)
  // These tokens are consumed by Home screens and its components
  // (Home.tsx, CaloriesCard, MacrosCard, ImcCard, MealsList, RingProgress, styles.ts)
  muted: '#6A7282',         // generic muted text (used by Home components)
  secondary: '#99A1AF',     // secondary text / small labels
  dot: '#E6EEF0',           // small pager dots
  dotActive: '#FFFFFF',     // active pager dot
  divider: '#F1F5F9',       // light divider color
  track: '#EEF2F7',         // ring / progress track
  mealRowBg: '#F8FAFC',     // background for meal rows
  burned: '#FF5A3D',        // burned icon color
  addBtnBg: '#2FCCAC',      // add button bg


  mealsCard: '#FFFFFF',    // background for meals card
  
  // Per-meal chip colors (used by MealsList / Home)
  mealChips: {
    breakfast: { bg: '#FFEDD4', icon: '#FF6900' },
    lunch:     { bg: '#FEF9C2', icon: '#D08700' },
    dinner:    { bg: '#E9D5FF', icon: '#AD46FF' },
  },

  // IMC specific
  imcBubbleBg: '#E8FAF6',
  imcPillBg: '#D0F7DC',
  imcPillText: '#00C950',

  // Macro track background
  macroTrackBg: '#E5E7EB',

  // Macronutrient colors (used in charts / UI)
  carbs: '#FF6900',
  protein: '#2B7FFF',
  fats: '#F0B100',

  // Misc
  danger: '#EF4444',
} as const;

export type LightTheme = typeof light;
