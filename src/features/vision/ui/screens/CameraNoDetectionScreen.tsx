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
import { useTheme } from '@/src/shared/styles/useTheme';

export default function CameraNoDetectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;

  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

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
          // En Android usa la imagen exportada del icono
          <Image
            source={require("@/assets/images/error.webp")}
            style={styles.lottie}
          />
        ) : (
          // En iOS (u otros) sigue usando Lottie
          <LottieView
            source={require("@/assets/lottie/error.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        )}

        <AppText variant="ag6" style={styles.heading} color={theme.text ?? '#151522'}>
          No se han detectado alimentos
        </AppText>
        <AppText variant="ag8" style={styles.message} color={theme.subtext ?? '#6B7280'}>
          Lo sentimos, intenta tomar otra foto con la comida más visible.
        </AppText>
      </View>
    </View>
  );
}
function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace('#', '');
  const normalized = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.bg ?? '#FFFFFF' },
    lottie: {
      width: 155,
      height: 155,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    cross: {
      fontSize: 120,
      color: themeColors.danger ?? '#EF4444',
      marginBottom: 12,
      textAlign: 'center',
    },
    heading: {
      fontSize: 20,
      color: themeColors.text ?? '#151522',
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: themeColors.subtext ?? '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}
