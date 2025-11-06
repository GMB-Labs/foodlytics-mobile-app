import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text as RNText, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '@/src/shared/ui/components/Typography';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

// SVG Icons
import BreakfastIcon from '@/assets/icons/BreakfastIcon.svg';
import LunchIcon from '@/assets/icons/LunchIcon.svg';
import DinnerIcon from '@/assets/icons/DinnerIcon.svg';
import SnackIcon from '@/assets/icons/SnackIcon.svg';

// Helper functions
function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function prettyDate(d: Date, locale = 'es-ES') {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString(locale, options);
}

function monthYear(d: Date, locale = 'es-ES') {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  return d.toLocaleDateString(locale, options);
}

function getDayInitial(dayOfWeek: number) {
  const initials = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  return initials[dayOfWeek];
}

function getWeekDays(centerDate: Date, today: Date): { date: Date; dayNum: number; initial: string; isSelected: boolean; isFuture: boolean }[] {
  const result = [];
  const baseDate = new Date(centerDate);
  baseDate.setDate(baseDate.getDate() - 2); // Start 2 days before

  for (let i = 0; i < 5; i++) {
    const current = new Date(baseDate);
    current.setDate(baseDate.getDate() + i);
    const isFuture = isoFromDate(current) > isoFromDate(today);
    result.push({
      date: current,
      dayNum: current.getDate(),
      initial: getDayInitial(current.getDay()),
      isSelected: isoFromDate(current) === isoFromDate(centerDate),
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

export default function MealsScreen() {
  const router = useRouter();
  const todayISO = useTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  // For now we show no registered meals (placeholder). Later connect to meals storage/usecase.
  const mealsForDate = useMemo(() => {
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    } as Record<string, any[]>;
  }, [selectedDate]);

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(useTodayISO()), []);
  const weekDays = useMemo(() => getWeekDays(selectedDateObj, today), [selectedDate, selectedDateObj, today]);
  const canGoNext = useMemo(() => {
    if (!weekDays || weekDays.length === 0) return false;
    const rightMost = weekDays[weekDays.length - 1].date;
    return isoFromDate(rightMost) < isoFromDate(today);
  }, [weekDays, today]);
  const horizontalPadding = Math.max(20, Math.min(45, Math.round(width * 0.1)));
  const isSelectedFuture = isoFromDate(selectedDateObj) > isoFromDate(today);
  const isSelectedPast = isoFromDate(selectedDateObj) < isoFromDate(today);
  const isSelectedToday = isoFromDate(selectedDateObj) === isoFromDate(today);

  const goToCamera = (mealType: string) => {
    const params = new URLSearchParams();
    params.set('dateISO', selectedDate);
    params.set('mealType', mealType);
    router.push(`/camera?${params.toString()}` as any);
  };

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(isoFromDate(d));
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(isoFromDate(d));
  };

  const selectDay = (date: Date) => {
    setSelectedDate(isoFromDate(date));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient Header */}
      <LinearGradient colors={['#2FCCAC', '#24A88C']} style={styles.header}>
        <AppText style={styles.headerTitle}>Registro de comidas</AppText>
        <AppText style={styles.headerSubtitle}>{prettyDate(selectedDateObj)}</AppText>
      </LinearGradient>

      {/* Calendar Card */}
      <View style={styles.calendarCard}>
        {/* Month/Year Selector */}
        <Pressable style={styles.monthSelector}>
          <AppText style={styles.monthText}>{monthYear(selectedDateObj)}</AppText>
          <RNText style={styles.chevronDown}>{'›'}</RNText>
        </Pressable>

        {/* Week Navigation */}
        <View style={styles.weekContainer}>
          <Pressable style={styles.navButton} onPress={prevWeek}>
            <RNText style={styles.navArrow}>{'‹'}</RNText>
          </Pressable>

          <View style={styles.weekDays}>
            {weekDays.map((day, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.dayButton,
                  day.isSelected && styles.dayButtonActive,
                  day.isFuture && styles.dayButtonDisabled,
                ]}
                onPress={() => {
                  if (day.isFuture) return;
                  selectDay(day.date);
                }}
                disabled={day.isFuture}
              >
                <RNText style={[styles.dayInitial, day.isSelected && styles.dayInitialActive, day.isFuture && styles.dayInitialDisabled]}>
                  {day.initial}
                </RNText>
                <RNText style={[styles.dayNumber, day.isSelected && styles.dayNumberActive, day.isFuture && styles.dayNumberDisabled]}>
                  {day.dayNum}
                </RNText>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={() => {
              if (!canGoNext) return;
              nextWeek();
            }}
            disabled={!canGoNext}
          >
            <RNText style={[styles.navArrow, !canGoNext && styles.navArrowDisabled]}>{'›'}</RNText>
          </Pressable>
        </View>
      </View>

      {/* Meals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.mealsContainer, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {MEAL_TYPES.map((meal) => {
          const hasItems = (mealsForDate[meal.id] || []).length > 0;
          const Icon = meal.icon;

          return (
            <View key={meal.id} style={styles.mealCard}>
              {/* Meal Header */}
              <View style={styles.mealHeader}>
                <View style={[styles.iconCircle, { backgroundColor: meal.bg }]}>
                  <Icon width={24} height={24} />
                </View>
                <AppText style={styles.mealLabel}>{meal.label}</AppText>
              </View>

              {/* Meal Content */}
              <View style={styles.mealContent}>
                {hasItems ? (
                  <View style={styles.mealItems}>
                    <AppText style={styles.placeholderText}>Items registrados aquí</AppText>
                  </View>
                ) : (
                  <>
                    <AppText style={styles.emptyText}>
                      No has registrado {meal.label.toLowerCase()}
                    </AppText>

                    {/* For past dates we show only the message (no button). For today show the add button. For future show disabled button. */}
                    {!isSelectedPast && (
                      <Pressable
                        style={[styles.addButton, isSelectedFuture && styles.addButtonDisabled]}
                        onPress={() => {
                          if (isSelectedFuture) return;
                          goToCamera(meal.id);
                        }}
                        disabled={isSelectedFuture}
                      >
                        <RNText style={styles.addButtonIcon}>{'+'}</RNText>
                        <AppText style={styles.addButtonText}>Agregar comida</AppText>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
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
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
    marginTop: 8,
  },
  calendarCard: {
    marginHorizontal: 39,
    marginTop: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    textTransform: 'capitalize',
  },
  chevronDown: {
    fontSize: 20,
    color: '#6B7280',
    transform: [{ rotate: '90deg' }],
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navArrow: {
    fontSize: 20,
    color: '#6B7280',
  },
  navArrowDisabled: {
    color: '#9CA3AF',
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    width: 35,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  dayButtonDisabled: {
    opacity: 0.45,
  },
  dayButtonActive: {
    backgroundColor: '#2FCCAC',
  },
  dayInitial: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
  },
  dayInitialDisabled: {
    color: '#9CA3AF',
  },
  dayInitialActive: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A5565',
  },
  dayNumberDisabled: {
    color: '#9CA3AF',
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginTop: 14,
  },
  mealsContainer: {
    paddingHorizontal: 45,
    paddingBottom: 120,
    gap: 14,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  mealContent: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 20,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  mealItems: {
    paddingVertical: 20,
  },
  placeholderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6A7282',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2FCCAC',
    borderRadius: 20,
    height: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#94d6c4',
    opacity: 0.6,
  },
  addButtonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
