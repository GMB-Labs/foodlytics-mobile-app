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
    extend: {
      colors: {
        primary: "#2FCCAC",
        primaryDark: "#24A88C",
        bg: "#F9FAFB",
        text: "#1A1A1A",
        mute: "#4A5565",
      },
      fontFamily: {
        poppins: ["Poppins-Regular", "System"],
        "poppins-medium": ["Poppins-Medium", "System"],
        "poppins-bold": ["Poppins-Bold", "System"],
      },
      borderRadius: {
        xl: 16,
        "2xl": 24,
      },
      boxShadow: {
        card: "0 6px 20px rgba(0,0,0,0.08)",
        fab: "0 10px 25px rgba(47,204,172,0.45)",
      },
    },
  },
  plugins: [],
}