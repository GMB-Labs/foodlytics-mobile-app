import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { BarChart } from 'react-native-chart-kit';

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
  const labels = data.map(w => w.label);
  const values = data.map(w => w.value);

  return (
    <View style={styles.card}>
      <AppText variant="ag7" color="#1A1A1A">
        Cumplimiento semanal
      </AppText>

      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={screenWidth - 40}   // card width (padding 20 a cada lado)
          height={200}
          fromZero
          yAxisLabel=""
          yAxisSuffix="%"
          segments={4}               // 0, 25, 50, 75, 100 aprox
          showBarTops={true}
          withHorizontalLabels 
          showValuesOnTopOfBars={false}
          xLabelsOffset={-4}         // centra mejor "Sem 1", "Sem 2", etc
          yLabelsOffset={8}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            backgroundGradientFromOpacity: 1,
            backgroundGradientToOpacity: 1,
            decimalPlaces: 0,
            color: () => '#2FCCAC',        // barras
            labelColor: () => '#6A7282',   // labels ejes, más oscuro
            propsForBackgroundLines: {
              stroke: '#E5E7EB',
              strokeDasharray: '3 5',
              strokeWidth: 1
              
            },
            barPercentage: 0.7,            // barras más gruesas
            propsForLabels: {
              fontSize: 11,
            },
          }}
          style={styles.chart}
        />
      </View>
    </View>
  );
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
    marginLeft: -20,
    marginTop: 12,
    borderRadius: 1,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 8,
  },
});
