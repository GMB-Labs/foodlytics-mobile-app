import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { SessionProvider } from '../shared/hooks/useSession';
import { useFonts } from "expo-font";
import { setDefaultFontFamily } from "../shared/utils/fonts";
import "./global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) setDefaultFontFamily("Poppins-Regular");
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="auto" />
      {/* SessionProvider is a lightweight skeleton; replace with real Auth0 wiring later */}
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </SafeAreaProvider>
  );
}