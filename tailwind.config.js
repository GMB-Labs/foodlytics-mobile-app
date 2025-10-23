/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: only include files/folders that contain UI components/screens where
  content: [
    "./src/app.tsx",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/ui/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/ui/screens/**/*.{js,jsx,ts,tsx}",
    "./src/shared/ui/components/**/*.{js,jsx,ts,tsx}",
    "./src/shared/ui/screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}