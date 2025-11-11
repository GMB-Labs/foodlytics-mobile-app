import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '@/src/shared/ui/components/Typography';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import { getAllMeals } from '@/src/features/meals/infrastructure/mealsApi';
import BackIcon from '@/assets/icons/backIcon.svg';
import DinnerIcon from '@/assets/icons/meals/DdinnerIcon.svg';
import LunchIcon from '@/assets/icons/meals/DlunchIcon.svg';
import SnackIcon from '@/assets/icons/meals/DsnackIcon.svg';
import BreakfastIcon from '@/assets/icons/meals/DbreakIcon.svg';

interface MealItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
  time?: string;
  qtyLabel?: string; // optional quantity/description
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Aperitivo',
};

const DEFAULT_MEAL = 'breakfast';

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mealId, items: itemsParam } = params as { mealId?: string; items?: string };
  const dateISO = (params as any)?.dateISO ?? useTodayISO();

  const [items, setItems] = useState<MealItem[]>(() => {
    try {
      if (!itemsParam) return [];
      const parsed = JSON.parse(itemsParam as string);
      return Array.isArray(parsed) ? (parsed as MealItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let mounted = true;
    if (!itemsParam) {
      // fetch the single GET and pick items for this date/meal
      getAllMeals()
        .then((all) => {
          if (!mounted) return;
          const byDate = all[String(dateISO)] ?? {};
          const found = byDate[mealId ?? ''] ?? [];
          setItems(found as MealItem[]);
        })
        .catch(() => { if (mounted) setItems([]); });
    }
    return () => { mounted = false; };
  }, [itemsParam, mealId, dateISO]);

  // If the route provides `items` (Meals -> Detail), update items state whenever
  // that param changes. This fixes the bug where Detail kept showing a previous
  // view's items (for example coming from Home) when navigated to from Meals.
  useEffect(() => {
    if (!itemsParam) return;
    try {
      const parsed = JSON.parse(itemsParam as string);
      setItems(Array.isArray(parsed) ? (parsed as MealItem[]) : []);
    } catch {
      setItems([]);
    }
  // no-op: items are updated from params
  }, [itemsParam]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.protein += it.protein;
        acc.carbs += it.carbs;
        acc.fats += it.fats;
        acc.kcal += it.kcal;
        return acc;
      },
      { protein: 0, carbs: 0, fats: 0, kcal: 0 }
    );
  }, [items]);

  const label = MEAL_LABELS[mealId ?? 'breakfast'] ?? mealId ?? 'Comida';

  // UI text constants to avoid raw-text linting inside JSX
  const TXT_VOLVER = 'Volver';
  const TXT_TOTAL_CAL = 'Total de calorías';
  const TXT_KCAL = 'kcal';
  const TXT_ALIMENTOS = 'Alimentos registrados';
  const CHEVRON_CHAR = '‹';
  const TXT_PROTEINAS = 'Proteínas';
  const TXT_CARBOS = 'Carbos';
  const TXT_GRASAS = 'Grasas';

  const headerDateText = useMemo(() => {
    try {
      const [y, m, d] = (dateISO ?? '').split('-').map((n: string) => parseInt(n, 10));
      if (!y || !m || !d) return dateISO;
      const time = items[0]?.time;
      const [hh, mm] = (time ?? '00:00').split(':').map((n: string) => parseInt(n, 10));
      const dateObj = new Date(y, (m - 1), d, hh ?? 0, mm ?? 0);
      const weekday = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
      const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
      const dayNum = dateObj.getDate();
      const timePart = time ? ` - ${String(hh ?? 0).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')}` : '';
      return `${weekday}, ${dayNum} de ${monthName}${timePart}`;
    } catch {
      return items[0]?.time ? `${dateISO} - ${items[0].time}` : `${dateISO}`;
    }
  }, [dateISO, items]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2FCCAC', '#24A88C']} style={styles.header}>
        <Pressable
          onPress={() => router.push(`/(tabs)/meals?dateISO=${encodeURIComponent(dateISO)}` as any)}
          style={styles.backRow}
        >
          <BackIcon width={20} height={20} />
          <AppText style={styles.backText}>{TXT_VOLVER}</AppText>
        </Pressable>

        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircleHeader}>
            {/* Render the icon for the meal type */}
            {(() => {
              const map: Record<string, React.ComponentType<any>> = {
                breakfast: BreakfastIcon,
                lunch: LunchIcon,
                dinner: DinnerIcon,
                snack: SnackIcon,
              };
              const Icon = map[mealId ?? DEFAULT_MEAL] ?? BreakfastIcon;
              return <Icon width={28} height={28} />;
            })()}
          </View>
          <View>
            <AppText variant="ag3" style={styles.headerTitle}>{label}</AppText>
            <AppText variant="ag9" style={styles.headerSubtitle}>{headerDateText}</AppText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <AppText style={styles.summaryLabel}>{TXT_TOTAL_CAL}</AppText>
          <AppText variant="ag1" style={styles.summaryKcal}>{totals.kcal}</AppText>
          <AppText style={styles.summaryKcalLabel}>{TXT_KCAL}</AppText>

          <View style={styles.macrosRowLarge}>
            <View style={[styles.macroCardLarge, { backgroundColor: '#EFF6FF' }]}>
              <AppText style={[styles.macroValueLarge, { color: '#2B7FFF' }]}>{`${totals.protein}g`}</AppText>
              <AppText style={styles.macroLabelSmall}>{TXT_PROTEINAS}</AppText>
            </View>
            <View style={[styles.macroCardLarge, { backgroundColor: '#FFF7ED' }]}>
              <AppText style={[styles.macroValueLarge, { color: '#FF6900' }]}>{`${totals.carbs}g`}</AppText>
              <AppText style={styles.macroLabelSmall}>{TXT_CARBOS}</AppText>
            </View>
            <View style={[styles.macroCardLarge, { backgroundColor: '#FEFCE8' }]}>
              <AppText style={[styles.macroValueLarge, { color: '#F0B100' }]}>{`${totals.fats}g`}</AppText>
              <AppText style={styles.macroLabelSmall}>{TXT_GRASAS}</AppText>
            </View>
          </View>
        </View>

  <AppText variant="ag7" style={styles.sectionTitle}>{TXT_ALIMENTOS}</AppText>

        {items.map((it) => (
          <View key={it.id} style={styles.itemCard}>
            <View style={styles.itemRowTop}>
              <View style={styles.itemLeft}>
                <AppText style={styles.itemName}>{it.name}</AppText>
                {it.qtyLabel && <AppText style={styles.itemQty}>{it.qtyLabel}</AppText>}
              </View>
              <View style={styles.itemCenter}>
                <AppText style={styles.itemTime}>{it.time}</AppText>
              </View>
              <View style={styles.itemRight}>
                <AppText style={styles.itemKcal}>{it.kcal}</AppText>
                <AppText style={styles.itemKcalLabel}>{TXT_KCAL}</AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemMacrosRow}>
              <View style={styles.macroSmallCol}>
                <AppText style={[styles.macroSmallValue, { color: '#2B7FFF' }]}>{`${it.protein}g`}</AppText>
                <AppText style={styles.macroSmallLabel}>{TXT_PROTEINAS}</AppText>
              </View>
              <View style={styles.macroSmallCol}>
                <AppText style={[styles.macroSmallValue, { color: '#FF6900' }]}>{`${it.carbs}g`}</AppText>
                <AppText style={styles.macroSmallLabel}>{TXT_CARBOS}</AppText>
              </View>
              <View style={styles.macroSmallCol}>
                <AppText style={[styles.macroSmallValue, { color: '#F0B100' }]}>{`${it.fats}g`}</AppText>
                <AppText style={styles.macroSmallLabel}>{TXT_GRASAS}</AppText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backText: { color: '#FFFFFF', marginLeft: 4 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircleHeader: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', marginTop: 4 },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120, gap: 16 },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  summaryLabel: { color: '#4A5565' },
  summaryKcal: { color: '#2FCCAC', fontSize: 36, lineHeight: 40, fontWeight: '600' },
  summaryKcalLabel: { color: '#6A7282' },
  macrosRowLarge: { flexDirection: 'row', gap: 8, marginTop: 8 },
  macroCardLarge: { flex: 1, borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  macroValueLarge: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  macroLabelSmall: { color: '#4A5565', fontSize: 12 },
  sectionTitle: { marginTop: 4, color: '#364153' },
  itemCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  itemRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flex: 1 },
  itemCenter: { width: 100, alignItems: 'center' },
  itemRight: { width: 80, alignItems: 'flex-end' },
  itemName: { color: '#1E2939', fontSize: 16 },
  itemQty: { color: '#6A7282', fontSize: 14, marginTop: 6 },
  itemTime: { color: '#6A7282', fontSize: 12 },
  itemKcal: { color: '#2FCCAC', fontSize: 18, fontWeight: '600' },
  itemKcalLabel: { color: '#6A7282', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  itemMacrosRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroSmallCol: { flex: 1, alignItems: 'center' },
  macroSmallValue: { fontSize: 14, fontWeight: '600' },
  macroSmallLabel: { color: '#6A7282', fontSize: 12, marginTop: 4 },
});
