import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppText from "@/src/shared/ui/components/Typography";

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
    const DELAY_MS = 600;
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
      <View style={styles.iconBubble} />
      <AppText style={styles.title}>Analizando tu comida…</AppText>
      <AppText style={styles.subtitle}>
        Estamos identificando los alimentos y calculando los macronutrientes
      </AppText>
      <ActivityIndicator size="large" />
      <AppText style={styles.hint}>Preparando y enviando la imagen…</AppText>

      <Pressable style={styles.cancelBtn} onPress={handleCancel}>
        <AppText style={styles.cancelText}>Cancelar</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, alignItems: "center", backgroundColor: "#fff" },
  iconBubble: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(47,204,172,0.12)", marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#0B1220" },
  subtitle: { fontSize: 14, color: "#98A1B3", marginBottom: 24, textAlign: "center", width: 260 },
  hint: { marginTop: 16, fontSize: 12, color: "#98A1B3" },
  cancelBtn: { marginTop: 20, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.06)" },
  cancelText: { color: "#0B1220", fontWeight: "600" },
});
