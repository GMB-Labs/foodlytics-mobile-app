// src/features/vision/ui/screens/CameraResult.tsx
import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Platform, Modal, ActivityIndicator, Alert } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getDetection } from "@/src/features/vision/infrastructure/detectCache";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/src/shared/ui/components/Typography";
import { useTheme } from '@/src/shared/styles/useTheme';
import { useTodayISO } from "@/src/shared/hooks/useTodayISO";
import { useSession } from '@/src/shared/hooks/useSession';
import { notifyMealsChanged } from '@/src/features/meals/infrastructure/mealsApi';
import { postJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import ChekIcon from "@/assets/icons/meals/chekIcon.svg";
import RedDeleteIcon from "@/assets/icons/meals/deleteIcon.svg"
import SaveConfirmationModal from "@/src/features/vision/ui/components/result/SaveConfirmationModal";
import CloseConfirmationModal from "@/src/features/vision/ui/components/result/CloseConfirmationModal";
import DeleteConfirmationModal from "@/src/features/vision/ui/components/result/DeleteConfirmationModal";
import AperitiveIcon from "@/assets/icons/vision/aperitiveIcon.svg";
import BreakfastIcon from "@/assets/icons/vision/breakIcon.svg";
import DinnerIcon from "@/assets/icons/vision/dinnerIcon.svg";
import LunchIcon from "@/assets/icons/vision/lunchIcon.svg";

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
  dishName?: string;
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
  const [session] = useSession();

  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  const dateISO = (params?.dateISO as string | undefined) ?? todayISO;
  const mealType = params?.mealType as string | undefined; // reservado para futuros flujos
  const det = params?.det as string | undefined;
  const resultId = params?.resultId as string | undefined;

  // Parse seguro del resultado IA si existe
  const data: DetectionResponse | null = useMemo(() => {
    // Prefer cached result via resultId (short id), fallback to det query if present
    if (resultId) {
      try {
        const cached = getDetection(resultId);
        if (cached) return cached;
      } catch (e) {
        console.warn("[CameraResult] failed to read cached detection", e);
      }
    }
    if (!det) return null;
    try {
      return JSON.parse(decodeURIComponent(det));
    } catch {
      return null;
    }
  }, [det, resultId]);

  useEffect(() => {
    if (data) console.log("[CameraResult] decoded det:", { items: data.items?.length ?? 0, totals: data.totals, dishName: data.dishName });
    else console.log("[CameraResult] no det decoded (det param missing or invalid)");
  }, [data]);

  // If backend explicitly reports no detection (no items and totals all zero or a specific dishName),
  // redirect to the no-detection screen.
  useEffect(() => {
    try {
      if (!data) return;
      const itemsCount = Array.isArray(data.items) ? data.items.length : 0;
      const totals = data.totals ?? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };
      const allTotalsZero = Number(totals.kcal ?? 0) === 0 && Number(totals.proteinG ?? 0) === 0 && Number(totals.carbsG ?? 0) === 0 && Number(totals.fatG ?? 0) === 0;
      const dishIndicatesUnknown = String(data.dishName ?? "").toLowerCase().includes("no se puede identificar") || String(data.dishName ?? "").toLowerCase().includes("no identificado");
      if (itemsCount === 0 && allTotalsZero) {
        console.log("[CameraResult] detection empty — redirecting to no-detection screen", { itemsCount, totals, dishName: data.dishName });
        const q = new URLSearchParams();
        q.set("dateISO", dateISO);
        router.replace(`/camera/no-detection?${q.toString()}` as any);
      } else if (dishIndicatesUnknown && itemsCount === 0) {
        console.log("[CameraResult] dish name indicates unknown — redirecting to no-detection", { dishName: data.dishName });
        const q = new URLSearchParams();
        q.set("dateISO", dateISO);
        router.replace(`/camera/no-detection?${q.toString()}` as any);
      }
    } catch (e) {
      // swallow — don't block UI
      console.warn('[CameraResult] error checking no-detection condition', e);
    }
  }, [data, dateISO, router]);

  // displayData usa los datos reales si existen, o el mock en desarrollo para preview visual
  const [overrideData, setOverrideData] = useState<DetectionResponse | null>(null);
  const displayData: DetectionResponse | null = overrideData ?? data ?? (__DEV__ ? DEV_MOCK_DATA : null);

  // Estado local para manejar cantidades editables
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Meal type selection: prefer param, but allow user to pick if not provided (quick actions flow)
  const [selectedMealType, setSelectedMealType] = useState<string | undefined>(mealType);

  // Estado local de items para permitir borrar/editar en UI sin mutar el mock
  const [items, setItems] = useState<DetectionItem[]>(() => displayData?.items ?? []);

  // Totales calculados a partir de los items actualmente en UI (computed below)

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

  // If user modifies quantities via + / - or input, we compute derived item macros
  // from the base detected items so the UI updates macros and totals live.
  // computedItems is used for rendering and totals.
  const computedItems = React.useMemo(() => {
    return items.map((it, idx) => {
      const q = quantities[idx] ?? it.qty;
      const baseQty = it.qty || 1;
      const kcalPer = baseQty ? Number(it.kcal ?? 0) / baseQty : 0;
      const pPer = baseQty ? Number(it.p ?? 0) / baseQty : 0;
      const cPer = baseQty ? Number(it.c ?? 0) / baseQty : 0;
      const fPer = baseQty ? Number(it.f ?? 0) / baseQty : 0;

      const newKcal = kcalPer * q;
      const newP = pPer * q;
      const newC = cPer * q;
      const newF = fPer * q;

      return {
        ...it,
        qty: q,
        kcal: Math.round(newKcal),
        p: Math.round(newP * 100) / 100,
        c: Math.round(newC * 100) / 100,
        f: Math.round(newF * 100) / 100,
      } as DetectionItem;
    });
  }, [items, quantities]);

  const totals = React.useMemo(() => {
    return computedItems.reduce(
      (acc, it) => {
        acc.proteinG += it.p;
        acc.carbsG += it.c;
        acc.fatG += it.f;
        acc.kcal += it.kcal;
        return acc;
      },
      { proteinG: 0, carbsG: 0, fatG: 0, kcal: 0 }
    );
  }, [computedItems]);

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
    if (computedItems.length === 0) return;
    setSaving(true);
    try {
      // Map local/param mealType values (english/spanish/keys) to server-expected enum
      function mapToServerMealT(mt?: string | null) {
        if (!mt) return '';
        const t = String(mt).toLowerCase();
        if (['breakfast', 'desayuno'].includes(t)) return 'Desayuno';
        if (['lunch', 'almuerzo', 'comida'].includes(t)) return 'Almuerzo';
        if (['dinner', 'cena'].includes(t)) return 'Cena';
        // Server expects 'Snack' (English) for snack values
        if (['snack', 'aperitivo', 'aperitivos', 'snacks'].includes(t)) return 'Snack';
        // If it's already one of the expected server labels, normalize capitalization
        if (['desayuno', 'almuerzo', 'cena', 'snack'].includes(t)) {
          return t.charAt(0).toUpperCase() + t.slice(1);
        }
        return String(mt);
      }

      const mealName = displayData?.dishName ?? computedItems[0]?.name ?? 'Comida detectada';
      const meal_t = mapToServerMealT(selectedMealType ?? '');

      const payload = {
        name: mealName,
        patient_id: session?.sub,
        meal_t,
        kcal: totals.kcal,
        protein: totals.proteinG,
        carbs: totals.carbsG,
        fats: totals.fatG,
      };

      console.log('[CameraResult] registering meal payload', { payload });
      console.log('[CameraResult] session preview', { sub: session?.sub, hasAccessToken: !!session?.accessToken });

      const url = '/api/v1/meals/register-meal';
      const res = await postJSON(url, payload, { baseUrl: API_BASE_URL, token: session?.accessToken ?? undefined });

      console.log('[CameraResult] register-meal response', { ok: true, preview: res && typeof res === 'object' ? Object.keys(res).slice(0,5) : res });

      setSaved(true);
      setShowSaveModal(false);

      try {
        notifyMealsChanged({ patientId: session?.sub, day: dateISO });
      } catch (e) {
        console.warn('[CameraResult] notifyMealsChanged failed', e);
      }

      const q = new URLSearchParams();
      q.set('dateISO', dateISO);
      if (selectedMealType) q.set('mealType', selectedMealType);
      router.replace(`/camera/complete?${q.toString()}`);
    } catch (e: any) {
      // postJSON throws an Error with `status` and `body` properties when available
      console.error('[CameraResult] save failed', e);
      try {
        const status = e?.status;
        const body = e?.body;
        let bodyStr = '';
        try {
          bodyStr = body && typeof body === 'object' ? JSON.stringify(body, null, 2) : String(body ?? '');
        } catch (s) {
          bodyStr = String(body ?? '');
        }
        console.error('[CameraResult] save failed details', { status, bodyStr });
        // Show a user-friendly alert in the emulator with validation details
        Alert.alert('Error al guardar', `Código: ${status}\n${bodyStr.slice(0, 1000)}`);
      } catch (inner) {
        // ignore logging errors
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header con gradiente */}
      <LinearGradient colors={[theme.gradient?.primaryFrom ?? '#2FCCAC', theme.gradient?.primaryTo ?? '#24A88C']} style={styles.header}>
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
      {computedItems && computedItems.length > 0 ? (
        <View style={styles.summaryContainer}>
      {displayData?.dishName ? (
            <AppText variant="ag8" style={styles.summaryTitle}>
              {displayData.dishName}
            </AppText>
          ) : null}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Calorías
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: '#2FCCAC' }]}> 
                {totals.kcal}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Proteínas
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color:  '#2B7FFF' }]}> 
                {`${totals.proteinG}g`}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Carbohidratos
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color:  '#FF6900' }]}> 
                {`${totals.carbsG}g`}
              </AppText>
            </View>
            <View style={styles.summaryCard}>
              <AppText variant="ag10" style={styles.summaryLabel}>
                Grasas
              </AppText>
              <AppText variant="ag5" style={[styles.summaryValue, { color: '#F0B100' }]}> 
                {`${totals.fatG}g`}
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.summaryContainer}>
          <AppText variant="ag9" style={{ color: theme.subtext ?? '#667085' }}>
            Aún no hay datos de IA para mostrar. Puedes confirmar o regresar.
          </AppText>
        </View>
      )}

      {/* Lista de alimentos */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {computedItems && computedItems.length > 0 ? (
          computedItems.map((item, idx) => (
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
            <AppText variant="ag9" style={{ color: theme.subtext ?? '#667085' }}>
              No se han detectado alimentos.
            </AppText>
          </View>
        )}
      {/* Meal type selector for quick-actions flow (if no mealType param provided) */}
      {!mealType ? (
        <View style={styles.mealTypeSelectorContainer}>
          <AppText variant="ag9" style={{ marginBottom: 8, color: theme.text ?? '#374151' }}>Selecciona el tipo de comida</AppText>
          <View style={styles.mealTypeButtonsRow}>
            <Pressable
              style={[styles.mealBtn, selectedMealType === 'breakfast' && styles.mealBtnSelected]}
              onPress={() => setSelectedMealType('breakfast')}
              accessibilityLabel="Desayuno"
            >
              <BreakfastIcon width={24} height={24} color={selectedMealType === 'breakfast' ? (theme.onBrand ?? '#FFFFFF') : (theme.text ?? '#111827')} />
            </Pressable>

            <Pressable
              style={[styles.mealBtn, selectedMealType === 'lunch' && styles.mealBtnSelected]}
              onPress={() => setSelectedMealType('lunch')}
              accessibilityLabel="Almuerzo"
            >
              <LunchIcon width={24} height={24} color={selectedMealType === 'lunch' ? (theme.onBrand ?? '#FFFFFF') : (theme.text ?? '#111827')} />
            </Pressable>

            <Pressable
              style={[styles.mealBtn, selectedMealType === 'dinner' && styles.mealBtnSelected]}
              onPress={() => setSelectedMealType('dinner')}
              accessibilityLabel="Cena"
            >
              <DinnerIcon width={24} height={24} color={selectedMealType === 'dinner' ? (theme.onBrand ?? '#FFFFFF') : (theme.text ?? '#111827')} />
            </Pressable>

            <Pressable
              style={[styles.mealBtn, selectedMealType === 'snack' && styles.mealBtnSelected]}
              onPress={() => setSelectedMealType('snack')}
              accessibilityLabel="Aperitivo"
            >
              <AperitiveIcon width={24} height={24} color={selectedMealType === 'snack' ? (theme.onBrand ?? '#FFFFFF') : (theme.text ?? '#111827')} />
            </Pressable>
          </View>
        </View>
      ) : null}

      </ScrollView>

      {/* Botón fijo en el fondo */}
      <View style={styles.footerContainer}>
        <Pressable onPress={() => { if (selectedMealType) setShowSaveModal(true); }} style={[styles.confirmButton, !selectedMealType && styles.confirmButtonDisabled]} disabled={!selectedMealType}>
          <ChekIcon width={16} height={16} style={{ marginRight: 8 }} />
          <AppText variant="ag9" style={styles.confirmButtonText}>
            Guardar Comida
          </AppText>
        </Pressable>
      </View>

      <SaveConfirmationModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={performSave}
        saving={saving}
        items={computedItems}
        quantities={quantities}
      />

      <CloseConfirmationModal visible={showCloseModal} onClose={() => setShowCloseModal(false)} onConfirm={() => router.back()} />

      <DeleteConfirmationModal visible={showDeleteModal} targetName={deleteTarget?.item.name} onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
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
    container: { flex: 1, backgroundColor: themeColors.bg ?? '#FFFFFF'},
    header: { paddingTop: 64,paddingBottom: 16, paddingHorizontal: 24,},
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',},
    headerTitle: { color: themeColors.onPrimary ?? '#FFFFFF', fontFamily: 'Poppins-Regular' },
    closeButton: { width: 24,height: 24,alignItems: 'center',justifyContent: 'center'},
    closeIcon: {color: themeColors.onPrimary ?? '#FFFFFF',fontSize: 20,fontWeight: '400'},
    summaryContainer: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: themeColors.celeste ?? '#EFFAF8',
      marginHorizontal: 20,
      marginTop: 15,
      marginBottom: 4,
    },
    summaryTitle: {
      color: themeColors.text ?? '#1A1A1A',
      marginBottom: 12,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    summaryCard: {
      width: '47%',
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 20,
      paddingTop: 12,
      paddingHorizontal: 12,
      paddingBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.card ?? '#FFFFFF',
    },
    summaryLabel: {
      color: themeColors.subtext ?? '#4A5565',
      marginBottom: 4,
    },
    summaryValue: {
      fontFamily: 'Poppins-Regular',
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
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: themeColors.border ?? '#E5E7EB',
      padding: 17,
      gap: 12,
    },
    foodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    foodInfo: {
      flex: 1,
      gap: 4,
    },
    foodName: {
      color: themeColors.text ?? '#1A1A1A',
    },
    foodMacros: {
      color: themeColors.subtext ?? '#4A5565',
    },
    deleteButton: {
      padding: 4,
    },
    quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quantityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.addvtnVision ?? '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityButtonText: {
      fontSize: 20,
      color: themeColors.text ?? '#1A1A1A',
      fontFamily: 'Poppins-Regular',
    },
    quantityInput: {
      flex: 1,
      gap: 4,
    },
    input: {
      height: 40,
      backgroundColor: themeColors.addvtnVision2 ?? '#F9FAFB',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: themeColors.text ?? '#1A1A1A',
      textAlign: 'center',
    },
    unitText: {
      color: themeColors.subtext ?? '#6A7282',
      textAlign: 'center',
    },
    footerContainer: {
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 32 : 30,
      gap: 12,
      backgroundColor: themeColors.bg ?? '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: themeColors.border ?? '#E5E7EB',
      paddingHorizontal: 41,
      paddingVertical: 17,
    },
    confirmButton: {
      backgroundColor: themeColors.addBtnBg ?? '#2FCCAC',
      borderRadius: 20,
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonText: {
      color: themeColors.onBrand ?? '#FFFFFF',
      fontFamily: 'Poppins-Medium',
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
      backgroundColor: themeColors.card ?? 'white',
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
    mealTypeSelectorContainer: {
      paddingHorizontal: 20,
      marginTop: 12,
      marginBottom: 6,
    },
    mealTypeButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    mealBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.border ?? '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
    },
    mealBtnSelected: {
      backgroundColor: themeColors.addBtnBg ?? '#2FCCAC',
      borderColor: themeColors.addBtnBg ?? '#2FCCAC',
    },
    mealBtnText: {
      color: themeColors.backIcon ?? '#111827',
      fontFamily: 'Poppins-Regular',
    },
    mealBtnTextSelected: {
      color:  '#FFFFFF',
      fontFamily: 'Poppins-Medium',
    },
    confirmButtonDisabled: {
      backgroundColor: themeColors.addBtnBgdisable ?? '#CBD5E1',
    },
  });
}
