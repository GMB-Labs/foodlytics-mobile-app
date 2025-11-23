import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppText from '@/src/shared/ui/components/Typography';
import LottieView from "lottie-react-native";
import BackIcon from "@/assets/icons/meals/backIcon.svg";
import { detectFoodFromImage } from "@/src/features/vision/application/detectFoodFromImage";
import { useTheme } from '@/src/shared/styles/useTheme';

/**
 * LoadingScreen (UI first)
 *
 * - Muestra diseño de carga.
 * - Por ahora SIEMPRE navega a /camera/result (simulando éxito del backend/IA).
 * - TODO: Reemplazar la navegación directa por:
 *   1) (Opcional) compresión ligera o sin compresión para máxima precisión.
 *   2) Envío multipart/form-data al backend con la imagen.
 *   3) Manejo de errores (retry/cancel) real.
 */
export default function LoadingScreen() {
  const router = useRouter();
  const { photoUri, dateISO, mealType } = useLocalSearchParams() as any;
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  useEffect(() => {
    // Real: llamar al caso de uso que envía la imagen al backend y obtiene detección
    let mounted = true;
    (async () => {
      const q = new URLSearchParams();
      if (dateISO) q.set("dateISO", String(dateISO));
      if (mealType) q.set("mealType", String(mealType));

      try {
        console.log("[CameraLoading] detect start", { photoUri, dateISO, mealType });
        const res = await detectFoodFromImage(String(photoUri), { timeoutMs: 30000 });
        const detection = (res as any).detection ?? res;
        const resultId = (res as any).resultId;
        console.log("[CameraLoading] detect finished", { items: detection.items.length, totals: detection.totals, resultId });

        if (!mounted) return;
        // Guardar solo el resultId en la query para evitar URLs largas
        if (resultId) q.set("resultId", String(resultId));
        // En modo desarrollo aún permitimos enviar 'det' para debug si es pequeño
        if (__DEV__) {
          try {
            q.set("det", encodeURIComponent(JSON.stringify(detection)));
          } catch (e) {
            // ignore
          }
        }
        router.replace(`/camera/result?${q.toString()}`);
        return;
      } catch (err) {
        console.error("[CameraLoading] Vision detect error:", err);
        // Fallback: navegar a result sin datos (UI mostrará mensaje)
        router.replace(`/camera/result?${q.toString()}`);
      }
    })();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri, dateISO, mealType]);

  // Botón "Cancelar": por ahora también va a Result
  const handleCancel = () => {
    const q = new URLSearchParams();
    if (dateISO) q.set("dateISO", String(dateISO));
    if (mealType) q.set("mealType", String(mealType));
    // TODO: en producción, devolver al punto anterior al flujo de cámara (router.back() o ruta específica)
    router.replace(`/camera/result?${q.toString()}`);
  };

  return (
    <View style={styles.container}>

      <Pressable
        onPress={() => router.back()}
        style={styles.closeBtn}
        hitSlop={10}
        accessibilityLabel="Volver atrás/cancelar"
      >
        <BackIcon width={40} height={40} />
      </Pressable>

      <View style={styles.iconContainer}>
        <LottieView
          // Asegúrate que el JSON exista en esta ruta
          source={require("@/assets/lottie/analisis.json")}
          autoPlay
          loop
          renderMode="AUTOMATIC"
          enableMergePathsAndroidForKitKatAndAbove
          style={styles.lottie}
        />
      </View>

      {/* Título */}
      <AppText style={styles.title}>Analizando tu comida</AppText>

      {/* Subtítulo */}
      <AppText style={styles.subtitle}>
        Estamos identificando los alimentos y calculando los macronutrientes
      </AppText>

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
    closeBtn: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 65 : 65,
      left: 30,
      zIndex: 10,
    },
    container: {
      flex: 1,
      backgroundColor: themeColors.bg ?? '#F9FAFB',
      alignItems: 'center',
    },
    iconContainer: {
      marginTop: 244,
      alignItems: 'center',
      marginBottom: 38,
    },
    iconCircle: {
      width: 114,
      height: 114,
      borderRadius: 48,
      backgroundColor: themeColors.brandB ? hexToRgba(themeColors.brandB, 0.1) : 'rgba(0,196,140,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    lottie: {
      width: 230,
      height: 230,
    },
    title: {
      marginTop: 30,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
      color: themeColors.text ?? '#151522',
    },
    subtitle: {
      marginTop: 24,
      width: 357,
      maxWidth: 357,
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.subtext ?? '#999999',
    },
    cancelBtn: {
      marginTop: 28,
      paddingHorizontal: 2,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: themeColors.surfaceOverlay ?? 'rgba(0,0,0,0.06)',
    },
    cancelText: {
      color: themeColors.text ?? '#0B1220',
      fontWeight: '600',
    },
  });
}
