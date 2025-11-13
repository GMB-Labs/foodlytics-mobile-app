// src/shared/ui/screens/CompletionScreen.tsx
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";

import {
  View,
  StyleSheet,
} from "react-native";
import AppText from "@/src/shared/ui/components/Typography";

type CompletionScreenProps = {
  heading: string;
  message: string;
  icon: any;
  autoRedirectMs?: number;
  onAutoRedirect?: () => void;
};

export function CompletionScreen({
  heading,
  message,
  icon,
  autoRedirectMs,
  onAutoRedirect,
}: CompletionScreenProps) {
  useEffect(() => {
    if (!autoRedirectMs || !onAutoRedirect) return;
    const t = setTimeout(onAutoRedirect, autoRedirectMs);
    return () => clearTimeout(t);
  }, [autoRedirectMs, onAutoRedirect]);

  return (
    <View style={styles.container}>
      {/* Contenido central */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/*<View style={styles.iconCircle}>*/}
            <LottieView source={icon} autoPlay loop={false} style={styles.lottie} />
          {/*</View>*/}
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
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0,196,140,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 155,
    height: 155,
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
  footer: {
    marginTop: 40,
  },
  primaryButton: {
    backgroundColor: "#2FCCAC",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
  },

});
