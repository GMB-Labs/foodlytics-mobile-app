// src/features/vision/ui/screens/CameraResult.tsx
import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Platform, Modal, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/src/shared/ui/components/Typography";
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";
import ChekIcon from "@/assets/icons/meals/chekIcon.svg";
import RedDeleteIcon from "@/assets/icons/meals/deleteIcon.svg"


type DetectionItem = { 
  name: string; 
  qty: number; 
  unit: string; 
  kcal: number; 
  p: number; 
  c: number; 
  f: number;
};

type DetectionResponse = {
  items: DetectionItem[];
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
};

// Development mock data
const DEV_MOCK_DATA: DetectionResponse = {
  totals: { kcal: 490, proteinG: 9, carbsG: 80, fatG: 20 },
  items: [
    { name: "Pan Integral", qty: 1, unit: "rebanada", kcal: 80, p: 4, c: 15, f: 1 },
    { name: "Plátano", qty: 2, unit: "unidad", kcal: 210, p: 3, c: 54, f: 1 },
    { name: "Aguacate", qty: 125, unit: "g", kcal: 200, p: 3, c: 11, f: 18 },
  ],
};

export default function CameraResult() {
  const params = useLocalSearchParams() as any;
  const router = useRouter();
  const todayISO = useTodayISO();

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
  const mealType = params?.mealType as string | undefined; // reservado para futuros flujos
  const det = params?.det as string | undefined;

  // Parse seguro del resultado IA si existe
  const data: DetectionResponse | null = useMemo(() => {
    if (!det) return null;
    try {
      return JSON.parse(decodeURIComponent(det));
    } catch {
      return null;
    }
  }, [det]);

  // displayData usa los datos reales si existen, o el mock en desarrollo para preview visual
  const displayData: DetectionResponse | null = data ?? (__DEV__ ? DEV_MOCK_DATA : null);

  // Estado local para manejar cantidades editables
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Estado local de items para permitir borrar/editar en UI sin mutar el mock
  const [items, setItems] = useState<DetectionItem[]>(() => displayData?.items ?? []);

  // Totales calculados a partir de los items actualmente en UI
  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.proteinG += it.p;
        acc.carbsG += it.c;
        acc.fatG += it.f;
        acc.kcal += it.kcal;
        return acc;
      },
      { proteinG: 0, carbsG: 0, fatG: 0, kcal: 0 }
    );
  }, [items]);

  // Inicializar/actualizar items y cantidades cuando cambian los datos mostrados
  useEffect(() => {
    setItems(displayData?.items ?? []);
  }, [displayData]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setQuantities({});
      return;
    }
    setQuantities(
      items.reduce((acc, item, idx) => {
        acc[idx] = item.qty;
        return acc;
      }, {} as Record<number, number>)
    );
  }, [items]);

  const handleIncrement = (idx: number) => {
    setQuantities(prev => ({ ...prev, [idx]: (prev[idx] ?? 0) + 1 }));
  };

  const handleDecrement = (idx: number) => {
    setQuantities(prev => ({
      ...prev,
      [idx]: Math.max(0, (prev[idx] ?? 0) - 1),
    }));
  };

  // Delete confirmation flow: prompt -> confirm/cancel
  const [deleteTarget, setDeleteTarget] = useState<{ idx: number; item: DetectionItem } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const promptDelete = (idx: number) => {
    const it = items[idx];
    if (!it) return;
    setDeleteTarget({ idx, item: it });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setItems(prev => prev.filter((_, i) => i !== deleteTarget.idx));
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Confirm modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simulated save - replace with real POST to your backend
  const performSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        dateISO,
        mealType: mealType ?? "",
        items: items.map((it) => ({ name: it.name, qty: it.qty, unit: it.unit, kcal: it.kcal, p: it.p, c: it.c, f: it.f })),
      };
      // TODO: replace with real fetch to backend, e.g. await fetch(...)
      await new Promise((r) => setTimeout(r, 300));
      setSaved(true);
      setShowSaveModal(false);
      // Navegar al CompleteScreen
      const q = new URLSearchParams();
      q.set("dateISO", dateISO);
      if (mealType) q.set("mealType", mealType);

      router.replace(`/camera/complete?${q.toString()}`);
    } catch (e) {
      // show error toast in real app
      console.error("save failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header con gradiente */}
      <LinearGradient colors={["#2FCCAC", "#24A88C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <AppText variant="ag3" style={styles.headerTitle}>
            Alimentos Detectados
          </AppText>
          <Pressable onPress={() => setShowCloseModal(true)} style={styles.closeButton}>
            <AppText style={styles.closeIcon}>✕</AppText>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Resumen Nutricional (basado en items locales) */}
      {items && items.length > 0 ? (
        <View style={styles.summaryContainer}>
          <AppText variant="ag7" style={styles.summaryTitle}>
            Resumen Nutricional
          </AppText>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Calorías
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: "#2FCCAC" }]}> 
                {totals.kcal}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Proteínas
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: "#2B7FFF" }]}> 
                {`${totals.proteinG}g`}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Carbohidratos
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: "#FF6900" }]}> 
                {`${totals.carbsG}g`}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Grasas
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: "#F0B100" }]}> 
                {`${totals.fatG}g`}
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.summaryContainer}>
          <AppText variant="ag9" style={{ color: "#667085" }}>
            Aún no hay datos de IA para mostrar. Puedes confirmar o regresar.
          </AppText>
        </View>
      )}

      {/* Lista de alimentos */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <View key={idx} style={styles.foodItem}>
              <View style={styles.foodHeader}>
                <View style={styles.foodInfo}>
                  <AppText variant="ag7" style={styles.foodName}>
                    {item.name}
                  </AppText>
                  <AppText variant="ag9" style={styles.foodMacros}>
                    {`${item.kcal} cal • ${item.p}g P • ${item.c}g C • ${item.f}g G`}
                  </AppText>
                </View>
                <Pressable onPress={() => promptDelete(idx)} style={styles.deleteButton}>
                  <RedDeleteIcon width={18} height={18} />
                </Pressable>
              </View>

              <View style={styles.quantityControl}>
                <Pressable onPress={() => handleDecrement(idx)} style={styles.quantityButton}>
                  <AppText style={styles.quantityButtonText}>−</AppText>
                </Pressable>

                <View style={styles.quantityInput}>
                  <TextInput
                    style={styles.input}
                    value={String(quantities[idx] ?? item.qty)}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      setQuantities(prev => ({ ...prev, [idx]: Number.isFinite(num) ? num : 0 }));
                    }}
                  />
                  <AppText variant="ag10" style={styles.unitText}>
                    {item.unit}
                  </AppText>
                </View>

                <Pressable onPress={() => handleIncrement(idx)} style={styles.quantityButton}>
                  <AppText style={styles.quantityButtonText}>+</AppText>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={{ marginTop: 16, paddingHorizontal: 41 }}>
            <AppText variant="ag9" style={{ color: "#667085" }}>
              No se han detectado alimentos.
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Botón fijo en el fondo */}
      <View style={styles.footerContainer}>
        <Pressable onPress={() => setShowSaveModal(true)} style={styles.confirmButton}>
          <ChekIcon width={16} height={16} style={{ marginRight: 8 }} />
          <AppText variant="ag9" style={styles.confirmButtonText}>
            Guardar Comida
          </AppText>
        </Pressable>
      </View>

      {/* Save confirmation modal */}
      <Modal visible={showSaveModal} transparent animationType="fade" onRequestClose={() => setShowSaveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <AppText variant="ag6" style={{ marginBottom: 8 }}>¿Confirmar guardado?</AppText>
            <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
              Una vez guardada, la comida no podrá ser editada ni borrada. ¿Deseas continuar?
            </AppText>

            <View style={{ maxHeight: 220 }}>
              <ScrollView>
                {items.map((it, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                    <AppText variant="ag9">{it.name}</AppText>
                    <AppText variant="ag9">{quantities[i] ?? it.qty} {it.unit}</AppText>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pressable style={styles.modalButton} onPress={() => setShowSaveModal(false)}>
                <AppText variant="ag9" style={{ color: '#6B7280' }}>Cancelar</AppText>
              </Pressable>
              <Pressable style={[styles.modalButton, { marginLeft: 12 }]} onPress={performSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#2FCCAC" /> : <AppText variant="ag9" style={{ color: '#2FCCAC' }}>Confirmar</AppText>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Close confirmation modal (header X) */}
      <Modal visible={showCloseModal} transparent animationType="fade" onRequestClose={() => setShowCloseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <AppText variant="ag6" style={{ marginBottom: 8 }}>¿No quieres subir la comida?</AppText>
            <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
              Si sales ahora, los datos detectados no se guardarán. ¿Deseas salir?
            </AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable style={styles.modalButton} onPress={() => setShowCloseModal(false)}>
                <AppText variant="ag9" style={{ color: '#6B7280' }}>Volver</AppText>
              </Pressable>
              <Pressable style={[styles.modalButton, { marginLeft: 12 }]} onPress={() => router.back()}>
                <AppText variant="ag9" style={{ color: '#EF4444' }}>Salir</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal (per-card) */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={handleCancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <AppText variant="ag6" style={{ marginBottom: 8 }}>Eliminar elemento</AppText>
            <AppText variant="ag9" style={{ color: '#6B7280', marginBottom: 12 }}>
              ¿Estás seguro que quieres eliminar{' '}
              <AppText variant="ag9" style={{ fontFamily: 'Poppins-Bold', color: '#6B7280' }}>
                {deleteTarget?.item.name}
              </AppText>
              ? Esta acción quitará el alimento de la detección.
            </AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable style={styles.modalButton} onPress={handleCancelDelete}>
                <AppText variant="ag9" style={{ color: '#6B7280' }}>Cancelar</AppText>
              </Pressable>
              <Pressable style={[styles.modalButton, { marginLeft: 12 }]} onPress={handleConfirmDelete}>
                <AppText variant="ag9" style={{ color: '#EF4444' }}>Eliminar</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  header: {
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Regular",
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "400",
  },
  summaryContainer: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#EFFAF8",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  summaryTitle: {
    color: "#1A1A1A",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  summaryLabel: {
    color: "#4A5565",
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: "Poppins-Regular",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 41,
  },
  scrollContent: {
    marginHorizontal: -20,
    paddingTop: 21,
    paddingBottom: 20,
    gap: 12,
  },
  foodItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 17,
    gap: 12,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    color: "#1A1A1A",
  },
  foodMacros: {
    color: "#4A5565",
  },
  deleteButton: {
    padding: 4,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    color: "#1A1A1A",
    fontFamily: "Poppins-Regular",
  },
  quantityInput: {
    flex: 1,
    gap: 4,
  },
  input: {
    height: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1A1A1A",
    textAlign: "center",
  },
  unitText: {
    color: "#6A7282",
    textAlign: "center",
  },
  footerContainer: {
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 30,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 41,
    paddingVertical: 17,
  },
  confirmButton: {
    backgroundColor: "#2FCCAC",
    borderRadius: 20,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
