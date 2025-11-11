// src/features/vision/ui/screens/CameraResult.tsx
import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AppText from "@/src/shared/ui/components/Typography";
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";

type DetectionItem = { name: string; qty: number; unit: string; kcal: number; p: number; c: number; f: number };
type DetectionResponse = {
  items: DetectionItem[];
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
};

export default function CameraResult() {
  const params = useLocalSearchParams() as any;
  const router = useRouter();
  const todayISO = useTodayISO();

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
  const mealType = params?.mealType as string | undefined;
  const det = params?.det as string | undefined; // opcional

  // Parse seguro del resultado IA si existe
  const data: DetectionResponse | null = useMemo(() => {
    if (!det) return null;
    try {
      return JSON.parse(decodeURIComponent(det));
    } catch {
      return null;
    }
  }, [det]);

  const onConfirm = () => {
    // TODO: Persistir items detectados si data existe.
    // Si falta mealType en flujo de acciones rápidas, aquí abrir selector de tipo.
    router.push(`/(tabs)/meals?dateISO=${encodeURIComponent(dateISO)}` as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
        <AppText variant="ag7">Resultado IA</AppText>
        <AppText variant="ag9" style={{ marginTop: 8 }}>Fecha: {dateISO}</AppText>

        {mealType ? (
          <AppText variant="ag9" style={{ marginTop: 6 }}>Tipo: {mealType}</AppText>
        ) : (
          <AppText variant="ag9" style={{ marginTop: 6, color: "#D97706" }}>
            Tipo no especificado, en el flujo de acciones rápidas se deberá pedir aquí
          </AppText>
        )}

        {/* Si hay datos de IA, mostramos tarjetas y lista */}
        {data ? (
          <>
            <AppText style={styles.header}>Alimentos detectados</AppText>
            <View style={styles.summary}>
              <View style={styles.card}><AppText>Calorías{"\n"}{data.totals.kcal} cal</AppText></View>
              <View style={styles.card}><AppText>Proteínas{"\n"}{data.totals.proteinG} g</AppText></View>
              <View style={styles.card}><AppText>Carbohidratos{"\n"}{data.totals.carbsG} g</AppText></View>
              <View style={styles.card}><AppText>Grasas{"\n"}{data.totals.fatG} g</AppText></View>
            </View>

            {data.items.map((it, idx) => (
              <View key={idx} style={styles.item}>
                <AppText style={{ fontWeight: "700" }}>{it.name}</AppText>
                <AppText style={{ color: "#667085" }}>
                  {it.kcal} cal • {it.p}g P • {it.c}g C • {it.f}g G
                </AppText>
                <AppText style={{ color: "#667085", marginTop: 4 }}>
                  {it.qty} {it.unit}
                </AppText>
              </View>
            ))}
          </>
        ) : (
          <View style={{ marginTop: 16 }}>
            <AppText variant="ag9" style={{ color: "#667085" }}>
              Aún no hay datos de IA para mostrar. Puedes confirmar o regresar.
            </AppText>
          </View>
        )}

        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <AppText variant="ag7" style={{ color: "#FFFFFF" }}>Confirmar</AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { fontSize: 18, fontWeight: "800", marginTop: 16, marginBottom: 12 },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16, marginTop: 4 },
  card: { padding: 12, borderRadius: 12, backgroundColor: "rgba(47,204,172,0.10)" },
  item: { padding: 14, borderRadius: 12, backgroundColor: "#F8FAFC", marginBottom: 10 },
  confirmBtn: { marginTop: 24, backgroundColor: "#2B7FFF", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
