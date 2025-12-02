// src/features/progress/ui/components/WeightEvolution.tsx
/* eslint-disable react-native/no-raw-text */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/src/shared/styles/useTheme';
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import useSession from '@/src/shared/hooks/useSession';
import CalendarIcon from '@/assets/icons/activity/calendarIcon.svg';

const screenWidth = Dimensions.get('window').width;

type WeightPoint = {
  label: string;   // eje X, por ejemplo "22 sept"
  value: number;   // peso, por ejemplo 69.0
};

type Props = {
  data?: WeightPoint[];
};

const DEFAULT_DATA: WeightPoint[] = [];

function formatLabel(dateIso: string) {
  try {
    const d = new Date(dateIso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  } catch (e) {
    return dateIso;
  }
}

function formatMonthLabel(d: Date) {
  try {
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  } catch (e) {
    return d.toISOString().slice(0,7);
  }
}

export default function WeightEvolution({ data = DEFAULT_DATA }: Props) {
  const { colors } = useTheme();
  const theme = colors as any;

  const [sessionState] = useSession();
  const token = sessionState?.accessToken;
  const userId = sessionState?.sub;

  // month state: start with today
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 prev, +1 next

  const targetMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const startDateISO = useMemo(() => {
    const d = new Date(targetMonth);
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, [targetMonth]);

  const endDateISO = useMemo(() => {
    const d = new Date(targetMonth);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // last day of month
    return d.toISOString().slice(0, 10);
  }, [targetMonth]);

  const [points, setPoints] = useState<WeightPoint[]>(data);
  const [loading, setLoading] = useState(false);

  const fetchForMonth = useCallback(async () => {
    if (!userId || !token) {
      // no auth available — show fallback data
      setPoints(data);
      return;
    }
    setLoading(true);
    try {
      const url = `/api/v1/calorie-targets/${userId}/weight-history?start_date=${startDateISO}&end_date=${endDateISO}`;
      const res: any = await getJSON(url, { baseUrl: API_BASE_URL, token });
      // prefer the explicit shape { weights: [...] }
      const itemsRaw: Array<any> = Array.isArray(res)
        ? res
        : Array.isArray(res?.weights)
        ? res.weights
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const normalized = itemsRaw
        .map((it: any) => {
          const dateStr = it.day || it.date || it.created_at || it.timestamp;
          const weight = it.weight_kg ?? it.weightKg ?? it.weight ?? it.value;
          return dateStr && (typeof weight === 'number' || typeof weight === 'string')
            ? { date: String(dateStr).slice(0, 10), weight: Number(weight) }
            : null;
        })
        .filter(Boolean) as Array<{ date: string; weight: number }>;

      // sort by date asc
      normalized.sort((a, b) => a.date.localeCompare(b.date));

      // Selection logic:
      // - If there are <=5 records, show them all.
      // - Otherwise take up to 5 most recent, and also include older records whose weight differs by >=5kg
      let selected: Array<{ date: string; weight: number }> = [];
      if (normalized.length <= 5) {
        selected = normalized.slice();
      } else {
        const newestFirst: Array<{ date: string; weight: number }> = [];
        for (let i = normalized.length - 1; i >= 0; i--) {
          const item = normalized[i];
          if (newestFirst.length < 5) {
            newestFirst.push(item);
            continue;
          }
          const lastIncluded = newestFirst[newestFirst.length - 1]; // oldest among the selected newest
          if (Math.abs(item.weight - lastIncluded.weight) >= 5) {
            newestFirst.push(item);
          }
        }
        selected = newestFirst.reverse();
      }

      if (selected.length === 0) {
        // No records for this month — set empty points so the chart doesn't show example data
        setPoints([]);
      } else {
        const mapped = selected.map((s) => ({ label: formatLabel(s.date), value: s.weight }));
        setPoints(mapped);
      }
    } catch (e) {
      console.warn('[WeightEvolution] fetch failed', e);
      // On error, prefer to show an empty state (no sample data)
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [userId, token, startDateISO, endDateISO, data]);

  useEffect(() => {
    fetchForMonth();
  }, [fetchForMonth]);

  const labels = points.map((p) => p.label);
  const values = points.map((p) => p.value);

  const styles = createStyles(theme);
  const lineColor = theme.brandA ?? '#2B7FFF';

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}>
          Evolución del peso
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setMonthOffset((m) => m - 1)} style={{ padding: 6 }}>
            <AppText variant="ag9" color={theme.subtext ?? '#6B7280'}>{'<'}</AppText>
          </Pressable>
          <AppText variant="ag10" color={theme.subtext ?? '#6B7280'}>{formatMonthLabel(targetMonth)}</AppText>
          <Pressable onPress={() => setMonthOffset((m) => m + 1)} style={{ padding: 6 }}>
            <AppText variant="ag9" color={theme.subtext ?? '#6B7280'}>{'>'}</AppText>
          </Pressable>
          <Pressable onPress={() => setMonthOffset(0)} style={{ padding: 6 }}>
            <CalendarIcon width={18} height={18} color={theme.subtext ?? '#6B7280'} />
          </Pressable>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          {loading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={lineColor} />
            </View>
          ) : points.length === 0 ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' , backgroundColor:theme.border ?? '#F9FAFB' }}>
              <AppText variant="ag9" color={theme.subtext ?? '#6B7280'}>Sin datos para este mes</AppText>
            </View>
          ) : (
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={200}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              yAxisLabel=""
              yAxisSuffix=""
              segments={3}
              chartConfig={{
                backgroundGradientFrom: theme.mealsCard ?? '#FFFFFF',
                backgroundGradientTo: theme.mealsCard ?? '#FFFFFF',
                backgroundGradientFromOpacity: 1,
                backgroundGradientToOpacity: 1,
                decimalPlaces: 1,
                color: (opacity = 1) => hexToRgba(lineColor, opacity),
                labelColor: (opacity = 1) => hexToRgba(theme.text ?? '#9CA3AF', opacity),
                propsForBackgroundLines: {
                  stroke: theme.border ?? '#E5E7EB',
                  strokeWidth: 1,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '0',
                  stroke: 'transparent',
                },
              }}
              bezier
              style={styles.chart}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function hexToRgba(hex: string, alpha = 1) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginTop: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    chartContainer: {
      marginTop: 12,
    },
    chartWrapper: {
      borderRadius: 8,
      backgroundColor: themeColors.surface ?? '#F9FAFB',
      overflow: 'hidden',
    },
    chart: {
      marginLeft: -8,
    },
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContainer: {
    marginTop: 12,
  },
  chartWrapper: {
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  chart: {
    // para que el chart se alinee bien dentro del wrapper
    marginLeft: -8, // puedes ajustar esto si ves que los labels se cortan
  },
});
