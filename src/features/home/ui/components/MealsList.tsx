import React from 'react';
import { View, Pressable, Text } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';
import { styles } from './styles';
import { useRouter } from 'expo-router';

import Flecha from '@/assets/icons/flehaIcon.svg';
import { useTheme } from '@/src/shared/styles/useTheme';
import { useSession } from '@/src/shared/hooks/useSession';
import { getMealsForDayFromServer, RawMealItem, subscribeMealsChanged } from '@/src/features/meals/infrastructure/mealsApi';

export default function MealsList({
  meals, onAdd, compact = false, rowH = 74, iconSize = 44, radius = 16, horizontalPad = 20,
}: {
  meals: { key: string; title: string; calories?: string | null; chipBg: string; iconColor?: string }[];
  onAdd: (k: string) => void;
  compact?: boolean;
  rowH?: number; iconSize?: number; radius?: number; horizontalPad?: number;
}) {
  const router = useRouter();

  const { colors } = useTheme();
  const [session] = useSession();

  // API-driven meals state (grouped keys breakfast/lunch/dinner) -> maps to the same shape expected by the UI
  const [apiMealsByKey, setApiMealsByKey] = React.useState<Record<string, { calories?: string | null; iconColor?: string }>>({});
  const [apiLoading, setApiLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const todayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch today's meals from backend and aggregate kcal by meal_t
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!session?.isAuthenticated || !session?.sub) return;
      setApiLoading(true);
      setApiError(null);
      try {
        const day = todayISO();
        const items: RawMealItem[] = await getMealsForDayFromServer(day, session.sub, session.accessToken ?? undefined);
        if (!mounted) return;
        // Aggregate kcal by meal_t (Desayuno, Almuerzo, Cena)
        const map: Record<string, { calories?: string | null; iconColor?: string }> = {};
        const keyFor = (mealT: string) => {
          const t = (mealT || '').toLowerCase();
          if (t.includes('desay')) return 'breakfast';
          if (t.includes('alm') || t.includes('almuerzo')) return 'lunch';
          if (t.includes('cen') || t.includes('cena')) return 'dinner';
          return 'snack';
        };

        const agg: Record<string, number> = {};
        items.forEach((it) => {
          const k = keyFor(it.meal_t);
          agg[k] = (agg[k] || 0) + (Number(it.kcal) || 0);
        });

        ['breakfast', 'lunch', 'dinner'].forEach((k) => {
          const kcal = agg[k] ?? 0;
          map[k] = { calories: kcal > 0 ? `${kcal} kcal` : '' };
        });

        setApiMealsByKey(map);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[MealsList] error fetching meals', err);
        setApiError(String(err ?? 'Error fetching meals'));
      } finally {
        if (mounted) setApiLoading(false);
      }
    }
    load();
    // subscribe for local meal-changed events so we can refresh only this widget
    const unsub = subscribeMealsChanged((p) => {
      try {
        const day = todayISO();
        // if payload specifies a day and it doesn't match today, ignore
        if (p?.day && p.day !== day) return;
        // if payload specifies patientId and it doesn't match current session, ignore
        if (p?.patientId && p.patientId !== session?.sub) return;
        // re-run load to refresh aggregated kcal
        void load();
      } catch (e) {
        // ignore
      }
    });
    return () => { mounted = false; };
  }, [session?.isAuthenticated, session?.sub, session?.accessToken]);

  const goToMeals = (mealKey?: string) => {
    const dateISO = todayISO();
    if (mealKey) {
      // Navigate to the meal detail for the selected meal on today's date.
      // Include a `from=home` flag so Meals can know it was opened from Home.
      router.push(`/(tabs)/meals/${mealKey}?dateISO=${encodeURIComponent(dateISO)}&from=home` as any);
    } else {
      // Always open the Meals tab with today's date when coming from Home.
      router.push(`/(tabs)/meals?dateISO=${encodeURIComponent(dateISO)}&from=home` as any);
    }
  };

  const goToCameraFor = (mealKey: string) => {
    const dateISO = todayISO();
    router.push(`/camera?dateISO=${encodeURIComponent(dateISO)}&mealType=${encodeURIComponent(mealKey)}`);
  };
  return (
    <View style={[styles.mealsWrapper, { paddingHorizontal: horizontalPad, marginTop: compact ? 30 : 40 }]}> 
      <View style={ [styles.mealsCard,
        { 
          padding: compact ? 20 : 30,  
          backgroundColor: colors.mealsCard 
        }
         ]}
        > 
        <View style={[styles.mealsHeader, { paddingBottom: compact ? 2 : 0 }]}> 
          <AppText variant="ag7" style={{ color: colors.subtext }}><Text>Comidas de Hoy</Text></AppText>
          <Pressable onPress={() => router.push(`/(tabs)/meals?dateISO=${encodeURIComponent(todayISO())}&from=home` as any)}>
            <AppText variant="ag9" style={{ color: colors.brandA }}><Text>Ver todas</Text></AppText>
          </Pressable>
        </View>

        <View style={{ marginTop: compact ? 8 : 12 }}>
          {meals.map(({ key, title, calories, chipBg }) => (
            <View
              key={key}
              style={[
                styles.mealRow,
                {
                  height: rowH,
                  paddingVertical: compact ? 12 : 14,
                  paddingHorizontal: compact ? 12 : 16,
                  borderRadius: radius,
                  marginBottom: compact ? 8 : 12,
                  backgroundColor: colors.mealRowBg 
                }
              ]}
            >
              <View
                style={[
                  styles.mealChip,
                  {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: Math.round(iconSize * 0.42),
                    marginRight: compact ? 12 : 16,
                    backgroundColor: chipBg
                  }
                ]}
              >
                {/* choose icon internally by meal key; icons are bundled locally */}
                {(() => {
                  const IconComp = key === 'lunch' ? LunchIcon : key === 'dinner' ? DinnerIcon : BreakfastIcon;
                  const iconColorToUse = (meals.find(m => m.key === key) as any)?.iconColor || colors.text;
                  return <IconComp width={Math.round(iconSize * 0.5)} height={Math.round(iconSize * 0.5)} color={iconColorToUse} />;
                })()}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="ag9" style={{ color: colors.text }} numberOfLines={1}>{title}</AppText>
                {/* prefer API value when available, otherwise fallback to passed `calories` */}
                {(() => {
                  const apiVal = apiMealsByKey[key]?.calories;
                  const display = apiVal !== undefined ? apiVal : calories;
                  const has = !!(display && String(display).trim() !== '');
                  return (
                    <AppText
                      variant="ag9"
                      style={{ color: has ? colors.brandA : colors.muted }}
                      numberOfLines={1}
                    >
                      <Text>{has ? String(display) : 'No registrada'}</Text>
                    </AppText>
                  );
                })()}
              </View>

              {/* right action: if API or prop has calories, show chevron (navigate to detail); else show + add button */}
              {(() => {
                const apiVal = apiMealsByKey[key]?.calories;
                const display = apiVal !== undefined ? apiVal : calories;
                const has = !!(display && String(display).trim() !== '');
                if (has) {
                  return (
                    <Pressable onPress={() => goToMeals(key)} style={[styles.arrowContainer, { width: 18, height: 18 }]}> 
                      <Flecha width={16} height={16} color={colors.backIcon}/>
                    </Pressable>
                  );
                }
                return (
                  <Pressable onPress={() => { if (onAdd) onAdd(key); goToCameraFor(key); }} style={[styles.addBtn, { backgroundColor: colors.addBtnBg }] }>
                    <AppText variant="ag7" style={{ color: colors.white }}><Text>+</Text></AppText>
                  </Pressable>
                );
              })()}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
