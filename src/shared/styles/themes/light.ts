import { dark } from "./dark";

// Base light theme tokens
export const light = {
  // Surfaces
  bg: '#F9FAFB',
  card: '#FFFFFF',
  //E5E7EB

  
  // icono +
  white: '#FFFFFF',
  color: '#57D1B9',
  backIcon: '#99A1AF',
  //
  textinfo: '#5175AF',
  infoCardBg:'#EFF6FF',
  // Text
  text: '#1A1A1A',  // negro en light y un blanquito suave para dark 
  subtext: '#4A5565',
  muted: '#6A7282',         // generic muted text (used by Home components)
  mutetext: '#6A7282',      // alias used in some profile tokens
  gmted: '#4A5565',         // generic muted text (used by Home components)

  // Accent / brand
  brandA: '#2FCCAC',
  brandB: '#24A88C',
  iconbase: '#57D1B9',
  iconbase2: 'rgba(255,255,255,0.20)',

  // Icon semantic tokens
  icons: {
    active: '#2FCCAC',
    idle: '#4A5565',
    activeBg: '#EBFAF7',
    idleBg: '#F3F4F6',
    eyesIcon: '#DBEAFE',
    dataIcon: '#D8D8D8',
    secureIcon: '#DCFCE7',
    shieldIcon: '#F3E8FF',

  },

  // Status
  successBg: '#D1FAE5',
  success: '#00C950',

  // Borders / dividers
  border: '#F3F4F6',
  border2: '#F3F4F6',
  border3: '#F3F4F6',
  ringoutline: '#EEF2F7',
  linea: '#E5E7EB',

  noteBox: '#EBF7FF',
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
    snack:     { bg: '#FBCFE8', icon: '#D9467C' },
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

  // Quick actions colors used by QuickActionsSheet
  quickActions: {
    food: '#2FCCAC',     // Registrar Comida (matches brandA)
    weight: '#2B7FFF',   // Registrar Peso
    activity: '#FF6900', // Registrar Actividad
    goal: '#AD46FF',     // Nueva Meta
  },

  gainsToday:{
    protein: '#5175AF',
    carbs: '#d06010ff',
    fats: '#cd9609ff',
    proteinBg: '#EFF6FF',
    carbsBg: '#FFF7ED',
    fatsBg: '#FFFAEB',
  },

} as const;

export type LightTheme = typeof light;
