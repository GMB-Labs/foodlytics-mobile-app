// src/features/progress/ui/components/WeightEvolution.tsx
/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/src/shared/styles/useTheme';

const screenWidth = Dimensions.get('window').width;

type WeightPoint = {
  label: string;   // eje X, por ejemplo "22 sept"
  value: number;   // peso, por ejemplo 69.0
};

type Props = {
  data?: WeightPoint[];
};

const DEFAULT_DATA: WeightPoint[] = [
  { label: '22 sept', value: 72 },
  { label: '24 sept', value: 70.9 },
  { label: '26 sept', value: 69 },
  { label: '30 sept', value: 67.5 },
  { label: '03 oct', value: 65 },
];

export default function WeightEvolution({ data = DEFAULT_DATA }: Props) {
  const labels = data.map((p) => p.label);
  const values = data.map((p) => p.value);

  const { colors } = useTheme();
  const theme = colors as any;

  const styles = createStyles(theme);

  const lineColor = theme.brandA ?? '#2B7FFF';

  return (
    <View style={styles.card}>
      <AppText variant="ag7" color={theme.text ?? '#1A1A1A'}>
        Evolución del peso
      </AppText>

      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
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
