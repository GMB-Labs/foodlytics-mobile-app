import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Image,          // 👈 nuevo
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import AppText from "@/src/shared/ui/components/Typography";
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";

export default function CameraNoDetectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;

  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams();
      q.set("dateISO", dateISO);
      router.replace(`/camera?${q.toString()}` as any);
    }, 4000);
    return () => clearTimeout(t);
  }, [router, dateISO]);

  const isAndroid = Platform.OS === "android";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        {isAndroid ? (
          // 👇 En Android usas tu webp/png/gif exportado del mismo ícono
          <Image
            source={require("@/assets/images/error.webp")}
            style={styles.lottie}
          />
        ) : (
          // 👇 En iOS (u otros) sigues usando Lottie normalmente
          <LottieView
            source={require("@/assets/lottie/error.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        )}

        <AppText variant="ag6" style={styles.heading}>
          No se han detectado alimentos
        </AppText>
        <AppText variant="ag8" style={styles.message}>
          Lo sentimos, intenta tomar otra foto con la comida más visible.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  lottie: {
    width: 155,
    height: 155,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  cross: {
    fontSize: 120,
    color: "#EF4444",
    marginBottom: 12,
    textAlign: "center",
  },
  heading: {
    fontSize: 20,
    color: "#151522",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
