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
  mutetext: '#6A7282',      // alias used in some profile tokens
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
  // Small UI helpers used across profile components
  chipBg: '#F8FAFC',        // input / chip background
  danger: '#EF4444',        // error / danger color

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
      underweight: '#A4E4FF',
      normal: '#D0F7DC',
      overweight: '#FEF3C7',
      overweightI: '#FEE7C7',
      overweightII: '#FFCEB5',
      overweightIII: '#FFE5E5',
      obese: '#FFE5E5',
    },

  // Primary gradient tokens used by header and buttons
  gradient: {
    primaryFrom: '#2FCCAC',
    primaryTo: '#24A88C',
  },
    pillText: {
      underweight: '#007BA9',
      normal: '#00C950',
      overweight: '#D97706',
      overweightI: '#D96806',
      overweightII: '#EA5B0C',
      overweightIII: '#DC2626',
      obese: '#DC2626',
    },
  },

} as const;

export type LightTheme = typeof light;
