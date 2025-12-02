/* eslint-disable react-native/no-raw-text */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '@/src/shared/styles/useTheme';
import useSession from '@/src/shared/hooks/useSession';
import { fetchDailySummaryCached } from '@/src/shared/api/profileGateway';

const screenWidth = Dimensions.get('window').width;

type WeekItem = {
  label: string;   // "Sem 1"
  value: number;   // 99
};

type Props = {
  data?: WeekItem[];
};

const DEFAULT_WEEKS: WeekItem[] = [
  { label: 'Sem 1', value: 99 },
  { label: 'Sem 2', value: 79 },
  { label: 'Sem 3', value: 78 },
  { label: 'Sem 4', value: 72 },
];

export default function WeeklyCompliance({ data = DEFAULT_WEEKS }: Props) {
  const [sessionState] = useSession();
  const token = sessionState?.accessToken;
  const patientId = sessionState?.sub;

  const [values, setValues] = useState<number[]>(() => data.map((w) => w.value));
  const [loading, setLoading] = useState(false);
  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const { colors } = useTheme();
  const theme = colors as any;

  const styles = createStyles(theme);
  const barColor = theme.brandA ?? '#2FCCAC';
  const labelColor = theme.subtext ?? '#6A7282';
  const bgStroke = theme.border ?? '#E5E7EB';

  useEffect(() => {
    let mounted = true;
    async function fetchMonth() {
      if (!patientId) return;
      setLoading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // helpers
        const pad = (n: number) => String(n).padStart(2, '0');
        const isoFor = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

        const totalDays = [0, 0, 0, 0];
        const withinDays = [0, 0, 0, 0];

        const days: string[] = [];
        for (let d = 1; d <= daysInMonth; d++) days.push(isoFor(year, month, d));

        const promises = days.map((day) =>
          fetchDailySummaryCached({ patientId: String(patientId), day, token: token ?? undefined }).catch(() => null)
        );

        const results = await Promise.all(promises);

        for (let i = 0; i < days.length; i++) {
          const dayIso = days[i];
          const dayOfMonth = parseInt(dayIso.slice(8, 10), 10);
          const weekIndex = Math.floor((dayOfMonth - 1) / 7); // 0..3
          const w = Math.min(3, Math.max(0, weekIndex));
          totalDays[w] += 1;
          const res = results[i];
          if (res && res.status === 'within_target') withinDays[w] += 1;
        }

        const computed = totalDays.map((tot, idx) => {
          if (tot <= 0) return 0;
          const pct = Math.round((withinDays[idx] / tot) * 100);
          return Math.min(100, Math.max(0, pct));
        });

        if (mounted) setValues(computed);
      } catch (e) {
        // on error, keep defaults
        console.warn('[WeeklyCompliance] fetch failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMonth();
    return () => {
      mounted = false;
    };
  }, [patientId, token]);

  return (
    <View style={styles.card}>
      <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}>
        Cumplimiento semanal
      </AppText>

      <View style={styles.chartContainer}>
        {loading ? (
          <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <BarChart
            data={{ labels, datasets: [{ data: values }] }}
            width={screenWidth - 40} // card width (padding 20 a cada lado)
            height={200}
            fromZero
            yAxisLabel=""
            yAxisSuffix="%"
            segments={4}
            showBarTops={true}
            withHorizontalLabels
            showValuesOnTopOfBars={false}
            xLabelsOffset={-4}
            yLabelsOffset={8}
            chartConfig={{
              backgroundColor: theme.mealsCard ?? '#FFFFFF',
              backgroundGradientFrom: theme.mealsCard ?? '#FFFFFF',
              backgroundGradientTo: theme.mealsCard ?? '#FFFFFF',
              backgroundGradientFromOpacity: 1,
              backgroundGradientToOpacity: 1,
              decimalPlaces: 0,
              color: () => barColor,
              labelColor: () => labelColor,
              propsForBackgroundLines: {
                stroke: bgStroke,
                strokeDasharray: '3 5',
                strokeWidth: 1,
              },
              barPercentage: 0.7,
              propsForLabels: {
                fontSize: 11,
              },
            }}
            style={styles.chart}
          />
        )}
      </View>
    </View>
  );
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
      marginLeft: -20,
      marginTop: 12,
      borderRadius: 1,
      overflow: 'hidden',
    },
    chart: {
      borderRadius: 8,
    },
  });
}

function hexToRgba(hex: string, alpha = 1) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
