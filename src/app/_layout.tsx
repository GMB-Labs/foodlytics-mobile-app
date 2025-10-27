import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
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
      <Slot />
    </SafeAreaProvider>
  );
}