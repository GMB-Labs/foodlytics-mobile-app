import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import CalendarIcon from '@/assets/icons/activity/calendarIcon.svg';

type Props = {
  // records: optional mapping from 'YYYY-MM-DD' to number of exercise registrations that day
  records?: Record<string, number>;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatISO(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Datos mock para probar el heatmap visualmente
// Usa el mes y año actual para que calce con la grilla
const NOW = new Date();
const Y = NOW.getFullYear();
const M = NOW.getMonth();

// Algunos días con distintas intensidades
const DEV_RECORDS: Record<string, number> = {
  [formatISO(Y, M, 1)]: 1,
  [formatISO(Y, M, 2)]: 2,
  [formatISO(Y, M, 3)]: 0,
  [formatISO(Y, M, 4)]: 3,
  [formatISO(Y, M, 5)]: 4,
  [formatISO(Y, M, 6)]: 1,
  [formatISO(Y, M, 7)]: 0,
  [formatISO(Y, M, 8)]: 2,
  [formatISO(Y, M, 9)]: 1,
  [formatISO(Y, M, 10)]: 3,
  [formatISO(Y, M, 12)]: 2,
  [formatISO(Y, M, 13)]: 4,
  [formatISO(Y, M, 15)]: 1,
  [formatISO(Y, M, 17)]: 2,
  [formatISO(Y, M, 18)]: 3,
  [formatISO(Y, M, 20)]: 1,
  [formatISO(Y, M, 22)]: 2,
  [formatISO(Y, M, 25)]: 4,
  [formatISO(Y, M, 27)]: 3,
};

// color ramp from empty -> light -> dark
const colorScale = ['#F3F4F6', '#CFF6EE', '#9BEBDC', '#59DBC7', '#2FCCAC'];

export default function StreakWidget({ records }: Props) {
  const { width } = Dimensions.get('window');
  const cardHorizontalPadding = 24; // matches parent padding
  const chartWidth = Math.max(220, width - cardHorizontalPadding * 2);

  // Si no te pasan records, usa los datos mock
  const effectiveRecords = records && Object.keys(records).length ? records : DEV_RECORDS;

  const values = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const totalDays = daysInMonth(year, month);

    const arr: { date: string; count: number }[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const iso = formatISO(year, month, d);
      const raw = effectiveRecords[iso] ?? 0;
      const count = Math.max(0, Math.floor(raw));
      arr.push({ date: iso, count });
    }
    return arr;
  }, [effectiveRecords]);

  const totalThisMonth = values.reduce((s, v) => s + (v.count > 0 ? 1 : 0), 0);

  const lastDay = values.length ? new Date(values[values.length - 1].date) : new Date();
  const numDays = values.length || 28;

  const [containerWidth, setContainerWidth] = useState<number>(chartWidth);

  const columns = 7;
  const gap = 8;
  const squareSize = Math.floor((containerWidth - gap * (columns - 1)) / columns);

  const maxCount = Math.max(1, ...values.map((v) => v.count));
  const monthLabel = new Date().toLocaleString(undefined, { month: 'short' });

  function onLayoutGrid(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w && w > 0) setContainerWidth(w);
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRowTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CalendarIcon width={18} height={18} color="#1A1A1A" />
          <View style={{ width: 8 }} />
          <AppText variant="ag7" color="#1A1A1A">
            Racha de ejercicio
          </AppText>
        </View>
        <AppText variant="ag9" color="#6A7282">
          {`${totalThisMonth} días este mes`}
        </AppText>
      </View>

      <View style={{ height: 8 }} />

      <AppText variant="ag10" color="#2FCCAC" style={{ marginBottom: 8 }}>
        {monthLabel}
      </AppText>

      <View onLayout={onLayoutGrid} style={{ width: '100%' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {values.map((v, idx) => {
            const count = v.count;
            const levels = colorScale.length - 1;
            const level =
              count === 0 ? 0 : Math.min(levels, Math.ceil((count / maxCount) * levels));
            const bg = colorScale[level];

            return (
              <View
                key={v.date}
                style={{
                  width: squareSize,
                  height: squareSize,
                  marginRight: (idx + 1) % columns === 0 ? 0 : gap,
                  marginBottom: gap,
                  backgroundColor: bg,
                  borderRadius: 6,
                }}
              />
            );
          })}
        </View>
      </View>

      <AppText variant="ag9" color="#6A7282" style={{ marginTop: 12 }}>
        {`Has ejercitado ${totalThisMonth} de los últimos ${numDays} días`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
