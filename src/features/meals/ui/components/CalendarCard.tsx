import React from 'react';
import { View, StyleSheet, Pressable, Text as RNText } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';

interface WeekDay {
  date: Date;
  dayNum: number;
  initial: string;
  isSelected: boolean;
  isFuture: boolean;
}

interface CalendarCardProps {
  monthYearText: string;
  weekDays: WeekDay[];
  canGoNext: boolean;
  onMonthPress: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (date: Date) => void;
}

export default function CalendarCard({
  monthYearText,
  weekDays,
  canGoNext,
  onMonthPress,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
}: CalendarCardProps) {
  return (
    <View style={styles.calendarCard}>
      {/* Month/Year Selector */}
      <Pressable style={styles.monthSelector} onPress={onMonthPress}>
        <AppText style={styles.monthText}>{monthYearText}</AppText>
        <RNText style={styles.chevronDown}>{'›'}</RNText>
      </Pressable>

      {/* Week Navigation */}
      <View style={styles.weekContainer}>
        <Pressable style={styles.navButton} onPress={onPrevWeek}>
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
                onSelectDay(day.date);
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
            onNextWeek();
          }}
          disabled={!canGoNext}
        >
          <RNText style={[styles.navArrow, !canGoNext && styles.navArrowDisabled]}>{'›'}</RNText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    minHeight: 44, // Better touch target for iPhone
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
    gap: 12, // Reduced gap for better iPhone fit
  },
  navButton: {
    width: 44, // Increased for better touch target
    height: 44,
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
    gap: 6, // Reduced for better iPhone fit
  },
  dayButton: {
    width: 38, // Slightly larger for better touch
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
});
