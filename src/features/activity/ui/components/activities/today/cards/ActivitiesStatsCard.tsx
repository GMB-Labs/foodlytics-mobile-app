import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';

type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: 'Baja' | 'Moderada' | 'Alta';
  calories: number;
};

type Props = {
  activities: Activity[];
};

export default function ActivitiesStatsCard({ activities }: Props) {
  const totalActivities = activities.length;
  const totalCalories = activities.reduce((s, a) => s + (a.calories || 0), 0);
  const avgPerSession = totalActivities > 0 ? Math.round(totalCalories / totalActivities) : 0;

  const freq: Record<string, number> = {};
  activities.forEach((a) => {
    freq[a.name] = (freq[a.name] || 0) + 1;
  });
  const favorite = Object.keys(freq).length ? Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0] : '-';

  return (
    <View style={styles.card}>
      <AppText variant="ag7" color="#0F172A">Estadísticas de actividad</AppText>

      <View style={{ height: 12 }} />

      <View style={styles.row}>
        <AppText variant="ag9" color="#9CA3AF">Total actividades</AppText>
        <AppText variant="ag8" color="#0F172A">{`${totalActivities}`}</AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="ag9" color="#9CA3AF">Calorías quemadas (total)</AppText>
        <AppText variant="ag8" color="#0F172A">{`${totalCalories} kcal`}</AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="ag9" color="#9CA3AF">Promedio por sesión</AppText>
        <AppText variant="ag8" color="#0F172A">{`${avgPerSession} kcal`}</AppText>
      </View>

      <View style={styles.row}>
        <AppText variant="ag9" color="#9CA3AF">Actividad favorita</AppText>
        <AppText variant="ag8" color="#0F172A">{`${favorite}`}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
