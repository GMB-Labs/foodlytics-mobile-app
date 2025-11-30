import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions, RefreshControl, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AppText from '@/src/shared/ui/components/Typography';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import MealCard from '../components/MealCard';
import { getAllMeals, getMealsForDayFromServer, RawMealItem } from '@/src/features/meals/infrastructure/mealsApi';
import { useSession } from '@/src/shared/hooks/useSession';
import NativeDatePicker from '../components/NativeDatePicker';
import { useTheme } from '@/src/shared/styles/useTheme';

// SVG Icons
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';
import SnackIcon from '@/assets/icons/SnackIcon.svg';

// Inline chevron icons
function ChevronLeft({ color = '#4A5565' }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 15L7.5 10L12.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight({ color = '#4A5565' }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path d="M7.5 15L12.5 10L7.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Helper functions
function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateFromISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function prettyDate(d: Date, locale = 'es-ES') {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString(locale, options);
}

// Tipos para las comidas en UI
type MealUIItem = {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
  time?: string;
  raw: RawMealItem;
};

type MealsByKey = Record<'breakfast' | 'lunch' | 'dinner' | 'snack', MealUIItem[]>;

// Helper para mapear la respuesta cruda a la estructura por tipo de comida
function mapMealsByKey(raw: RawMealItem[]): MealsByKey {
  const mapKey = (meal_t?: string) => {
    if (!meal_t) return 'snack';
    const t = meal_t.toLowerCase();
    if (t.includes('desay')) return 'breakfast';
    if (t.includes('almuer') || t.includes('comida')) return 'lunch';
    if (t.includes('cena')) return 'dinner';
    if (t.includes('aper') || t.includes('snack')) return 'snack';
    return 'snack';
  };

  const byKey: MealsByKey = { breakfast: [], lunch: [], dinner: [], snack: [] };

  raw.forEach((r) => {
    const k = mapKey(r.meal_t);
    const time = r.uploaded_at
      ? (() => {
          try {
            const d = new Date(r.uploaded_at);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          } catch {
            return undefined;
          }
        })()
      : undefined;

    byKey[k].push({
      id: r.id,
      name: r.name,
      protein: r.protein ?? 0,
      carbs: r.carbs ?? 0,
      fats: r.fats ?? 0,
      kcal: r.kcal ?? 0,
      time,
      raw: r,
    });
  });

  return byKey;
}

// Fixed Monday first initials
const MONDAY_FIRST_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Returns the week days for the week containing `centerDate`
function getWeekDays(
  centerDate: Date,
  today: Date,
  selectedISO?: string
): { date: Date; dayNum: number; initial: string; isSelected: boolean; isFuture: boolean }[] {
  const result: {
    date: Date;
    dayNum: number;
    initial: string;
    isSelected: boolean;
    isFuture: boolean;
  }[] = [];

  const startOfWeek = new Date(centerDate);
  const dow = (startOfWeek.getDay() + 6) % 7; // Monday = 0
  startOfWeek.setDate(startOfWeek.getDate() - dow);

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    const isFuture = isoFromDate(current) > isoFromDate(today);

    result.push({
      date: current,
      dayNum: current.getDate(),
      initial: MONDAY_FIRST_INITIALS[i],
      isSelected: selectedISO ? isoFromDate(current) === selectedISO : false,
      isFuture,
    });
  }
  return result;
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno', icon: BreakfastIcon, bg: '#FFEDD4' },
  { id: 'lunch', label: 'Almuerzo', icon: LunchIcon, bg: '#FEF9C2' },
  { id: 'dinner', label: 'Cena', icon: DinnerIcon, bg: '#E9D5FF' },
  { id: 'snack', label: 'Aperitivo', icon: SnackIcon, bg: '#FBCFE8' },
];

const NAV_BTN_MARGIN = Platform.OS === 'ios' ? -16 : -4;

export default function MealsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const todayISO = useTodayISO();
  const params = useLocalSearchParams();
  const incomingDateISO = (params as any)?.dateISO as string | undefined;
  const incomingFrom = (params as any)?.from as string | undefined;

  const [selectedDate, setSelectedDate] = useState<string | null>(incomingDateISO ?? todayISO);
  const [weekCenterISO, setWeekCenterISO] = useState<string>(incomingDateISO ?? todayISO);
  const [displayDateISO, setDisplayDateISO] = useState<string>(incomingDateISO ?? todayISO);

  const activeDateISO = selectedDate ?? displayDateISO;

  const [allMeals, setAllMeals] = useState<Record<string, MealsByKey> | null>(null);
  const [allMealsLoading, setAllMealsLoading] = useState(false);
  const [allMealsError, setAllMealsError] = useState<string | null>(null);

  const [apiMealsByKey, setApiMealsByKey] = useState<MealsByKey | null>(null);
  const [apiMealsLoading, setApiMealsLoading] = useState(false);
  const [apiMealsError, setApiMealsError] = useState<string | null>(null);

  const [session] = useSession();
  const [refreshing, setRefreshing] = useState(false);

  // Carga inicial de todas las comidas
  useEffect(() => {
    let mounted = true;
    setAllMealsLoading(true);
    setAllMealsError(null);

    getAllMeals()
      .then((res) => {
        if (!mounted) return;
        setAllMeals(res as Record<string, MealsByKey>);
      })
      .catch((err) => {
        if (!mounted) return;
        setAllMealsError(String(err ?? 'Error fetching meals'));
        setAllMeals(null);
      })
      .finally(() => {
        if (mounted) setAllMealsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Carga de comidas por día activo
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!session?.sub || !session?.accessToken) return;

      setApiMealsLoading(true);
      setApiMealsError(null);
      // Ojo, no limpiamos apiMealsByKey aquí, mantenemos lo último

      try {
        const raw: RawMealItem[] = await getMealsForDayFromServer(
          activeDateISO,
          session.sub,
          session.accessToken ?? undefined
        );

        if (!mounted) return;

        const byKey = mapMealsByKey(raw);
        setApiMealsByKey(byKey);
      } catch (err) {
        console.error('[Meals] load meals error', err);
        if (mounted) {
          setApiMealsError(String(err ?? 'Error fetching meals from server'));
        }
      } finally {
        if (mounted) setApiMealsLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [activeDateISO, session?.sub, session?.accessToken]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!session?.sub || !session?.accessToken) return;

    setRefreshing(true);
    try {
      setApiMealsError(null);
      setApiMealsLoading(true);

      const [raw, all] = await Promise.all([
        getMealsForDayFromServer(activeDateISO, session.sub, session.accessToken ?? undefined),
        getAllMeals().catch(() => null),
      ]);

      const byKey = mapMealsByKey(raw);

      if (all) {
        setAllMeals(all as Record<string, MealsByKey>);
      }
      setApiMealsByKey(byKey);
    } catch (e) {
      console.error('[Meals] refresh error', e);
      setApiMealsError(String(e ?? 'Error refreshing meals'));
      // No tocamos apiMealsByKey para no borrar lo que se ve
    } finally {
      setApiMealsLoading(false);
      setRefreshing(false);
    }
  }, [activeDateISO, session?.sub, session?.accessToken]);

  // Fallback local de comidas
  const mealsForDate = useMemo<MealsByKey>(() => {
    const empty: MealsByKey = { breakfast: [], lunch: [], dinner: [], snack: [] };
    if (allMeals && allMeals[activeDateISO]) return allMeals[activeDateISO];
    return empty;
  }, [activeDateISO, allMeals]);

  const displayDateObj = useMemo(() => dateFromISO(displayDateISO), [displayDateISO]);
  const today = useMemo(() => dateFromISO(todayISO), [todayISO]);

  const weekDays = useMemo(
    () => getWeekDays(dateFromISO(weekCenterISO), today, selectedDate ?? undefined),
    [weekCenterISO, today, selectedDate]
  );

  // Layout responsivo días
  const { width: screenWidth } = useWindowDimensions();
  const navButtonWidth = 26;
  const horizontalPadding = 24 * 2;
  const cardPadding = 6 * 2;
  const weekContainerPadding = 4 * 2;
  const weekStripPadding = 8 * 2;
  const dayGap = 8;
  const totalGaps = dayGap * 6;
  const navButtons = navButtonWidth * 2;
  const availableWidth =
    screenWidth - horizontalPadding - cardPadding - weekContainerPadding - weekStripPadding - navButtons - totalGaps;
  const dayWidth = Math.max(34, Math.min(38, Math.floor(availableWidth / 7)));

  const canGoNext = useMemo(() => {
    if (!weekDays || weekDays.length === 0) return false;
    const rightMost = weekDays[weekDays.length - 1].date;
    return isoFromDate(rightMost) < isoFromDate(today);
  }, [weekDays, today]);

  const isSelectedFuture = isoFromDate(displayDateObj) > isoFromDate(today);
  const isSelectedToday = isoFromDate(displayDateObj) === isoFromDate(today);

  const goToCamera = (mealType: string) => {
    // Defensa extra por si acaso
    if (!isSelectedToday) return;

    const params = new URLSearchParams();
    params.set('dateISO', displayDateISO);
    params.set('mealType', mealType);
    console.log('[Meals] goToCamera navigate to /camera', {
      dateISO: displayDateISO,
      mealType,
      url: `/camera?${params.toString()}`,
    });
    router.push(`/camera?${params.toString()}` as any);
  };

  const prevWeek = () => {
    const d = dateFromISO(weekCenterISO);
    d.setDate(d.getDate() - 7);
    setWeekCenterISO(isoFromDate(d));
  };

  const nextWeek = () => {
    const d = dateFromISO(weekCenterISO);
    d.setDate(d.getDate() + 7);
    setWeekCenterISO(isoFromDate(d));
  };

  const selectDay = (date: Date) => {
    const iso = isoFromDate(date);
    setSelectedDate(iso);
    setWeekCenterISO(iso);
    setDisplayDateISO(iso);
  };

  // Sincronizar cuando viene con params
  useEffect(() => {
    if (incomingFrom === 'home') {
      setSelectedDate(todayISO);
      setWeekCenterISO(todayISO);
      setDisplayDateISO(todayISO);
      return;
    }

    if (incomingDateISO) {
      setSelectedDate(incomingDateISO);
      setWeekCenterISO(incomingDateISO);
      setDisplayDateISO(incomingDateISO);
    }
  }, [incomingFrom, incomingDateISO, todayISO]);

  const [showNativePicker, setShowNativePicker] = useState(false);

  const handlePickerChange = (date: Date) => {
    const iso = isoFromDate(date);
    setSelectedDate(iso);
    setWeekCenterISO(iso);
    setDisplayDateISO(iso);
  };

  return (
    <View style={[styles.container, { backgroundColor: (colors as any)?.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[
          (colors as any)?.gradient?.primaryFrom ?? '#2FCCAC',
          (colors as any)?.gradient?.primaryTo ?? '#24A88C',
        ]}
        style={styles.header}
      >
        {/* Calendar card */}
        <View style={[styles.calendarCard]}>
          {/* Fecha completa */}
          <Pressable onPress={() => setShowNativePicker(true)} style={styles.fullDateRow}>
            <AppText style={[styles.fullDateText, { color: '#fff' }]}>{prettyDate(displayDateObj)}</AppText>
            <View style={styles.chevronIconSmall}>
              <ChevronRight color="#fff" />
            </View>
          </Pressable>

          {/* Week strip */}
          <View style={styles.weekContainer}>
            <Pressable
              onPress={prevWeek}
              style={[
                styles.navButton,
                { backgroundColor: (colors as any)?.icons?.idleBg ?? (colors as any)?.border },
              ]}
            >
              <ChevronLeft color={(colors as any)?.icons?.idle ?? '#4A5565'} />
            </Pressable>

            <View style={styles.weekDaysStrip}>
              {weekDays.map((day) => (
                <Pressable
                  key={isoFromDate(day.date)}
                  onPress={() => !day.isFuture && selectDay(day.date)}
                  disabled={day.isFuture}
                  style={[
                    styles.dayButton,
                    { width: dayWidth },
                    { backgroundColor: (colors as any)?.border3 },
                    day.isSelected && {
                      backgroundColor: (colors as any)?.gradient?.primaryFrom ?? '#2FCCAC',
                    },
                    day.isFuture && styles.dayButtonDisabled,
                  ]}
                >
                  <AppText
                    style={[
                      styles.dayInitial,
                      { color: (colors as any)?.subtext },
                      day.isSelected && { color: '#fff' },
                    ]}
                  >
                    {day.initial}
                  </AppText>
                  <AppText
                    style={[
                      styles.dayNumber,
                      { color: (colors as any)?.subtext },
                      day.isSelected && { color: '#fff' },
                    ]}
                  >
                    {day.dayNum}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={nextWeek}
              disabled={!canGoNext}
              style={[
                styles.navButton,
                !canGoNext && styles.navButtonDisabled,
                { backgroundColor: (colors as any)?.icons?.idleBg ?? (colors as any)?.border },
              ]}
            >
              <ChevronRight
                color={
                  canGoNext ? (colors as any)?.icons?.idle ?? '#4A5565' : (colors as any)?.border ?? '#D1D5DB'
                }
              />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Native date picker */}
      <NativeDatePicker
        visible={showNativePicker}
        value={displayDateObj}
        maximumDate={today}
        onClose={() => setShowNativePicker(false)}
        onChange={handlePickerChange}
      />

      {/* Feedback de carga y error para las comidas del día */}
      {apiMealsLoading && (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <AppText style={{ fontSize: 12, color: (colors as any)?.subtext }}>
            Cargando tus comidas...
          </AppText>
        </View>
      )}

      {apiMealsError && (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <AppText style={{ fontSize: 12, color: (colors as any)?.error ?? '#DC2626' }}>
            Hubo un problema al actualizar tus comidas, desliza hacia abajo para reintentar.
          </AppText>
        </View>
      )}

      {/* Meals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.mealsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={(colors as any)?.brandA}
            colors={[(colors as any)?.brandA]}
            progressBackgroundColor={(colors as any)?.bg}
          />
        }
      >
        {MEAL_TYPES.map((meal) => {
          const source = apiMealsByKey ?? mealsForDate;
          const items = source[meal.id as keyof MealsByKey] ?? [];
          const hasItems = items.length > 0;
          const bgColor = (colors as any)?.mealChips?.[meal.id as any]?.bg ?? meal.bg;

          return (
            <MealCard
              key={meal.id}
              label={meal.label}
              icon={meal.icon}
              backgroundColor={bgColor}
              hasItems={hasItems}
              items={items}
              isSelectedToday={isSelectedToday}
              isSelectedFuture={isSelectedFuture}
              onAddPress={() => goToCamera(meal.id)}
              onViewPress={() => {
                const path = `/(tabs)/meals/${meal.id}?dateISO=${encodeURIComponent(displayDateISO)}`;
                router.push(path as any);
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 26,
    paddingHorizontal: 24,
  },
  calendarCard: {
    borderRadius: 16,
    paddingTop: 6,
    paddingBottom: 16,
    paddingHorizontal: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  fullDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  fullDateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  chevronIconSmall: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  navButton: {
    width: 26,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: NAV_BTN_MARGIN,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  weekDaysStrip: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dayButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 4,
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayInitial: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  dayNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
    marginTop: 24,
  },
  mealsContainer: {
    paddingBottom: 120,
    paddingHorizontal: 24,
    gap: 16,
  },
});
