import React, { useEffect } from "react";
import { View, StyleSheet, Pressable,Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppText from "@/src/shared/ui/components/Typography";
import LottieView from "lottie-react-native";
import BackIcon from "@/assets/icons/meals/backIcon.svg";

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

  useEffect(() => {
    // SIMULACIÓN: navegar a Result como si la IA hubiera respondido OK
    const q = new URLSearchParams();
    if (dateISO) q.set("dateISO", String(dateISO));
    if (mealType) q.set("mealType", String(mealType));

    // Pequeño delay opcional para permitir ver el spinner
    const DELAY_MS = 5000;
    const t = setTimeout(() => {
      router.replace(`/camera/result?${q.toString()}`);
    }, DELAY_MS);

    return () => clearTimeout(t);

    /**
     * =======================
     * TODO: Consumo real de IA
     * =======================
     *
     * Sugerido (sin compresión para precisión):
     *
     * // 1) SIN COMPRESIÓN (Precisión máxima)
     * //    Si igual necesitas manipular metadatos, hazlo sin cambiar calidad.
     * //    (ej. renombrar/normalizar orientación)
     *
     * // 2) SUBIR MULTIPART
     * const form = new FormData();
     * const res = await fetch(String(photoUri));
     * const blob = await res.blob();
     * form.append("file", blob as any, "meal.jpg");
     * form.append("dateISO", String(dateISO));
     * if (mealType) form.append("mealType", String(mealType));
     *
     * const controller = new AbortController();
     * const resp = await fetch(
     *   (process.env.EXPO_PUBLIC_API_BASE || "") + "/vision/analyze",
     *   { method: "POST", body: form, signal: controller.signal }
     * );
     *
     * if (!resp.ok) {
     *   // TODO: Manejo real de error (mostrar Alert/Toast + botón Reintentar que re-haga el POST)
     *   // Por ahora, navegar a Result igual o volver a la cámara:
     *   router.replace(`/camera/result?${q.toString()}`);
     *   return;
     * }
     *
     * const json = await resp.json();
     * // TODO: si devuelves resultId o det, pásalo por query:
     * // q.set("resultId", json.id);
     * // o q.set("det", encodeURIComponent(JSON.stringify(json)));
     * router.replace(`/camera/result?${q.toString()}`);
     */
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
          {/*<View style={styles.iconCircle}>*/}
        <LottieView
          // Asegúrate que el JSON exista en esta ruta
          source={require("@/assets/lottie/analisis.json")}
          autoPlay
          loop
          renderMode="AUTOMATIC"
          enableMergePathsAndroidForKitKatAndAbove
          style={styles.lottie}
        />
          {/*</View>*/}
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

const styles = StyleSheet.create({

  closeBtn: {
      position: "absolute", top: Platform.OS === "ios" ? 65 : 65, left: 30, zIndex: 10, color: "#151522"
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
 
  iconContainer: {
    marginTop: 244,
    alignItems: "center",
    marginBottom: 38,
  },
  iconCircle: {
    width: 114,
    height: 114,
    borderRadius: 48,
    backgroundColor: "rgba(0,196,140,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  lottie: {
    width: 230,
    height: 230,
  },

  title: {
    marginTop: 30, 
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    color: "#151522",
  },

  subtitle: {
    marginTop: 24,
    width: 357,
    maxWidth: 357,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#999999",
  },
  // Botón cancelar minimal
  cancelBtn: {
    marginTop: 28,
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  cancelText: {
    color: "#0B1220",
    fontWeight: "600",
  },
});
