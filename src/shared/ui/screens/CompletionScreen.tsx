// src/shared/ui/screens/CompletionScreen.tsx
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import {
  View,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { isLottieSafe } from "@/src/shared/utils/isLottieSafe";

type CompletionScreenProps = {
  heading: string;
  message: string;
  icon: any;             // Lottie JSON o fallback image (webp/png/gif)
  lottie?: any;          // Lottie JSON opcional (para fallback)
  autoRedirectMs?: number;
  onAutoRedirect?: () => void;
};

export function CompletionScreen({
  heading,
  message,
  icon,      // fallback image
  lottie,    // el JSON real del lottie
  autoRedirectMs,
  onAutoRedirect,
}: CompletionScreenProps) {
  useEffect(() => {
    if (!autoRedirectMs || !onAutoRedirect) return;
    const t = setTimeout(onAutoRedirect, autoRedirectMs);
    return () => clearTimeout(t);
  }, [autoRedirectMs, onAutoRedirect]);

  const shouldUseLottie =
    lottie &&
    Platform.OS === "android"
      ? isLottieSafe(lottie) // Usar Lottie solo si es seguro
      : true;                // iOS siempre usa Lottie

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {shouldUseLottie ? (
            <LottieView
              source={lottie || icon}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          ) : (
            <Image source={icon} style={styles.staticIcon} />
          )}
        </View>

        <AppText variant="ag6" style={styles.heading}>
          {heading}
        </AppText>

        <AppText variant="ag8" style={styles.message}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 300,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  lottie: {
    width: 155,
    height: 155,
  },
  staticIcon: {
    width: 155,
    height: 155,
    resizeMode: "contain",
  },
  heading: {
    textAlign: "center",
    color: "#151522",
    marginBottom: 30,
  },
  message: {
    textAlign: "center",
    color: "#999999",
    lineHeight: 24,
    marginHorizontal: 24,
  },
});
