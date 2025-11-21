import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AppText from '@/src/shared/ui/components/Typography';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import MealCard from '../components/MealCard';
import { getAllMeals } from '@/src/features/meals/infrastructure/mealsApi';
import NativeDatePicker from '../components/NativeDatePicker';
import { Platform } from 'react-native';

// SVG Icons
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';
import SnackIcon from '@/assets/icons/SnackIcon.svg';

// Inline chevron icons
function ChevronLeft({ color = "#4A5565" }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 15L7.5 10L12.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function ChevronRight({ color = "#4A5565" }) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path d="M7.5 15L12.5 10L7.5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function ChevronDown({ color = "#FFFFFF" }) {
  return (
    <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <Path d="M3 4.5L6 7.5L9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// Helper functions
function isoFromDate(d: Date) {
  // Use local date parts to avoid timezone issues
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateFromISO(iso: string): Date {
  // Parse as local date to avoid timezone shift
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function prettyDate(d: Date, locale = 'es-ES') {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString(locale, options);
}

// Fixed Monday-first weekday initials: L, M, M, J, V, S, D
const MONDAY_FIRST_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Returns the week days for the week containing `centerDate`,
// always Monday → Sunday, keeping weekday positions fixed.
function getWeekDays(
  centerDate: Date,
  today: Date,
  // Optional ISO string of a user-selected date. If provided, that day will be marked
  // as selected. If omitted, no day will be selected (useful when just navigating weeks).
  selectedISO?: string
): { date: Date; dayNum: number; initial: string; isSelected: boolean; isFuture: boolean }[] {
  const result = [] as {
    date: Date;
    dayNum: number;
    initial: string;
    isSelected: boolean;
    isFuture: boolean;
  }[];

  // Determine Monday of the current week
  const startOfWeek = new Date(centerDate);
  const dow = (startOfWeek.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  startOfWeek.setDate(startOfWeek.getDate() - dow);

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    const isFuture = isoFromDate(current) > isoFromDate(today);
    result.push({
      date: current,
      dayNum: current.getDate(),
      initial: MONDAY_FIRST_INITIALS[i],
      // If `selectedISO` is provided, only that date is considered selected.
      // Otherwise no date is selected when navigating weeks.
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
  const router = useRouter();
  const todayISO = useTodayISO();
  const params = useLocalSearchParams();
  const incomingDateISO = (params as any)?.dateISO as string | undefined;
  const incomingFrom = (params as any)?.from as string | undefined;
  // The date explicitly chosen by the user (nullable). When null, no day is selected
  // and the week view is controlled by `weekCenterISO`.
  const [selectedDate, setSelectedDate] = useState<string | null>(incomingDateISO ?? todayISO);
  // Controls which week is shown when navigating with the arrows. Does NOT imply
  // that a day is selected by the user.
  const [weekCenterISO, setWeekCenterISO] = useState<string>(incomingDateISO ?? todayISO);
  // The date shown in the header / picker. This must NOT change when the user
  // navigates between weeks with the arrows; it only updates when the user
  // explicitly selects a day or picks a date.
  const [displayDateISO, setDisplayDateISO] = useState<string>(incomingDateISO ?? todayISO);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);

  // Determine the active date used to show meals: prefer an explicitly
  // selected date, otherwise fall back to the displayDate (header/picker).
  const activeDateISO = selectedDate ?? displayDateISO;

  // Fetch the full meals map once and filter client-side by date. Keep an
  // inline mockDB as fallback so the UI still shows examples when the API
  // isn't available yet.
  const [allMeals, setAllMeals] = useState<Record<string, Record<string, any[]>> | null>(null);
  const [allMealsLoading, setAllMealsLoading] = useState(false);
  const [allMealsError, setAllMealsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setAllMealsLoading(true);
    setAllMealsError(null);
    getAllMeals()
      .then((res) => { if (!mounted) return; setAllMeals(res); })
      .catch((err) => { if (!mounted) return; setAllMealsError(String(err ?? 'Error fetching meals')); setAllMeals(null); })
      .finally(() => { if (mounted) setAllMealsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const mealsForDate = useMemo(() => {
    const mockDB: Record<string, Record<string, any[]>> = {
      [todayISO]: {
        breakfast: [ { id: 'b1', name: 'Tostada integral con aguacate', protein: 6, carbs: 22, fats: 12, kcal: 210, time: '07:30' } ],
        lunch: [ { id: 'l1', name: 'Pechuga de pollo', protein: 30, carbs: 0, fats: 3, kcal: 165, time: '13:00' } ],
        dinner: [],
        snack: [],
      },
    };

    if (allMeals && allMeals[activeDateISO]) return allMeals[activeDateISO];
    return mockDB[activeDateISO] ?? { breakfast: [], lunch: [], dinner: [], snack: [] };
  }, [activeDateISO, allMeals, todayISO]);

  // The Date object used to render the header and the native picker value.
  const displayDateObj = useMemo(() => dateFromISO(displayDateISO), [displayDateISO]);

  const today = useMemo(() => dateFromISO(todayISO), [todayISO]);
  // Build week days around `weekCenterISO`. Pass `selectedDate` so getWeekDays
  // can mark the selected day only when the user has chosen one.
  const weekDays = useMemo(() => getWeekDays(dateFromISO(weekCenterISO), today, selectedDate ?? undefined), [weekCenterISO, today, selectedDate]);
  
  // Responsive day button widths
  const { width: screenWidth } = useWindowDimensions();
  const navButtonWidth = 26;
  const horizontalPadding = 24 * 2; // left + right
  const cardPadding = 6 * 2; // left + right
  const weekContainerPadding = 4 * 2; // left + right
  const weekStripPadding = 8 * 2; // left + right
  const dayGap = 8;
  const totalGaps = dayGap * 6; // 7 days = 6 gaps
  const navButtons = navButtonWidth * 2;
  const availableWidth = screenWidth - horizontalPadding - cardPadding - weekContainerPadding - weekStripPadding - navButtons - totalGaps;
  const dayWidth = Math.max(34, Math.min(38, Math.floor(availableWidth / 7))); // All days same width
  
  const canGoNext = useMemo(() => {
    if (!weekDays || weekDays.length === 0) return false;
    const rightMost = weekDays[weekDays.length - 1].date;
    return isoFromDate(rightMost) < isoFromDate(today);
  }, [weekDays, today]);
  // `isSelectedFuture`/`isSelectedToday` reflect the currently displayed date
  // (the header/picker), not the week center when navigating.
  const isSelectedFuture = isoFromDate(displayDateObj) > isoFromDate(today);
  const isSelectedToday = isoFromDate(displayDateObj) === isoFromDate(today);

  const goToCamera = (mealType: string) => {
    const params = new URLSearchParams();
    // Use the date currently shown in the header (displayDateISO). This never
    // changes when the user is merely navigating weeks with the arrows.
    params.set('dateISO', displayDateISO);
    params.set('mealType', mealType);
    // Debug log to trace navigation params when opening camera from Meals
    console.log('[Meals] goToCamera navigate to /camera', { dateISO: displayDateISO, mealType, url: `/camera?${params.toString()}` });
    router.push(`/camera?${params.toString()}` as any);
  };

  const prevWeek = () => {
    const d = dateFromISO(weekCenterISO);
    d.setDate(d.getDate() - 7);
    setWeekCenterISO(isoFromDate(d));
    // Do NOT change `displayDateISO` — the header should keep showing the last
    // explicitly chosen date until the user selects a new one.
    // Keep `selectedDate` so that if the user returns to the week containing it,
    // it will be shown as selected.
  };

  const nextWeek = () => {
    const d = dateFromISO(weekCenterISO);
    d.setDate(d.getDate() + 7);
    setWeekCenterISO(isoFromDate(d));
    // Keep displayDateISO unchanged here as well.
    // Keep `selectedDate` so selection persists when user navigates away and returns.
  };

  const selectDay = (date: Date) => {
    const iso = isoFromDate(date);
    setSelectedDate(iso);
    setWeekCenterISO(iso);
    // Selecting a day updates the header/picker display date.
    setDisplayDateISO(iso);
  };

  // Synchronize when navigated with params. If coming from Home, force today's date.
  useEffect(() => {
    if (incomingFrom === 'home') {
      // When coming from Home we want today's date to appear selected/painted
      // so the week selector highlights today.
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
  }, [incomingFrom, incomingDateISO]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient Header */}
      <LinearGradient colors={['#2FCCAC', '#24A88C']} style={styles.header}>
        {/* White card container for calendar */}
        <View style={styles.calendarCard}>
          {/* Full date text + chevron */}
          <Pressable onPress={() => setShowNativePicker(true)} style={styles.fullDateRow}>
            <AppText style={styles.fullDateText}>{prettyDate(displayDateObj)}</AppText>
            <View style={styles.chevronIconSmall}>
              <ChevronRight color="#fff" />
            </View>
          </Pressable>

          {/* Week strip with prev/next navigation */}
          <View style={styles.weekContainer}>
            {/* Prev button */}
            <Pressable onPress={prevWeek} style={styles.navButton}>
              <ChevronLeft color="#4A5565" />
            </Pressable>

            {/* 7-day week selector */}
            <View style={styles.weekDaysStrip}>
              {weekDays.map((day) => (
                <Pressable
                  key={isoFromDate(day.date)}
                  onPress={() => !day.isFuture && selectDay(day.date)}
                  disabled={day.isFuture}
                  style={[
                    styles.dayButton,
                    { width: dayWidth }, // All days have the same width - no layout shift
                    day.isSelected && styles.dayButtonSelected,
                    day.isFuture && styles.dayButtonDisabled,
                  ]}
                >
                  <AppText style={[styles.dayInitial, day.isSelected && styles.dayInitialSelected]}>{day.initial}</AppText>
                  <AppText style={[styles.dayNumber, day.isSelected && styles.dayNumberSelected]}>{day.dayNum}</AppText>
                </Pressable>
              ))}
            </View>

            {/* Next button */}
            <Pressable onPress={nextWeek} disabled={!canGoNext} style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}>
              <ChevronRight color={canGoNext ? '#4A5565' : '#D1D5DB'} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Native date picker (Android native calendar, iOS spinner modal) */}
      <NativeDatePicker
        visible={showNativePicker}
        value={displayDateObj}
        maximumDate={today}
        onClose={() => setShowNativePicker(false)}
        onChange={(d) => {
          const iso = isoFromDate(d);
          setSelectedDate(iso);
          setWeekCenterISO(iso);
          setDisplayDateISO(iso);
        }}
      />

      {/* Meals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.mealsContainer}
        showsVerticalScrollIndicator={false}
      >
        {MEAL_TYPES.map((meal) => {
          const hasItems = (mealsForDate[meal.id] || []).length > 0;

          return (
            <MealCard
              key={meal.id}
              label={meal.label}
              icon={meal.icon}
              backgroundColor={meal.bg}
              hasItems={hasItems}
              items={mealsForDate[meal.id]}
              isSelectedToday={isSelectedToday}
              isSelectedFuture={isSelectedFuture}
              onAddPress={() => goToCamera(meal.id)}
              onViewPress={() => {
                // Navegar pasando la data de los ítems y la fecha seleccionada
                router.push({
                  pathname: `/meals/${meal.id}`,
                  params: {
                    dateISO: displayDateISO,
                    items: JSON.stringify(mealsForDate[meal.id] ?? []),
                  },
                } as any);
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
    backgroundColor: '#F9FAFB',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#2FCCAC',
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayInitial: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
  },
  dayInitialSelected: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dayNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A5565',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
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
